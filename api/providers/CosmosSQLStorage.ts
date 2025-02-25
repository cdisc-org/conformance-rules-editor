import {
  Container,
  CosmosClient,
  ItemResponse,
  PatchOperationType,
  SqlParameter,
} from "@azure/cosmos";
import { IQuery } from "../types/IQuery";
import { IRule } from "../types/IRule";
import { IRules } from "../types/IRules";
import { ruleArrays } from "../utils/Consts";
import {
  yamlToJSON,
  spacesToUnderscores,
  sqlName,
  paramName,
} from "../utils/json_yaml";

interface Operation {
  (name: string, value: any, collectionAlias: string): {
    filter: string;
    parameters: SqlParameter[];
  };
}

const database = new CosmosClient({
  endpoint: `https://${process.env["COSMOS_BASE_URL"]}`,
  key: process.env["COSMOS_KEY"],
  userAgentSuffix: "ConformanceRulesEditor",
}).database(process.env["COSMOS_DATABASE"]);

const rulesContainer = database.container(process.env["COSMOS_CONTAINER"]);
const rulesHistoryContainer = database.container(
  process.env["COSMOS_HISTORY_CONTAINER"]
);

const _getRule = async (id: string, container: Container): Promise<IRule> => {
  const ruleQuery = `
      SELECT
        VALUE Rule
      FROM
        Rule
      WHERE
        Rule ["id"] = "${id}"
    `;
  return (await container.items.query(ruleQuery).fetchNext()).resources[0];
};

const _patchRule = async (rule: IRule): Promise<ItemResponse<IRule>> => {
  if ("content" in rule) {
    rule.json = spacesToUnderscores(yamlToJSON(rule.content) ?? {});
  }
  rule.created = new Date().toJSON();
  /* Backup new rule*/
  const ruleCopy = { ...rule };
  delete ruleCopy.id;
  const history: IRule = (await rulesHistoryContainer.items.create(ruleCopy))
    .resource;
  /* Patch existing rule */
  const toPatch = [
    { op: PatchOperationType.replace, path: "/created", value: rule.created },
    {
      op: PatchOperationType.replace,
      path: "/creator",
      value: { id: rule.creator.id },
    },
    {
      op: PatchOperationType.add,
      path: "/history/0",
      value: {
        created: history["created"],
        creator: history["creator"],
        id: history["id"],
      },
    },
    ...("content" in rule
      ? [
          {
            op: PatchOperationType.replace,
            path: "/content",
            value: rule.content,
          },
        ]
      : []),
    ...("content" in rule
      ? [
          {
            op: PatchOperationType.replace,
            path: "/json",
            value: rule.json,
          },
        ]
      : []),
  ];
  return rulesContainer.item(rule.id, rule.id).patch(toPatch);
};

const deleteRule = async (
  rule: IRule
): Promise<{
  status: number;
}> => {
  try {
    const id = rule.id;
    delete rule.id;
    (await rulesHistoryContainer.items.create(rule)).resource;
    const res = await rulesContainer.item(id, id).delete();
    return {
      status: res.statusCode,
    };
  } catch (error) {
    console.error(error);
  }
};

const getHistory = async (id: string): Promise<IRule> => {
  const rule = await _getRule(id, rulesHistoryContainer);
  return rule;
};

const getRule = async (id: string): Promise<IRule> => {
  const rule = await _getRule(id, rulesContainer);
  return rule;
};

const rulesAlias = "Rules";

