import { parseDocument, YAMLMap, YAMLSeq } from "yaml";
import jsYaml from "js-yaml";
import { coreIDPattern } from "../utils/Consts";

export const jsonToYAML = (body) => {
  try {
    return jsYaml.dump(body);
  } catch (yamlException) {
    return undefined;
  }
};

export const yamlToJSON = (body) => {
  try {
    return jsYaml.load(body);
  } catch (yamlException) {
    return undefined;
  }
};

const pathReducer = (parents: any[], childName: string) => {
  return parents
    .filter((parent) => parent)
    .flatMap((parent) =>
      Array.isArray(parent)
        ? parent.map((child) => child[childName])
        : parent[childName]
    );
};

export const resolvePath = (
  object,
  path,
  defaultValue = `<Missing '${path}'>`
) =>
  isValidYaml(object)
    ? [...new Set(path.split(".").reduce(pathReducer, [object]))].join(", ")
    : defaultValue;

export const resolveYAMLPath = (
  yaml: string,
  path: string[],
  defaultValue = `<Missing '${path}'>`
) => {
  try {
    return parseDocument(yaml).getIn(path).toString() ?? defaultValue;
  } catch (yamlException) {
    return defaultValue;
  }
};

export const replaceYAMLPath = (
  yaml: string,
  path: string[],
  replacement: any
) => {
  try {
    const doc = parseDocument(yaml);
    doc.setIn(path, replacement);
    return doc.toString();
  } catch (yamlException) {
    return yaml;
  }
};

export const buildJSON = (object, path, value) => {
  const split = path.split(".");
  let child = object;
  for (const [i, prop] of split.entries()) {
    if (i === split.length - 1) {
      child[prop] = value;
    } else {
      child[prop] = child[prop] ?? {};
      child = child[prop];
    }
  }
  return object;
};

export const dotsToSquares = (dot) =>
  dot
    .split(".")
    .map((term) => `["${term}"]`)
    .join("");

export const traverseJson = (json, func) => {
  if (json !== null && typeof json === "object") {
    for (const value of Object.values(json)) {
      traverseJson(value, func);
    }
  }
  func(json);
  return json;
};

export const underscoresToSpaces = (json) => replaceKeyNames(json, "_", " ");

export const spacesToUnderscores = (json) => replaceKeyNames(json, " ", "_");

export const jsonToQuery = (json) => {
  if (json instanceof Object) {
    const objectString = Object.entries(json).reduce(
      (previousValue, [currentKey, currentValue]) =>
        `${previousValue}${
          previousValue ? ", " : ""
        }"${currentKey}": ${jsonToQuery(currentValue)}`,
      ""
    );
    return `{ ${objectString} }`;
  } else if (typeof json === "string") {
    return json;
  }
  throw new Error("Invalid Query Type");
};

export const jsonName = (name: string): string => name.replace(/ /g, "_");

export const paramName = (name: string): string =>
  `@${jsonName(name).replace(/\./g, "_")}`;

export const sqlName = (name: string): string => dotsToSquares(jsonName(name));

function isValidYaml(rule) {
  return rule !== undefined && rule !== null && typeof rule === "object";
}

function replaceKeyNames(json, pattern, replacement) {
  return traverseJson(json, (node) => {
    if (node !== null && typeof node === "object" && !(node instanceof Array)) {
      const keys = Object.keys(node).filter((key) => key.includes(pattern));
      for (const key of keys) {
        const newKey = key.split(pattern).join(replacement);
        node[newKey] = node[key];
        delete node[key];
      }
    }
  });
}

const sortDeep = (node) => {
  if (node instanceof YAMLMap) {
    node.items.sort((a, b) => a.key.value.localeCompare(b.key.value));
    node.items.forEach((i) => sortDeep(i.value));
  } else if (node instanceof YAMLSeq) {
    node.items.forEach(sortDeep);
  }
};

export const formatYAML = (raw: string): string => {
  try {
    const doc = parseDocument(raw);
    sortDeep(doc.contents);
    return doc.toString();
  } catch (yamlException) {
    return raw;
  }
};

/**
 * remove current core id if it:
 * - matches the core id pattern
 * - does not match the previous saved core id
 * */
export const removeInvalidCoreid = (
  ruleAfterPatch: string,
  ruleBeforePatch = ""
) => {
  const idAfterPatch = resolveYAMLPath(ruleAfterPatch, ["Core", "Id"], "");
  const idBeforePatch = resolveYAMLPath(ruleBeforePatch, ["Core", "Id"], "");
  return coreIDPattern.test(idAfterPatch) && idAfterPatch !== idBeforePatch
    ? replaceYAMLPath(ruleAfterPatch, ["Core", "Id"], "")
    : ruleAfterPatch;
};

export const publish = async (
  rule: string,
  nextCoreId: () => Promise<string>
) => {
  const doc = parseDocument(rule);
  if (!doc.has("Core")) {
    doc.set("Core", doc.createNode({}));
  }
  const core: any = doc.get("Core");
  if (!coreIDPattern.test(core.get("Id") ?? "")) {
    core.set("Id", await nextCoreId());
  }
  core.set("Status", "Published");
  return doc.toString();
};

export const unpublish = (rule: string) => {
  const publishStatus = resolveYAMLPath(rule, ["Core", "Status"], "");
  return publishStatus === "Published"
    ? replaceYAMLPath(rule, ["Core", "Status"], "")
    : rule;
};
