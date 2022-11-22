import { jsonToYAML } from "./json_yaml";
import { isEqual, merge, mergeWith } from "lodash";
import eachDeep from "deepdash-es/eachDeep";

interface IJSONSchema {
  $ref?: string;
  allOf?: [IJSONSchema];
  anyOf?: [IJSONSchema];
  const?: number | string;
  enum?: [IJSONSchema];
  items?: IJSONSchema;
  oneOf?: [IJSONSchema];
  pattern?: string;
  patternProperties?: { [key: string]: IJSONSchema };
  properties?: { [key: string]: IJSONSchema };
  type?: "array" | "boolean" | "integer" | "number" | "object" | "string";
}

export class RuleTemplate {
  private static readonly maxEnums = 10;
  private static readonly recursionSymbol = { "...": "" };
  private static readonly stringSymbol = "";

  private static deepCopy(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  private static removeDuplicates(arr) {
    return arr.filter((item, index: number) => arr.indexOf(item) === index);
  }

  private static getDefByRef(ref: string, schema) {
    const def = ref
      .replace(/^#\//, "")
      .split("/")
      .reduce((o, p) => (o ? o[p] : {}), schema);
    if (!def) {
      throw Error(`Missing $ref value ${ref}`);
    }
    return def;
  }

  private static deleteProperties(obj: {}) {
    for (const key in obj) {
      delete obj[key];
    }
  }

  private static replaceProperties(oldObj: {}, newObj: {}) {
    RuleTemplate.deleteProperties(oldObj);
    for (const [key, value] of Object.entries(newObj)) {
      oldObj[key] = value;
    }
  }

  private resolveRefs(subschema) {
    const cyclical = eachDeep(
      subschema,
      (value, key, parent, context) => {
        if (
          key !== "properties" &&
          typeof value === "object" &&
          "$ref" in value
        ) {
          parent[key] = RuleTemplate.getDefByRef(value["$ref"], this.schema);
        }
      },
      {}
    );
    const acyclical = eachDeep(
      cyclical,
      (value, key, parent, context) => {
        if (context.isCircular) {
          parent[key] = RuleTemplate.deepCopy(RuleTemplate.recursionSymbol);
          return false;
        }
      },
      { checkCircular: true }
    );
    return acyclical;
  }

  private mergeWithCustomizer(
    objValue: any,
    srcValue: any,
    key: string,
    object: any,
    source: any
  ) {
    if (Array.isArray(objValue) && Array.isArray(srcValue)) {
      return RuleTemplate.removeDuplicates([...objValue, ...srcValue]);
    }
    if (Array.isArray(objValue) && srcValue && !Array.isArray(srcValue)) {
      return RuleTemplate.removeDuplicates([...objValue, srcValue]);
    }
    if (objValue && !Array.isArray(objValue) && Array.isArray(srcValue)) {
      return RuleTemplate.removeDuplicates([objValue, ...srcValue]);
    }
  }

  private mergeCompositions(subschema: IJSONSchema) {
    return eachDeep(
      subschema,
      (value, key, parent, context) => {
        if (
          context.afterIterate &&
          (!context.parent ||
            !context.parent.parent ||
            context.parent.parent.value["type"] !== "array") &&
          (key === "allOf" || key === "anyOf" || key === "oneOf")
        ) {
          delete parent[key];
          context.parent.parent.value[context.parent.key] = {
            ...parent,
            ...mergeWith({}, ...value, this.mergeWithCustomizer),
          };
        }
      },
      { callbackAfterIterate: true }
    );
  }

  private templateObject(subschema: IJSONSchema) {
    const flatObject = {
      ...subschema["properties"],
      ...subschema["patternProperties"],
    };
    if ("allOf" in subschema || "anyOf" in subschema || "oneOf" in subschema) {
      return this.templateComposition(subschema).map((composite) =>
        merge({}, flatObject, composite)
      );
    }
    return flatObject;
  }

  private templateArray(subschema: IJSONSchema) {
    const items = "items" in subschema ? subschema["items"] : [];
    const arrayed = Array.isArray(items) ? items : [items];
    const deduped = RuleTemplate.removeDuplicates(arrayed);
    /* If array is longer than 1, removed empty string symbols */
    const filtered = deduped.filter(
      (item) =>
        deduped.length === 1 || !isEqual(item, RuleTemplate.stringSymbol)
    );
    /* Put recursion Symbols at end of list */
    const sorted = filtered.sort((a, b) => {
      if (
        isEqual(a, RuleTemplate.recursionSymbol) &&
        !isEqual(b, RuleTemplate.recursionSymbol)
      ) {
        return 1;
      }
      if (
        isEqual(b, RuleTemplate.recursionSymbol) &&
        !isEqual(a, RuleTemplate.recursionSymbol)
      ) {
        return -1;
      }
      return 0;
    });
    return sorted;
  }

  private templateComposition(subschema: IJSONSchema) {
    return [
      ...(subschema["allOf"] ? subschema["allOf"].flat() : []),
      ...(subschema["anyOf"] ? subschema["anyOf"].flat() : []),
      ...(subschema["oneOf"] ? subschema["oneOf"].flat() : []),
    ];
  }

  private templateEnum(subschema: IJSONSchema, parent: IJSONSchema) {
    const isArray =
      (typeof parent !== "undefined" && parent["type"] === "array") ||
      Array.isArray(parent);
    return isArray
      ? subschema["enum"]
      : subschema["enum"].length <= RuleTemplate.maxEnums
      ? subschema["enum"].join(" | ")
      : [...subschema["enum"].slice(0, RuleTemplate.maxEnums), "..."].join(
          " | "
        );
  }

  private templateConst(subschema: IJSONSchema) {
    return subschema["const"];
  }

  private templatePattern(subschema: IJSONSchema) {
    return RuleTemplate.stringSymbol;
  }

  private templateBoolean() {
    return "true | false";
  }

  private templateInteger() {
    return 12345;
  }

  private templateNumber() {
    return 12345.6789;
  }

  private templateString() {
    return RuleTemplate.stringSymbol;
  }

  private templateMultiType() {
    return RuleTemplate.stringSymbol;
  }

  private templateRecursion(subschema: IJSONSchema) {
    return subschema;
  }

  private template(subschema: IJSONSchema) {
    return eachDeep(
      subschema,
      (value, key, parent, context) => {
        if (!context.afterIterate && typeof value === "object") {
          if ("enum" in value) {
            parent[key] = this.templateEnum(value, parent);
          } else if ("const" in value) {
            parent[key] = this.templateConst(value);
          } else if ("pattern" in value) {
            parent[key] = this.templatePattern(value);
          } else if (value["type"] === "boolean") {
            parent[key] = this.templateBoolean();
          } else if (value["type"] === "integer") {
            parent[key] = this.templateInteger();
          } else if (value["type"] === "number") {
            parent[key] = this.templateNumber();
          } else if (value["type"] === "string") {
            parent[key] = this.templateString();
          } else if (Array.isArray(value["type"])) {
            parent[key] = this.templateMultiType();
          } else if (isEqual(value, RuleTemplate.recursionSymbol)) {
            parent[key] = this.templateRecursion(value);
          }
        } else if (context.afterIterate && typeof value === "object") {
          if (value["type"] === "object") {
            const templateObject = this.templateObject(value);
            if (parent) {
              parent[key] = templateObject;
            } else {
              /* Object is the root */
              RuleTemplate.replaceProperties(value, templateObject);
            }
          } else if (value["type"] === "array") {
            parent[key] = this.templateArray(value);
          } else if ("allOf" in value || "anyOf" in value || "oneOf" in value) {
            parent[key] = this.templateComposition(value);
          }
        }
      },
      { callbackAfterIterate: true }
    );
  }

  private readonly schema: IJSONSchema;

  public constructor(schema: IJSONSchema) {
    this.schema = schema;
  }

  public schemaToTemplate(): string {
    const resolved = RuleTemplate.deepCopy(this.resolveRefs(this.schema));
    this.mergeCompositions(resolved);
    this.template(resolved);
    return jsonToYAML(resolved);
  }
}