const containsOperation: Operation = (name, value: string | number, collectionAlias) => {
    // If it's a custom path (starts with custom.)
    if (name.startsWith('custom.')) {
      const path = name.split('.');
      path.shift();
      
      const arrayIndices = path
        .map((segment, index) => segment.startsWith('@') ? index : -1)
        .filter(index => index !== -1);
  
      if (arrayIndices.length === 0) {
        // No arrays in path, use simple CONTAINS
        const propertyPath = path.join('.');
        return {
          filter: `CONTAINS(${collectionAlias}["json"]${sqlName(propertyPath)}, ${paramName(name)}, true)`,
          parameters: [{ name: paramName(name), value: value }],
        };
      }
  
      // Handle paths with arrays
      const basePath = path.slice(0, arrayIndices[0]).join('.');
      let joins = [];
      let currentAlias = 'arrayItem1';
      let previousAlias = '';
  
      for (let i = 0; i < arrayIndices.length; i++) {
        const arrayName = path[arrayIndices[i]].substring(1);
        const previousPath = i === 0 
          ? `${collectionAlias}["json"]${basePath ? sqlName(basePath) : ''}`
          : previousAlias;
        joins.push(`${currentAlias} IN ${previousPath}["${arrayName}"]`);
        
        if (i < arrayIndices.length - 1) {
          previousAlias = currentAlias;
          currentAlias = `arrayItem${i + 2}`;
        }
      }
  
      const propertyPath = path.slice(arrayIndices[arrayIndices.length - 1] + 1).join('.');
      const paramPath = path.map(segment => segment.startsWith('@') ? segment.substring(1) : segment).join('.');
  
      return {
        filter: `EXISTS (SELECT VALUE ${currentAlias} FROM ${joins.join(" JOIN ")} WHERE CONTAINS(${currentAlias}["${propertyPath}"], ${paramName(paramPath)}, true))`,
        parameters: [{ name: paramName(paramPath), value: value }],
      };
    }
    
    // For non-custom paths, use the original logic
    return {
      filter: `CONTAINS(${collectionAlias}${sqlName(name)}, ${paramName(name)}, true)`,
      parameters: [
        {
          name: paramName(name),
          value: value,
        },
      ],
    };
  };

const inOperation: Operation = (
  name,
  value: string[] | number[],
  collectionAlias
) => {
  return {
    filter: `${collectionAlias}${sqlName(name)} IN (${[...value.keys()]
      .map((index: number) => `${paramName(name)}${index}`)
      .join(",")})`,
    parameters: value.map((param, index) => ({
      name: `${paramName(name)}${index}`,
      value: param,
    })),
  };
};

function parseCustomPath(path: string) {
  const segments = path.split('.');
  const arrayIndices = segments
      .map((segment, index) => segment.startsWith('@') ? index : -1)
      .filter(index => index !== -1);
  
  if (arrayIndices.length === 0) {
    return {
      select: segments.reduce((path, segment) => 
        `${path}["${segment}"]`, 
        `${rulesAlias}1["json"]`
      ),
      filterInfo: null,
      finalAlias: 1
    };
  }

  let basePath = segments.slice(0, arrayIndices[0]).reduce((path, segment) => 
    `${path}["${segment}"]`, 
    `${rulesAlias}1["json"]`
  );

  let joins = [];
  let currentAlias = 2;
  let previousAlias = 1;

  for (let i = 0; i < arrayIndices.length; i++) {
      const arrayName = segments[arrayIndices[i]].substring(1);
      const alias = `${rulesAlias}${currentAlias}`;
      const previousPath = i === 0 ? basePath : `${rulesAlias}${previousAlias}`;
      
      joins.push(`${alias} IN ${previousPath}["${arrayName}"]`);
      
      if (i < arrayIndices.length - 1) {
          previousAlias = currentAlias;
          currentAlias++;
      }
  }

  const finalProperty = segments.slice(arrayIndices[arrayIndices.length - 1] + 1).join('.');
  const lastAlias = `${rulesAlias}${currentAlias}`;
  
  return {
      select: `ARRAY(SELECT DISTINCT VALUE ${lastAlias}["${finalProperty}"] FROM ${joins.join(" JOIN ")})`,
      filterInfo: {
          joins,
          alias: lastAlias,
          property: finalProperty
      },
      finalAlias: currentAlias
  };
}

