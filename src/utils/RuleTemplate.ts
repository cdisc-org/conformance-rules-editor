import { jsonToYAML } from "./json_yaml";
import lodash, { isEqual, mergeWith } from "lodash-es";
import deepdash from "deepdash-es";
import { IIterateeContext } from "deepdash-es/IIterateeContext";
const _ = deepdash(lodash);

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
  /* Limit the number of enum values that appear in scalar values in the template */
  private static readonly maxEnums = 10;
  private static readonly recursionSymbol = { "...": "" };
  private static readonly stringSymbol = "";

  private static deepCopy(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  private static removeDuplicates(arr) {
    return arr.filter((item, index: number) => arr.indexOf(item) === index);
  }

  /**
   *
   * @param ref value of a `$ref` property, which is a [JSON Pointer](https://www.rfc-editor.org/rfc/rfc6901)
   * @param schema root json schema
   * @returns a reference to the object within `schema` pointed by `ref`
   * @throws will throw an error if `ref` value is not found
   */
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

  /**
   *
   * @param subschema source json schema
   * @returns
   * Transformed schema where all `$ref` are replaced by a copy of their corresponding definition.
   * Any cycles are replaced by: `{ "...": "" }`
   */
  private resolveRefs(subschema) {
    const cyclical = _.eachDeep(
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
    const acyclical = _.eachDeep(
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

  /**
   *
   * Overrides the default behavior of lodash `mergeWith`.
   * If one of the values (`objValue`, `srcValue`) to be merged is an array,
   * concatenate or append the values into a new array and remove duplicates.
   *
   * @param objValue
   * @param srcValue
   * @param key
   * @param object
   * @param source
   * @returns new array
   */
  private static mergeWithCompositions(
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

  private static isCompositeAndScalar(
    key: string | number,
    context: IIterateeContext
  ) {
    return (
      (!context.parent ||
        !context.parent.parent ||
        context.parent.parent.value["type"] !== "array") &&
      (key === "allOf" || key === "anyOf" || key === "oneOf")
    );
  }

  /**
   *
   * [Compositions](https://json-schema.org/understanding-json-schema/reference/combining.html)
   * refer to the array values of:
   * - `allOf`
   * - `anyOf`
   * - `oneOf`
   *
   * If the parent of a composition is **not** an array,
   * the composition values are merged together to create a single object.
   *
   * If the parent of a composition is an array,
   * no transformation is done
   * because the values within the composition can remain in the template as separate array items.
   *
   * @param subschema source json schema
   * @returns the transformed schema.
   *
   */
  private mergeCompositions(subschema: IJSONSchema) {
    return _.eachDeep(
      subschema,
      (value, key, parent, context) => {
        if (
          context.afterIterate &&
          RuleTemplate.isCompositeAndScalar(key, context)
        ) {
          delete parent[key];
          context.parent.parent.value[context.parent.key] = {
            ...parent,
            ...mergeWith({}, ...value, RuleTemplate.mergeWithCompositions),
          };
        }
      },
      { callbackAfterIterate: true }
    );
  }

  /**
   *
   * Overrides the default behavior of lodash `mergeWith`.
   * If both of the values (`objValue`, `srcValue`) to be merged are an array,
   * distribute (`merge`) the items in the `objValue` array onto the `srcValue` array.
   *
   * @param objValue
   * @param srcValue
   * @param key
   * @param object
   * @param source
   * @returns the distributed array that has the same cardinality as `srcValue`.
   */
  private static mergeWithObjects(
    objValue: any,
    srcValue: any,
    key: string,
    object: any,
    source: any
  ) {
    if (Array.isArray(objValue) && Array.isArray(srcValue)) {
      return srcValue.map((element) =>
        mergeWith({}, ...objValue, element, RuleTemplate.mergeWithObjects)
      );
    }
  }

  private templateObject(subschema: IJSONSchema) {
    const flatObject = {
      ...subschema["properties"],
      ...subschema["patternProperties"],
    };
    if ("allOf" in subschema || "anyOf" in subschema || "oneOf" in subschema) {
      return this.templateComposition(subschema).map((composite) =>
        mergeWith({}, flatObject, composite, RuleTemplate.mergeWithObjects)
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

  /**
   *
   * @param subschema source json schema
   * @returns a json template representation of the schema
   */
  private template(subschema: IJSONSchema) {
    return _.eachDeep(
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
