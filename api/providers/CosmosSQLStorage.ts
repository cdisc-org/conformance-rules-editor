import { CosmosClient, SqlParameter } from "@azure/cosmos";
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

const getRule = async (id: string): Promise<IRule> => {
  const rule = (await dbContainer.item(id, id).read()).resource;
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
  const select = {};
  for (const selectItem of query.select.map((column) => jsonName(column))) {
    buildJSON(select, selectItem, `${rulesAlias}1${dotsToSquares(selectItem)}`);
  }
  return select;
}

function splitSubqueryNames(name: string) {
  /**
   * Creates a array containing a new element every time an array is encountered.
   * For example,
   * converts: "json.Authorities.Standards.References.Rule Identifier.Id"
   * to: [
   *    "json.Authorities",
   *    "Standards",
   *    "References",
   *    "Rule Identifier.Id"
   * ]
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
   * Handles joins and filters for nested arrays. For example:
   *  SELECT Rules1.json
   *  FROM Rules1
   *  JOIN Rules2 IN Rules1["json"]["Authorities"]
   *  JOIN Rules3 IN Rules2["Standards"]
   *  JOIN Rules4 IN Rules3["References"]
   *  WHERE CONTAINS(Rules4["Rule_Identifier"]["Id"], "CG0", true)
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
  var filters = "";
  for (const filter of query.filters) {
    const subqueryNames = splitSubqueryNames(filter.name);
    for (const [subqueryIndex, subqueryName] of subqueryNames
      .filter((_, subqueryIndex) => subqueryIndex < subqueryNames.length - 1)
      .entries()) {
      joins = `${joins} JOIN ${rulesAlias}${aliasIndex + 1} IN ${rulesAlias}${
        subqueryIndex === 0 ? "1" : aliasIndex
      }${sqlName(subqueryName)}`;
      aliasIndex = aliasIndex + 1;
    }
    const filterParam = operations[filter.operator](
      subqueryNames[subqueryNames.length - 1],
      filter.value,
      `${rulesAlias}${aliasIndex}`
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
  const date = new Date().toJSON();
  try {
    const toPatch = [
      { op: "replace" as const, path: "/changed", value: date },
      ...("content" in rule
        ? [
            {
              op: "replace" as const,
              path: "/content",
              value: rule.content,
            },
          ]
        : []),
      ...("content" in rule
        ? [
            {
              op: "replace" as const,
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
    changed: date,
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
  getRule,
  getRules,
  maxCoreId,
  patchRule,
  postRule,
};