function buildSelect(query: IQuery, aliasIndex: number) {
  /**
   * For example,
   *
   * SELECT DISTINCT
   *   ARRAY(
   *     SELECT
   *       DISTINCT VALUE Rules10["Rule_Identifier"]["Id"]
   *     FROM
   *       Rules8 IN Rules1["json"]["Authorities"]
   *       JOIN Rules9 IN Rules8["Standards"]
   *       JOIN Rules10 IN Rules9["References"]
   *   ) AS "json.Authorities.Standards.References.Rule Identifier.Id",
   *   Rules1["creator"]["id"] as "creator.id",
   *   ARRAY(
   *     SELECT
   *       DISTINCT VALUE Rules9["Name"]
   *     FROM
   *       Rules8 IN Rules1["json"]["Authorities"]
   *       JOIN Rules9 IN Rules8["Standards"]
   *   ) AS "json.Authorities.Standards.Name",
   *   ARRAY(
   *     SELECT
   *       DISTINCT VALUE Rules8["Organization"]
   *     FROM
   *       Rules8 IN Rules1["json"]["Authorities"]
   *   ) AS "json.Authorities.Organization",
   *   Rules1["json"]["Core"]["Id"] as "json.Core.Id",
   *   Rules1["json"]["Core"]["Status"] as "json.Core.Status",
   *   Rules1["created"] as "created",
   *   Rules1["id"] as "id"
   *
   * Note that we need to select from the root of the document,
   * which has the first alias (Rules1) in the FROM clause
   */
  console.log("Query select:", query.select);
  const select = [];
  if (!query.select.includes("id")) {
    /* id is needed in order to maintain one result per rule item */
    query.select.push("id");
  }
  for (const selectItem of query.select) {
    if (selectItem.startsWith('custom.')) {
      const jsonPath = selectItem.replace('custom.', '');
      const { select: path, finalAlias } = parseCustomPath(jsonPath);
      select.push(`${path} as "${selectItem}"`);
      aliasIndex = Math.max(aliasIndex, finalAlias);
      continue;
    }

    const subqueryNames = splitSubqueryNames(selectItem);
    console.log("Subquery names for", selectItem, ":", subqueryNames);
    if (subqueryNames.length === 1) {
      select.push(`${rulesAlias}1${sqlName(selectItem)} as "${selectItem}"`);
    } else {
      var joins = [];
      var subqueryAliasIndex = aliasIndex;
      for (const [subqueryIndex, subqueryName] of subqueryNames
        .slice(0, -1)
        .entries()) {
        joins.push(
          `${rulesAlias}${subqueryAliasIndex + 1} IN ${rulesAlias}${
            subqueryIndex === 0 ? "1" : subqueryAliasIndex
          }${sqlName(subqueryName)}`
        );
        subqueryAliasIndex++;
      }
      select.push(
        `ARRAY(SELECT DISTINCT VALUE Rules${subqueryAliasIndex}${sqlName(
          subqueryNames[subqueryNames.length - 1]
        )} FROM ${joins.join(" JOIN ")}) AS "${selectItem}"`
      );
    }
  }
  return select.join(", ");
}

function splitSubqueryNames(name: string) {
  /**
   * Creates an array containing a new element every time an array is encountered.
   * For example,
   * converts: "json.Authorities.Standards.References.Rule Identifier.Id"
   * to: [
   *    "json.Authorities",
   *    "Standards",
   *    "References",
   *    "Rule Identifier.Id"
   * ]
   *
   * Useful because will need a new self JOIN clause every time a nested array is encountered.
   */
  console.log("Splitting name:", name);
  return name.split(".").reduce(
    (previousValue: string[], currentValue: string) => {
      const previousName = previousValue[previousValue.length - 1];
      previousValue[previousValue.length - 1] = `${previousName}${
        previousName === "" ? "" : "."
      }${currentValue}`;
      if (ruleArrays.has(previousValue.join("."))) {
        previousValue.push("");
      }
      return previousValue;
    },
    [""]
  );
}

function buildJoinsAndFilters(query: IQuery) {
  /**
   * Handles self JOINS and filters for nested arrays. For example:
   *
   * SELECT Rules1.json
   * FROM Rules1
   * JOIN Rules2 IN Rules1["json"]["Authorities"]
   * JOIN Rules3 IN Rules2["Standards"]
   * JOIN Rules4 IN Rules3["References"]
   * WHERE CONTAINS(Rules4["Rule_Identifier"]["Id"], "CG0", true)
   *
   * Refer to:
   * https://learn.microsoft.com/en-us/azure/cosmos-db/nosql/query/join#self-joining-multiple-items
   */
  const operations: {
    [operator: string]: Operation;
  } = {
    contains: containsOperation,
    in: inOperation,
  };
  const filterParams: SqlParameter[] = [];
  var joins = "";
  var filters = "";

  for (const filter of query.filters) {
    if (filter.name.includes('@')) {
      const filterParam = operations[filter.operator](
        filter.name,
        filter.value,
        'Rules1'
      );
      filters = `${filters}${filters === "" ? " WHERE" : " AND"} ${filterParam.filter}`;
      filterParams.push(...filterParam.parameters);
    } else {
      const subqueryNames = splitSubqueryNames(filter.name);
      if (subqueryNames.length === 1) {
        const filterParam = operations[filter.operator](
          filter.name,
          filter.value,
          'Rules1'
        );
        filters = `${filters}${filters === "" ? " WHERE" : " AND"} ${filterParam.filter}`;
        filterParams.push(...filterParam.parameters);
      } else {
        let subqueryJoins = [];
        for (const [subqueryIndex, subqueryName] of subqueryNames.slice(0, -1).entries()) {
          const currentAlias = `SubRules${subqueryIndex + 1}`;
          const previousAlias = subqueryIndex === 0 ? 'Rules1' : `SubRules${subqueryIndex}`;
          subqueryJoins.push(`${currentAlias} IN ${previousAlias}${sqlName(subqueryName)}`);
        }

        const lastAlias = `SubRules${subqueryNames.length - 1}`;
        const lastProperty = subqueryNames[subqueryNames.length - 1];
        
        filters = `${filters}${filters === "" ? " WHERE" : " AND"} EXISTS (SELECT VALUE ${lastAlias} FROM ${subqueryJoins.join(" JOIN ")} WHERE CONTAINS(${lastAlias}${sqlName(lastProperty)}, ${paramName(filter.name)}, true))`;
        filterParams.push({ name: paramName(filter.name), value: filter.value });
      }
    }
  }

  return { joins, filters, filterParams, aliasIndex: 1 };
}

