const jsYaml = require("js-yaml");

exports.jsonToYAML = (body) => {
  try {
    return jsYaml.dump(body);
  } catch (yamlException) {
    return undefined;
  }
};

exports.yamlToJSON = (body) => {
  try {
    return jsYaml.load(body);
  } catch (yamlException) {
    return undefined;
  }
};

exports.resolvePath = (object, path, defaultValue = `<Missing '${path}'>`) =>
  isValidYaml(object)
    ? path.split(".").reduce((o, p) => (o ? o[p] : defaultValue), object)
    : defaultValue;

exports.buildJSON = (object, path, value) => {
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

exports.dotsToSquares = (dot) =>
  dot
    .split(".")
    .map((term) => `["${term}"]`)
    .join("");

exports.traverseJson = (json, func) => {
  if (json !== null && typeof json === "object") {
    for (const value of Object.values(json)) {
      this.traverseJson(value, func);
    }
  }
  func(json);
  return json;
};

exports.underscoresToSpaces = (json) => replaceKeyNames(json, "_", " ");

exports.spacesToUnderscores = (json) => replaceKeyNames(json, " ", "_");

exports.jsonToQuery = (json) => {
  if (json instanceof Object) {
    const objectString = Object.entries(json).reduce(
      (previousValue, [currentKey, currentValue]) =>
        `${previousValue}${
          previousValue ? ", " : ""
        }"${currentKey}": ${this.jsonToQuery(currentValue)}`,
      ""
    );
    return `{ ${objectString} }`;
  } else if (typeof json === "string") {
    return json;
  }
  throw new Error("Invalid Query Type");
};

function isValidYaml(rule) {
  return rule !== undefined && rule !== null && typeof rule === "object";
}

function replaceKeyNames(json, pattern, replacement) {
  return exports.traverseJson(json, (node) => {
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
