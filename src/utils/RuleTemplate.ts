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
  private static readonly recursionIndicator = { "...": "" };

  private deepCopy(obj) {
    return JSON.parse(JSON.stringify(obj));
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
      return this.deepCopy(RuleTemplate.recursionIndicator);
    } else {
      const copy = this.deepCopy(def);
      this.resolveRefs(parent, key, copy, new Set([...ancestorRefs, def]));
      return copy;
    }
  }

  private resolveRefs(
    parent: IJSONSchema,
    key: number | string,
    subschema: IJSONSchema,
    ancestorRefs: Set<IJSONSchema>
  ) {
    if (typeof subschema === "object" && !Array.isArray(subschema)) {
      if ("$ref" in subschema) {
        parent[key] = this.resolveRef(parent, key, subschema, ancestorRefs);
      } else {
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
    } else if (Array.isArray(subschema)) {
      for (const [childKey, childValue] of subschema.entries()) {
        this.resolveRefs(subschema, childKey, childValue, ancestorRefs);
      }
    }
  }

  private walkObject(
    subschema: IJSONSchema,
    ancestorRefs: Set<IJSONSchema>,
    enumerate: boolean
  ) {
    const subtemplate = {};
    if ("properties" in subschema) {
      for (const [key, value] of Object.entries(subschema["properties"])) {
        subtemplate[key] = this.walk(value, ancestorRefs, false);
      }
    }
    if ("patternProperties" in subschema) {
      for (const [key, value] of Object.entries(
        subschema["patternProperties"]
      )) {
        subtemplate[key] = this.walk(value, ancestorRefs, false);
      }
    }
    if (enumerate && "allOf" in subschema) {
      return [
        ...(Object.keys(subtemplate).length ? [subtemplate] : []),
        ...this.walkAllOf(subschema, ancestorRefs, enumerate),
      ];
    } else if (enumerate && "anyOf" in subschema) {
      return [
        ...(Object.keys(subtemplate).length ? [subtemplate] : []),
        ...this.walkAnyOf(subschema, ancestorRefs, enumerate),
      ];
    } else if (enumerate && "oneOf" in subschema) {
      return [
        ...(Object.keys(subtemplate).length ? [subtemplate] : []),
        ...this.walkOneOf(subschema, ancestorRefs, enumerate),
      ];
    }
    return enumerate ? [subtemplate] : subtemplate;
  }

  private walkArray(subschema: IJSONSchema, ancestorRefs: Set<IJSONSchema>) {
    return "items" in subschema
      ? this.walk(subschema["items"], ancestorRefs, true).sort((a, b) => {
          /* Put recursion indicators at end of list */
          if (
            isEqual(a, RuleTemplate.recursionIndicator) &&
            !isEqual(b, RuleTemplate.recursionIndicator)
          ) {
            return 1;
          }
          if (
            isEqual(b, RuleTemplate.recursionIndicator) &&
            !isEqual(a, RuleTemplate.recursionIndicator)
          ) {
            return -1;
          }
          return 0;
        })
      : [];
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

  private walkComposition(
    subschema: [IJSONSchema],
    ancestorRefs: Set<IJSONSchema>,
    enumerate: boolean
  ) {
    return enumerate
      ? subschema.map((of) => this.walk(of, ancestorRefs, false))
      : this.walk(
          mergeWith({}, ...subschema, this.mergeWithCustomizer),
          ancestorRefs,
          false
        );
  }

  private walkAllOf(
    subschema: IJSONSchema,
    ancestorRefs: Set<IJSONSchema>,
    enumerate: boolean
  ) {
    return this.walkComposition(subschema["allOf"], ancestorRefs, enumerate);
  }

  private walkAnyOf(
    subschema: IJSONSchema,
    ancestorRefs: Set<IJSONSchema>,
    enumerate: boolean
  ) {
    return this.walkComposition(subschema["anyOf"], ancestorRefs, enumerate);
  }

  private walkOneOf(
    subschema: IJSONSchema,
    ancestorRefs: Set<IJSONSchema>,
    enumerate: boolean
  ) {
    return this.walkComposition(subschema["oneOf"], ancestorRefs, enumerate);
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
    return this.enumerate("", enumerate);
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
    return this.enumerate("", enumerate);
  }

  private walkMultiType(enumerate: boolean) {
    return this.enumerate("", enumerate);
  }

  private walkRecursion(subschema: IJSONSchema, enumerate: boolean) {
    return this.enumerate(subschema, enumerate);
  }

  private walk(
    subschema: IJSONSchema,
    ancestorRefs: Set<IJSONSchema>,
    enumerate: boolean
  ) {
    if (
      subschema["type"] === "object" ||
      "properties" in subschema ||
      "patternProperties" in subschema
    ) {
      return this.walkObject(subschema, ancestorRefs, enumerate);
    } else if (subschema["type"] === "array" || "items" in subschema) {
      return this.walkArray(subschema, ancestorRefs);
    } else if ("allOf" in subschema) {
      return this.walkAllOf(subschema, ancestorRefs, enumerate);
    } else if ("anyOf" in subschema) {
      return this.walkAnyOf(subschema, ancestorRefs, enumerate);
    } else if ("oneOf" in subschema) {
      return this.walkOneOf(subschema, ancestorRefs, enumerate);
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
    } else if (isEqual(subschema, RuleTemplate.recursionIndicator)) {
      return this.walkRecursion(subschema, enumerate);
    }
    throw Error(`Unknown JSON Schema type for ${JSON.stringify(subschema)}`);
  }

  private readonly schema: IJSONSchema;

  public constructor(schema: IJSONSchema) {
    this.schema = schema;
  }

  public schemaToTemplate(): string {
    const resolved = this.deepCopy(this.schema);
    this.resolveRefs(null, null, resolved, new Set());
    //TODO: merge compositions leaf-first, then walk again
    const template = this.walk(resolved, new Set(), false);
    return jsonToYAML(template);
  }
}
