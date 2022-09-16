import { CosmosClient } from "@azure/cosmos";
import {
  yamlToJSON,
  buildJSON,
  dotsToSquares,
  jsonToQuery,
  spacesToUnderscores,
  underscoresToSpaces,
} from "../utils/json_yaml";

const dbContainer = new CosmosClient({
  endpoint: `https://${process.env["COSMOS_BASE_URL"]}`,
  key: process.env["COSMOS_KEY"],
  userAgentSuffix: "ConformanceRulesEditor",
})
  .database(process.env["COSMOS_DATABASE"])
  .container(process.env["COSMOS_CONTAINER"]);

const deleteRule = async (id) => {
  const res = await dbContainer.item(id, id).delete();
  return {
    status: res.statusCode,
  };
};

const getRule = async (id) => {
  const rule = (await dbContainer.item(id, id).read()).resource;
  return rule;
};

const getRules = async (query) => {
  const rulesAlias = "Rules";
  const parameters = [];

  // select
  const select = {};
  for (const selectItem of query.select.map((column) =>
    column.replace(/ /g, "_")
  )) {
    buildJSON(select, selectItem, `${rulesAlias}${dotsToSquares(selectItem)}`);
  }

  // filter
  const filters = query.filters.reduce(
    (previousValue, currentValue) =>
      `${previousValue}${
        previousValue === "" ? " WHERE" : " AND"
      } CONTAINS(${rulesAlias}${dotsToSquares(
        currentValue.name.replace(/ /g, "_")
      )}, @${currentValue.name.replace(/ /g, "_").replace(/\./g, "_")}, true)`,
    ""
  );
  parameters.push(
    ...query.filters.map((filter) => ({
      name: `@${filter.name.replace(/ /g, "_").replace(/\./g, "_")}`,
      value: filter.value,
    }))
  );

  //sort order
  const orderBy = query.orderBy
    ? ` ORDER BY ${rulesAlias}${dotsToSquares(
        query.orderBy.replace(/ /g, "_")
      )} ${query.order === "desc" ? "DESC" : "ASC"}`
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
};

const patchRule = async (id, rule) => {
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

const postRule = async (content, creator) => {
  const date = new Date().toJSON();
  const toCreate = {
    changed: date,
    content,
    created: date,
    creator,
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
