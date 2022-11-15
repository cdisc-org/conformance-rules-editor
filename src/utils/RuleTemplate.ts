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
    return arr.filter((item, index) => arr.indexOf(item) === index);
  }

  private static enumerate(obj, enumerate: boolean) {
    return enumerate ? [obj] : obj;
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

  private walkObject(subschema: IJSONSchema, enumerate: boolean) {
    const subtemplate = {};
    if ("properties" in subschema) {
      for (const [key, value] of Object.entries(subschema["properties"])) {
        subtemplate[key] = this.walk(value, false);
      }
    }
    if ("patternProperties" in subschema) {
      for (const [key, value] of Object.entries(
        subschema["patternProperties"]
      )) {
        subtemplate[key] = this.walk(value, false);
      }
    }
    if (enumerate && "allOf" in subschema) {
      return [
        ...(Object.keys(subtemplate).length ? [subtemplate] : []),
        ...this.walkAllOf(subschema, enumerate),
      ];
    } else if (enumerate && "anyOf" in subschema) {
      return [
        ...(Object.keys(subtemplate).length ? [subtemplate] : []),
        ...this.walkAnyOf(subschema, enumerate),
      ];
    } else if (enumerate && "oneOf" in subschema) {
      return [
        ...(Object.keys(subtemplate).length ? [subtemplate] : []),
        ...this.walkOneOf(subschema, enumerate),
      ];
    }
    return RuleTemplate.enumerate(subtemplate, enumerate);
  }

  private walkArray(subschema: IJSONSchema) {
    if ("items" in subschema) {
      const walked = this.walk(subschema["items"], true);
      const deduped = RuleTemplate.removeDuplicates(walked);
      const filtered = deduped.filter(
        (item) => deduped.length === 1 || item !== ""
      );
      const sorted = filtered.sort((a, b) => {
        /* Put recursion Symbols at end of list */
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
    } else {
      return [];
    }
  }

  private walkComposition(subschema: [IJSONSchema], enumerate: boolean) {
    return enumerate
      ? subschema.map((of) => this.walk(of, false))
      : this.walk(mergeWith({}, ...subschema, this.mergeWithCustomizer), false);
  }

  private walkAllOf(subschema: IJSONSchema, enumerate: boolean) {
    return this.walkComposition(subschema["allOf"], enumerate);
  }

  private walkAnyOf(subschema: IJSONSchema, enumerate: boolean) {
    return this.walkComposition(subschema["anyOf"], enumerate);
  }

  private walkOneOf(subschema: IJSONSchema, enumerate: boolean) {
    return this.walkComposition(subschema["oneOf"], enumerate);
  }

  private walkEnum(subschema: IJSONSchema, enumerate: boolean) {
    return enumerate
      ? subschema["enum"]
      : subschema["enum"].length <= RuleTemplate.maxEnums
      ? subschema["enum"].join(" | ")
      : [...subschema["enum"].slice(0, RuleTemplate.maxEnums), "..."].join(
          " | "
        );
  }

  private walkConst(subschema: IJSONSchema, enumerate: boolean) {
    return RuleTemplate.enumerate(subschema["const"], enumerate);
  }

  private walkPattern(subschema: IJSONSchema, enumerate: boolean) {
    return RuleTemplate.enumerate(RuleTemplate.stringSymbol, enumerate);
  }

  private walkBoolean(enumerate: boolean) {
    return RuleTemplate.enumerate("true | false", enumerate);
  }

  private walkInteger(enumerate: boolean) {
    return RuleTemplate.enumerate(12345, enumerate);
  }

  private walkNumber(enumerate: boolean) {
    return RuleTemplate.enumerate(12345.6789, enumerate);
  }

  private walkString(enumerate: boolean) {
    return RuleTemplate.enumerate(RuleTemplate.stringSymbol, enumerate);
  }

  private walkMultiType(enumerate: boolean) {
    return RuleTemplate.enumerate(RuleTemplate.stringSymbol, enumerate);
  }

  private walkRecursion(subschema: IJSONSchema, enumerate: boolean) {
    return RuleTemplate.enumerate(subschema, enumerate);
  }

  private walk(subschema: IJSONSchema, enumerate: boolean) {
    if (subschema["type"] === "object") {
      return this.walkObject(subschema, enumerate);
    } else if (subschema["type"] === "array") {
      return this.walkArray(subschema);
    } else if ("allOf" in subschema) {
      return this.walkAllOf(subschema, enumerate);
    } else if ("anyOf" in subschema) {
      return this.walkAnyOf(subschema, enumerate);
    } else if ("oneOf" in subschema) {
      return this.walkOneOf(subschema, enumerate);
    } else if ("enum" in subschema) {
      return this.walkEnum(subschema, enumerate);
    } else if ("const" in subschema) {
      return this.walkConst(subschema, enumerate);
    } else if ("pattern" in subschema) {
      return this.walkPattern(subschema, enumerate);
    } else if (subschema["type"] === "boolean") {
      return this.walkBoolean(enumerate);
    } else if (subschema["type"] === "integer") {
      return this.walkInteger(enumerate);
    } else if (subschema["type"] === "number") {
      return this.walkNumber(enumerate);
    } else if (subschema["type"] === "string") {
      return this.walkString(enumerate);
    } else if (Array.isArray(subschema["type"])) {
      return this.walkMultiType(enumerate);
    } else if (isEqual(subschema, RuleTemplate.recursionSymbol)) {
      return this.walkRecursion(subschema, enumerate);
    }
    throw Error(`Unknown JSON Schema type for ${JSON.stringify(subschema)}`);
  }

  private readonly schema: IJSONSchema;

  public constructor(schema: IJSONSchema) {
    this.schema = schema;
  }

  public schemaToTemplate(): string {
    const resolved = RuleTemplate.deepCopy(this.resolveRefs(this.schema));
    const merged = this.mergeCompositions(resolved);
    const template = this.walk(merged, false);
    return jsonToYAML(template);
  }
}
