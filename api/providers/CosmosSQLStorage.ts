import { CosmosClient, SqlParameter } from "@azure/cosmos";
import { IQuery } from "../types/IQuery";
import { IRule } from "../types/IRule";
import { IRules } from "../types/IRules";
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

const getRules = async (query: IQuery): Promise<IRules> => {
  const rulesAlias = "Rules";
  const parameters: SqlParameter[] = [];

  const operations: {
    [operator: string]: (
      name: string,
      value
    ) => {
      filter: string;
      parameters: SqlParameter[];
    };
  } = {
    contains: (name, value) => ({
      filter: `CONTAINS(${rulesAlias}${sqlName(name)}, ${paramName(
        name
      )}, true)`,
      parameters: [
        {
          name: paramName(name),
          value: value,
        },
      ],
    }),
    in: (name, value) => ({
      filter: `${rulesAlias}${sqlName(name)} IN (${[...value.keys()]
        .map((index: number) => `${paramName(name)}${index}`)
        .join(",")})`,
      parameters: value.map((param, index) => ({
        name: `${paramName(name)}${index}`,
        value: param,
      })),
    }),
  };

  // select
  const select = {};
  for (const selectItem of query.select.map((column) => jsonName(column))) {
    buildJSON(select, selectItem, `${rulesAlias}${dotsToSquares(selectItem)}`);
  }

  // filter
  var filters = "";
  for (const filter of query.filters) {
    const filterParam = operations[filter.operator](filter.name, filter.value);
    filters = `${filters}${filters === "" ? " WHERE" : " AND"} ${
      filterParam.filter
    }`;
    parameters.push(...filterParam.parameters);
  }

  //sort order
  const orderBy = query.orderBy
    ? ` ORDER BY ${rulesAlias}${sqlName(query.orderBy)} ${
        query.order === "desc" ? "DESC" : "ASC"
      }`
    : "";

  //offset
  const offset = query.offset == null ? 0 : query.offset;
  parameters.push({ name: "@offset", value: offset });

  //limit
  const limit = query.limit == null ? 50 : query.limit;
  parameters.push({ name: "@limit", value: limit });

  const querySpec = {
    parameters,
    query: `SELECT ${jsonToQuery(
      select
    )} FROM ${rulesAlias}${filters}${orderBy} OFFSET @offset LIMIT @limit`,
  };

  //request
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
    console.log(error);
  }
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
              value: spacesToUnderscores(yamlToJSON(rule.content)),
            },
          ]
        : []),
      ...("isPublished" in rule
        ? [
            {
              op: "replace" as const,
              path: "/isPublished",
              value: rule.isPublished,
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
    isPublished: false,
    json: spacesToUnderscores(yamlToJSON(content) ?? {}),
  };
  const rule = (await dbContainer.items.create(toCreate)).resource;
  return rule;
};

export default {
  deleteRule,
  getRule,
  getRules,
  patchRule,
  postRule,
};
