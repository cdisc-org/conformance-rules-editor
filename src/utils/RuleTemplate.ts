import { jsonToYAML } from "./json_yaml";

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

  private deepCopy(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  private walkRef(
    subschema: IJSONSchema,
    ancestorRefs: Set<IJSONSchema>,
    enumerate: boolean
  ) {
    const def = subschema["$ref"]
      .replace(/^#\//, "")
      .split("/")
      .reduce((o, p) => (o ? o[p] : {}), this.schema);
    if (!def) {
      throw Error(`Missing $ref value ${subschema["$ref"]}`);
    }
    if (ancestorRefs.has(def)) {
      return "...";
    } else {
      return this.walk(
        this.deepCopy(def),
        new Set([...ancestorRefs, def]),
        enumerate
      );
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
      ? this.walk(subschema["items"], ancestorRefs, true)
      : [];
  }

  private walkAllOf(
    subschema: IJSONSchema,
    ancestorRefs: Set<IJSONSchema>,
    enumerate: boolean
  ) {
    return enumerate
      ? subschema["allOf"].map((of) => this.walk(of, ancestorRefs, false))
      : this.walk(subschema["allOf"][0], ancestorRefs, false);
  }

  private walkAnyOf(
    subschema: IJSONSchema,
    ancestorRefs: Set<IJSONSchema>,
    enumerate: boolean
  ) {
    return enumerate
      ? subschema["anyOf"].map((of) => this.walk(of, ancestorRefs, false))
      : this.walk(subschema["anyOf"][0], ancestorRefs, false);
  }

  private walkOneOf(
    subschema: IJSONSchema,
    ancestorRefs: Set<IJSONSchema>,
    enumerate: boolean
  ) {
    return enumerate
      ? subschema["oneOf"].map((of) => this.walk(of, ancestorRefs, false))
      : this.walk(subschema["oneOf"][0], ancestorRefs, false);
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
    const mock = subschema["const"];
    return enumerate ? [mock] : mock;
  }

  private walkPattern(subschema: IJSONSchema, enumerate: boolean) {
    const mock = "";
    return enumerate ? [mock] : mock;
  }

  private walkBoolean(enumerate: boolean) {
    const mock = "true | false";
    return enumerate ? [mock] : mock;
  }

  private walkInteger(enumerate: boolean) {
    const mock = 12345;
    return enumerate ? [mock] : mock;
  }

  private walkNumber(enumerate: boolean) {
    const mock = 12345.6789;
    return enumerate ? [mock] : mock;
  }

  private walkString(enumerate: boolean) {
    const mock = "";
    return enumerate ? [mock] : mock;
  }

  private walkMultiType(enumerate: boolean) {
    const mock = "";
    return enumerate ? [mock] : mock;
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
    } else if ("$ref" in subschema) {
      return this.walkRef(subschema, ancestorRefs, enumerate);
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
    }
    throw Error(`Unknown JSON Schema type for ${JSON.stringify(subschema)}`);
  }

  private readonly schema: IJSONSchema;

  public constructor(schema: IJSONSchema) {
    this.schema = schema;
  }

  public schemaToTemplate(): string {
    const template = this.walk(this.schema, new Set(), false);
    return jsonToYAML(template);
  }
}
