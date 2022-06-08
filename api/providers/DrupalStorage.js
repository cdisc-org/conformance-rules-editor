const fetch = require("node-fetch");
const { StorageAuthenticator } = require("../utils/AuthService");
const url = `https://${process.env["API_BASE_URL"]}`;
const {
  yamlToJSON,
  jsonToYAML,
  resolvePath,
  buildJSON,
} = require("../utils/json_yaml");

exports.deleteRule = async (id) => {
  const token = await StorageAuthenticator.getToken();
  const path = `${url}/jsonapi/node/conformance_rule/${id}`;
  const options = {
    method: "DELETE",
    headers: {
      Authorization: "Bearer " + token,
      "Content-Type": "application/vnd.api+json",
    },
  };
  const res = await fetch(path, options);
  return {
    status: res.statusCode,
    body: res.statusMessage,
  };
};

exports.getRule = async (id) => {
  const token = await StorageAuthenticator.getToken();
  const path = `${url}/jsonapi/node/conformance_rule/${id}`;
  const options = {
    method: "GET",
    headers: {
      Authorization: "Bearer " + token,
    },
  };
  return fetchRuleFromDrupal(path, options);
};

exports.getRules = async (query) => {
  let params = {};
  // limit
  params["page[limit]"] = query.limit || 50;
  // offset
  params = { ...params, ...(query.offset && { "page[offset]": query.offset }) };
  // sort order
  params = {
    ...params,
    ...(query.orderBy && {
      sort:
        (query.order === "desc" ? "-" : "") + genericToDrupal[query.orderBy],
    }),
  };
  // select
  params["fields[node--conformance_rule]"] = query.select
    .map((generic) => genericToDrupal[generic])
    .join(",");
  // filter
  for (const filter of query.filters) {
    params[`filter[${genericToDrupal[filter.name]}][operator]`] = "CONTAINS";
    params[`filter[${genericToDrupal[filter.name]}][value]`] = filter.value;
  }
  // request
  const token = await StorageAuthenticator.getToken();
  const path = `${url}/jsonapi/node/conformance_rule?${new URLSearchParams(
    params
  )}`;
  const options = {
    method: "GET",
    headers: {
      Authorization: "Bearer " + token,
    },
  };
  return fetchRulesFromDrupal(query, path, options);
};

exports.patchRule = async (id, rule) => {
  const token = await StorageAuthenticator.getToken();
  const path = `${url}/jsonapi/node/conformance_rule/${id}`;
  const options = {
    method: "PATCH",
    headers: {
      Authorization: "Bearer " + token,
      Accept: "application/vnd.api+json",
      "Content-Type": "application/vnd.api+json",
    },
    body: JSON.stringify({
      data: {
        id: id,
        type: "node--conformance_rule",
        attributes: {
          ...("content" in rule && yamlToDrupal(rule.content)),
          ...("isPublished" in rule && { status: rule.isPublished }),
        },
      },
    }),
  };
  return fetchRuleFromDrupal(path, options);
};

exports.postRule = async (content, creator) => {
  const token = await StorageAuthenticator.getToken();
  const path = `${url}/jsonapi/node/conformance_rule`;
  const options = {
    method: "POST",
    headers: {
      Authorization: "Bearer " + token,
      Accept: "application/vnd.api+json",
      "Content-Type": "application/vnd.api+json",
    },
    body: JSON.stringify({
      data: {
        type: "node--conformance_rule",
        attributes: {
          ...yamlToDrupal(content),
          field_conformance_rule_creator: creator,
          status: false,
        },
      },
    }),
  };
  return fetchRuleFromDrupal(path, options);
};

const genericToDrupal = {
  "content.Core.Id": "title",
  "content.Rule Type": "field_conformance_rule_type",
  creator: "field_conformance_rule_creator",
  id: "id",
  isPublished: "status",
  created: "created",
  changed: "changed",
  content: "body.value",
};

const drupalToGeneric = {
  "attributes.title": "content.Core.Id",
  "attributes.field_conformance_rule_type": "content.Rule Type",
  "attributes.field_conformance_rule_creator": "creator",
  id: "id",
  "attributes.status": "isPublished",
  "attributes.created": "created",
  "attributes.changed": "changed",
  "attributes.body.value": "content",
};

function yamlToDrupal(content) {
  const rule = yamlToJSON(content);
  let attributes = {};
  for (const [drupal, generic] of Object.entries(
    drupalToGeneric
  ).filter(([, generic]) => generic.startsWith("content."))) {
    buildJSON(
      attributes,
      drupal.replace("attributes.", ""),
      resolvePath(rule, generic.replace("content.", ""))
    );
  }
  attributes.body = { value: content };
  return attributes;
}

function drupalToRule(rule) {
  let content = null;
  if ("body" in rule.attributes) {
    content = rule.attributes.body.value;
  } else {
    content = {};
    for (const [drupal, generic] of Object.entries(
      drupalToGeneric
    ).filter(([, generic]) => generic.startsWith("content."))) {
      buildJSON(
        content,
        generic.replace("content.", ""),
        resolvePath(rule, drupal)
      );
    }
    content = jsonToYAML(content);
  }
  const resp = {
    content: content,
    ...Object.fromEntries(
      Object.entries(drupalToGeneric)
        .filter(([, generic]) => !generic.startsWith("content"))
        .map(([drupal, generic]) => {
          return [generic, resolvePath(rule, drupal)];
        })
    ),
  };
  return resp;
}

async function fetchRuleFromDrupal(path, options) {
  const responseJson = await (await fetch(path, options)).json();
  return drupalToRule(responseJson.data);
}

async function fetchRulesFromDrupal(query, path, options) {
  const responseJson = await (await fetch(path, options)).json();
  const resp = {
    rules: responseJson.data.map((rule) => drupalToRule(rule)),
  };
  if (responseJson.links.next) {
    const params = new URL(responseJson.links.next.href).searchParams;
    query.limit = params.get("page[limit]");
    query.offset = params.get("page[offset]");
    resp.next = query;
  }
  return resp;
}
