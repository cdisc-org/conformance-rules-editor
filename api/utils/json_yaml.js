const yaml = require("js-yaml");

exports.jsonToYAML = (body) => {
  try {
    return yaml.dump(body);
  } catch (yamlException) {
    return undefined;
  }
};

exports.yamlToJSON = (body) => {
  try {
    return yaml.load(body);
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
      child[prop] = {};
      child = child[prop];
    }
  }
  return object;
};

function isValidYaml(rule) {
  return rule !== undefined && rule !== null && typeof rule === "object";
}