function buildOrderBy(query: IQuery) {
  return query.orderBy
    ? ` ORDER BY ${rulesAlias}1${sqlName(query.orderBy)} ${
        query.order === "desc" ? "DESC" : "ASC"
      }`
    : "";
}

function buildOffset(query: IQuery) {
  const offset = query.offset == null ? 0 : query.offset;
  return { offset, offsetParam: { name: "@offset", value: offset } };
}

function buildLimit(query: IQuery) {
  const limit = query.limit == null ? 50 : query.limit;
  return {
    limit,
    limitParam: {
      name: "@limit",
      value: query.limit == null ? 50 : query.limit,
    },
  };
}

const getRules = async (query: IQuery): Promise<IRules> => {
  var { joins, filters, filterParams, aliasIndex } = buildJoinsAndFilters(
    query
  );
  aliasIndex++;
  const select = buildSelect(query, aliasIndex);
  const orderBy = buildOrderBy(query);
  const { offset, offsetParam } = buildOffset(query);
  const { limit, limitParam } = buildLimit(query);

  const querySpec = {
    parameters: [...filterParams, offsetParam, limitParam],
    query: `SELECT DISTINCT ${select} FROM ${rulesAlias}1${joins}${filters}${orderBy} OFFSET @offset LIMIT @limit`,
  };
  console.log(querySpec);
  try {
    const results = await rulesContainer.items.query(querySpec).fetchAll();
    const resp = {
      rules: results.resources,
      ...(results.resources.length === limit && {
        next: { ...query, offset: offset + limit, limit: limit },
      }),
    };
    console.log("response: ", resp)
    return resp;
  } catch (error) {
    console.error(error);
  }
};

const maxCoreId = async (): Promise<string> => {
  const query = `
    SELECT VALUE root
    FROM (
    SELECT MAX(rules.json.Core.Id) ?? "CORE-000000"
    AS CoreId
    FROM rules
    WHERE rules.json.Core.Id 
    LIKE "CORE-______"
    ) root
  `;
  return (await rulesHistoryContainer.items.query(query).fetchNext())
    .resources[0]["CoreId"];
};

const patchRule = async (rule: IRule): Promise<IRule> => {
  console.log("database patchRule ", rule);
  try {
    const patchedRule = (await _patchRule(rule)).resource;
    return patchedRule;
  } catch (error) {
    console.error(error);
  }
};

const postRule = async (content: string, creatorId: string): Promise<IRule> => {
  console.log("database postRule ", content);
  const date = new Date().toJSON();
  const toCreate = {
    content,
    created: date,
    creator: { id: creatorId },
    json: spacesToUnderscores(yamlToJSON(content) ?? {}),
  };
  const history = (await rulesHistoryContainer.items.create(toCreate)).resource;
  toCreate["history"] = [
    {
      created: history["created"],
      creator: history["creator"],
      id: history["id"],
    },
  ];
  const rule = (await rulesContainer.items.create(toCreate)).resource;
  return rule;
};

export default {
  deleteRule,
  getHistory,
  getRule,
  getRules,
  maxCoreId,
  patchRule,
  postRule,
};
