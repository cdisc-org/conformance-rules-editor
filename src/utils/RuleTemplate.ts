import { jsonToYAML } from "./json_yaml";
import { isEqual, mergeWith } from "lodash";
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

  private walkObject(subschema: IJSONSchema) {
    RuleTemplate.replaceProperties(subschema, {
      ...subschema["properties"],
      ...subschema["patternProperties"],
    });
  }

  private walkArray(subschema: IJSONSchema) {
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

  private walkComposition(subschema: IJSONSchema) {
    return [
      ...(subschema["allOf"] ? subschema["allOf"].flat() : []),
      ...(subschema["anyOf"] ? subschema["anyOf"].flat() : []),
      ...(subschema["oneOf"] ? subschema["oneOf"].flat() : []),
    ];
  }

  private walkEnum(subschema: IJSONSchema, parent: IJSONSchema) {
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

  private walkConst(subschema: IJSONSchema) {
    return subschema["const"];
  }

  private walkPattern(subschema: IJSONSchema) {
    return RuleTemplate.stringSymbol;
  }

  private walkBoolean() {
    return "true | false";
  }

  private walkInteger() {
    return 12345;
  }

  private walkNumber() {
    return 12345.6789;
  }

  private walkString() {
    return RuleTemplate.stringSymbol;
  }

  private walkMultiType() {
    return RuleTemplate.stringSymbol;
  }

  private walkRecursion(subschema: IJSONSchema) {
    return subschema;
  }

  private walk(subschema: IJSONSchema) {
    return eachDeep(
      subschema,
      (value, key, parent, context) => {
        if (!context.afterIterate && typeof value === "object") {
          if ("enum" in value) {
            parent[key] = this.walkEnum(value, parent);
          } else if ("const" in value) {
            parent[key] = this.walkConst(value);
          } else if ("pattern" in value) {
            parent[key] = this.walkPattern(value);
          } else if (value["type"] === "boolean") {
            parent[key] = this.walkBoolean();
          } else if (value["type"] === "integer") {
            parent[key] = this.walkInteger();
          } else if (value["type"] === "number") {
            parent[key] = this.walkNumber();
          } else if (value["type"] === "string") {
            parent[key] = this.walkString();
          } else if (Array.isArray(value["type"])) {
            parent[key] = this.walkMultiType();
          } else if (isEqual(value, RuleTemplate.recursionSymbol)) {
            parent[key] = this.walkRecursion(value);
          }
        } else if (context.afterIterate && typeof value === "object") {
          if (value["type"] === "object") {
            this.walkObject(value);
          } else if (value["type"] === "array") {
            parent[key] = this.walkArray(value);
          } else if ("allOf" in value || "anyOf" in value || "oneOf" in value) {
            parent[key] = this.walkComposition(value);
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
    this.walk(resolved);
    return jsonToYAML(resolved);
  }
}
