import { MISSING_RULE_ID, ruleFileName } from "./ruleFileName";

describe("ruleFileName", () => {
  const id = "3f2a9c1e-7b4d-4c1a-9e2f-0a1b2c3d4e5f";

  it("uses the rule identifier as the file name prefix", () => {
    expect(ruleFileName(["CORE-000001"], id)).toBe(`CORE-000001.${id}.yml`);
  });

  it("joins multiple rule identifiers with a comma", () => {
    expect(ruleFileName(["CORE-000001", "CORE-000002"], id)).toBe(
      `CORE-000001,CORE-000002.${id}.yml`
    );
  });

  it.each([
    ["an empty array", []],
    ["an array of empty values", [""]],
    ["undefined", undefined],
  ])("uses a placeholder when the rule identifier is %s", (_, ruleId) => {
    const fileName = ruleFileName(ruleId, id);

    expect(fileName).toBe(`${MISSING_RULE_ID}.${id}.yml`);
    expect(fileName.startsWith(".")).toBe(false);
  });
});
