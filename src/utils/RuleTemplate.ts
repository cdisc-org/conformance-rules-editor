import { jsonToYAML } from "./json_yaml";
import { isEqual, mergeWith } from "lodash";

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

  private deepCopy(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  private removeDuplicates(arr) {
    return arr.filter((item, index) => arr.indexOf(item) === index);
  }

  private enumerate(obj, enumerate: boolean) {
    return enumerate ? [obj] : obj;
  }

  private resolveRef(
    parent: IJSONSchema,
    key: number | string,
    subschema: IJSONSchema,
    ancestorRefs: Set<IJSONSchema>
  ) {
    const def = subschema["$ref"]
      .replace(/^#\//, "")
      .split("/")
      .reduce((o, p) => (o ? o[p] : {}), this.schema);
    if (!def) {
      throw Error(`Missing $ref value ${subschema["$ref"]}`);
    }
    if (ancestorRefs.has(def)) {
      return this.deepCopy(RuleTemplate.recursionSymbol);
    } else {
      const copy = this.deepCopy(def);
      this.resolveRefs(parent, key, copy, new Set([...ancestorRefs, def]));
      return copy;
    }
  }

  private resolveObject(subschema, ancestorRefs: Set<IJSONSchema>) {
    for (const [childKey, childValue] of Object.entries(subschema)) {
      if (childKey === "properties") {
        for (const [grandchildKey, grandchildValue] of Object.entries(
          childValue
        )) {
          this.resolveRefs(
            childValue,
            grandchildKey,
            grandchildValue,
            ancestorRefs
          );
        }
      } else {
        this.resolveRefs(subschema, childKey, childValue, ancestorRefs);
      }
    }
  }

  private resolveArray(subschema, ancestorRefs: Set<IJSONSchema>) {
    for (const [childKey, childValue] of subschema.entries()) {
      this.resolveRefs(subschema, childKey, childValue, ancestorRefs);
    }
  }

  private resolveRefs(
    parent,
    key: number | string,
    subschema,
    ancestorRefs: Set<IJSONSchema>
  ) {
    if (typeof subschema === "object" && !Array.isArray(subschema)) {
      if ("$ref" in subschema) {
        parent[key] = this.resolveRef(parent, key, subschema, ancestorRefs);
      } else {
        this.resolveObject(subschema, ancestorRefs);
      }
    } else if (Array.isArray(subschema)) {
      this.resolveArray(subschema, ancestorRefs);
    }
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
    return this.enumerate(subtemplate, enumerate);
  }

  private walkArray(subschema: IJSONSchema) {
    if ("items" in subschema) {
      const walked = this.walk(subschema["items"], true);
      const deduped = this.removeDuplicates(walked);
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
    return this.enumerate(subschema["const"], enumerate);
  }

  private walkPattern(subschema: IJSONSchema, enumerate: boolean) {
    return this.enumerate(RuleTemplate.stringSymbol, enumerate);
  }

  private walkBoolean(enumerate: boolean) {
    return this.enumerate("true | false", enumerate);
  }

  private walkInteger(enumerate: boolean) {
    return this.enumerate(12345, enumerate);
  }

  private walkNumber(enumerate: boolean) {
    return this.enumerate(12345.6789, enumerate);
  }

  private walkString(enumerate: boolean) {
    return this.enumerate(RuleTemplate.stringSymbol, enumerate);
  }

  private walkMultiType(enumerate: boolean) {
    return this.enumerate(RuleTemplate.stringSymbol, enumerate);
  }

  private walkRecursion(subschema: IJSONSchema, enumerate: boolean) {
    return this.enumerate(subschema, enumerate);
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

  private mergeObject(subschema: IJSONSchema) {
    if ("properties" in subschema) {
      for (const [key, value] of Object.entries(subschema["properties"])) {
        if ("allOf" in value) {
          subschema["properties"][key] = this.mergeAllOf(value, false);
        } else if ("anyOf" in value) {
          subschema["properties"][key] = this.mergeAnyOf(value, false);
        } else if ("oneOf" in value) {
          subschema["properties"][key] = this.mergeOneOf(value, false);
        }
        this.mergeCompositions(value, false);
      }
    }
    if ("patternProperties" in subschema) {
      for (const [key, value] of Object.entries(
        subschema["patternProperties"]
      )) {
        if ("allOf" in value) {
          subschema["patternProperties"][key] = this.mergeAllOf(value, false);
        } else if ("anyOf" in value) {
          subschema["patternProperties"][key] = this.mergeAnyOf(value, false);
        } else if ("oneOf" in value) {
          subschema["patternProperties"][key] = this.mergeOneOf(value, false);
        }
        this.mergeCompositions(value, false);
      }
    }
    return subschema;
  }

  private mergeArray(subschema: IJSONSchema) {
    if ("items" in subschema) {
      this.mergeCompositions(subschema["items"], true);
    }
    return subschema;
  }

  private mergeWithCustomizer(
    objValue: any,
    srcValue: any,
    key: string,
    object: any,
    source: any
  ) {
    if (Array.isArray(objValue) && Array.isArray(srcValue)) {
      return [...objValue, ...srcValue];
    }
    if (Array.isArray(objValue) && srcValue && !Array.isArray(srcValue)) {
      return [...objValue, srcValue];
    }
    if (objValue && !Array.isArray(objValue) && Array.isArray(srcValue)) {
      return [objValue, ...srcValue];
    }
  }

  private mergeComposition(
    subschema: IJSONSchema,
    propertyName: string,
    enumerate: boolean
  ) {
    if (enumerate) {
      return subschema;
    }
    const value = subschema[propertyName];
    delete subschema[propertyName];
    return {
      ...subschema,
      ...mergeWith(
        {},
        ...value.map((of) => this.mergeCompositions(of, false)),
        this.mergeWithCustomizer
      ),
    };
  }

  private mergeAllOf(subschema: IJSONSchema, enumerate: boolean) {
    return this.mergeComposition(subschema, "allOf", enumerate);
  }

  private mergeAnyOf(subschema: IJSONSchema, enumerate: boolean) {
    return this.mergeComposition(subschema, "anyOf", enumerate);
  }

  private mergeOneOf(subschema: IJSONSchema, enumerate: boolean) {
    return this.mergeComposition(subschema, "oneOf", enumerate);
  }

  private mergeCompositions(subschema: IJSONSchema, enumerate: boolean) {
    if (subschema["type"] === "object") {
      return this.mergeObject(subschema);
    } else if (subschema["type"] === "array") {
      return this.mergeArray(subschema);
    } else if ("allOf" in subschema) {
      return this.mergeAllOf(subschema, enumerate);
    } else if ("anyOf" in subschema) {
      return this.mergeAnyOf(subschema, enumerate);
    } else if ("oneOf" in subschema) {
      return this.mergeOneOf(subschema, enumerate);
    }
    return subschema;
  }

  private readonly schema: IJSONSchema;

  public constructor(schema: IJSONSchema) {
    this.schema = schema;
  }

  public schemaToTemplate(): string {
    const resolved = this.deepCopy(this.schema);
    this.resolveRefs(null, null, resolved, new Set());
    const merged = this.mergeCompositions(resolved, false);
    const template = this.walk(merged, false);
    return jsonToYAML(template);
  }
}
