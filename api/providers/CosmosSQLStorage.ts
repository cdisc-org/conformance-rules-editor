import { CosmosClient, PatchOperationType, SqlParameter } from "@azure/cosmos";
import { IQuery } from "../types/IQuery";
import { IRule } from "../types/IRule";
import { IRules } from "../types/IRules";
import { ruleArrays } from "../utils/Consts";
import {
  yamlToJSON,
  buildJSON,
  dotsToSquares,
  jsonToQuery,
  spacesToUnderscores,
  underscoresToSpaces,
  sqlName,
  paramName,
  jsonName,
} from "../utils/json_yaml";

interface Operation {
  (name: string, value: any, collectionAlias: string): {
    filter: string;
    parameters: SqlParameter[];
  };
}

const dbContainer = new CosmosClient({
  endpoint: `https://${process.env["COSMOS_BASE_URL"]}`,
  key: process.env["COSMOS_KEY"],
  userAgentSuffix: "ConformanceRulesEditor",
})
  .database(process.env["COSMOS_DATABASE"])
  .container(process.env["COSMOS_CONTAINER"]);

const deleteRule = async (
  id: string
): Promise<{
  status: number;
}> => {
  const res = await dbContainer.item(id, id).delete();
  return {
    status: res.statusCode,
  };
};

const _getRule = async (id: string, version?: string): Promise<IRule> => {
  const ruleQuery = version
    ? `
      SELECT
        VALUE Rule
      FROM
        Rule
      WHERE
        "${id}" in (Rule ["id"], Rule ["latestId"])
      AND
        Rule ["created"] = "${version}"
      ORDER BY
        Rule["created"] DESC
    `
    : `
      SELECT
        VALUE Rule
      FROM
        Rule
      WHERE
        "${id}" in (Rule ["id"], Rule ["latestId"])
      ORDER BY
        Rule["created"] DESC
    `;
  const rulePromise = dbContainer.items.query(ruleQuery).fetchNext();
  const historyQuery = `
    SELECT
      VALUE {
        created: Rule ["created"],
        creator: Rule ["creator"],
        id: Rule ["id"]
      }
    FROM
      Rule
    WHERE
      "${id}" in (Rule ["id"], Rule["latestId"])
    ORDER BY
      Rule["created"] DESC  
  `;
  const historyPromise = dbContainer.items.query(historyQuery).fetchNext();
  const rule = {
    ...(await rulePromise).resources[0],
    history: (await historyPromise).resources,
  };
  return rule;
};

const rulesAlias = "Rules";

const containsOperation: Operation = (
  name,
  value: string | number,
  collectionAlias
) => {
  return {
    filter: `CONTAINS(${collectionAlias}${sqlName(name)}, ${paramName(
      name
    )}, true)`,
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

function buildSelect(query: IQuery) {
  /**
   * For example,
   *
   * SELECT {
   *   json: {
   *     Authorities: "Rules1[\"json\"][\"Authorities\"]",
   *     Core: {
   *       Id: "Rules1[\"json\"][\"Core\"][\"Id\"]",
   *       Status: "Rules1[\"json\"][\"Core\"][\"Status\"]",
   *     },
   *   },
   *   creator: {
   *     id: "Rules1[\"creator\"][\"id\"]",
   *   },
   *   created: "Rules1[\"created\"]",
   *   id: "Rules1[\"id\"]",
   * }
   *
   * Note that we need to select from the root of the document,
   * which has the first alias (Rules1) in the FROM clause
   */
  const select = {};
  for (const selectItem of query.select.map((column) => jsonName(column))) {
    buildJSON(select, selectItem, `${rulesAlias}1${dotsToSquares(selectItem)}`);
  }
  return select;
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
  var aliasIndex = 1;
  var filters = ` WHERE NOT IS_DEFINED(${rulesAlias}${aliasIndex}["latestId"])`;
  for (const filter of query.filters) {
    const subqueryNames = splitSubqueryNames(filter.name);
    for (const [subqueryIndex, subqueryName] of subqueryNames
      .slice(0, -1)
      .entries()) {
      joins = `${joins} JOIN ${rulesAlias}${aliasIndex + 1} IN ${rulesAlias}${
        subqueryIndex === 0 ? "1" : aliasIndex
      }${sqlName(subqueryName)}`;
      aliasIndex = aliasIndex + 1;
    }
    const filterParam = operations[filter.operator](
      subqueryNames[subqueryNames.length - 1],
      filter.value,
      `${rulesAlias}${subqueryNames.length === 1 ? "1" : aliasIndex}`
    );
    filters = `${filters}${filters === "" ? " WHERE" : " AND"} ${
      filterParam.filter
    }`;
    filterParams.push(...filterParam.parameters);
  }
  return { joins, filters, filterParams };
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
  const select = buildSelect(query);
  const { joins, filters, filterParams } = buildJoinsAndFilters(query);
  const orderBy = buildOrderBy(query);
  const { offset, offsetParam } = buildOffset(query);
  const { limit, limitParam } = buildLimit(query);

  const querySpec = {
    parameters: [...filterParams, offsetParam, limitParam],
    query: `SELECT DISTINCT ${jsonToQuery(
      select
    )} FROM ${rulesAlias}1${joins}${filters}${orderBy} OFFSET @offset LIMIT @limit`,
  };

  try {
    const results = await dbContainer.items.query(querySpec).fetchAll();
    const resp = {
      rules: results.resources.map((rule) => ({
        ...rule["$1"],
        json: underscoresToSpaces(rule["$1"].json),
      })),
      ...(results.resources.length === limit && {
        next: { ...query, offset: offset + limit, limit: limit },
      }),
    };
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
  return (await dbContainer.items.query(query).fetchNext()).resources[0][
    "CoreId"
  ];
};

const patchRule = async (id: string, rule: IRule): Promise<IRule> => {
  const previousRule = (await dbContainer.item(id, id).read()).resource;
  previousRule.latestId = id;
  delete previousRule.id;
  dbContainer.items.create(previousRule);
  const date = new Date().toJSON();
  try {
    const toPatch = [
      { op: PatchOperationType.replace, path: "/created", value: date },
      {
        op: PatchOperationType.replace,
        path: "/creator",
        value: { id: rule.creator.id },
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
              value: spacesToUnderscores(yamlToJSON(rule.content) ?? {}),
            },
          ]
        : []),
    ];
    const ruleFromCosmos = await dbContainer.item(id, id).patch(toPatch);
    return ruleFromCosmos.resource;
  } catch (error) {
    console.error(error);
  }
};

const postRule = async (content: string, creatorId: string): Promise<IRule> => {
  const date = new Date().toJSON();
  const toCreate = {
    content,
    created: date,
    creator: { id: creatorId },
    json: spacesToUnderscores(yamlToJSON(content) ?? {}),
  };
  const rule = (await dbContainer.items.create(toCreate)).resource;
  return rule;
};

export default {
  deleteRule,
  _getRule,
  getRules,
  maxCoreId,
  patchRule,
  postRule,
};
