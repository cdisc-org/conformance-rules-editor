/**
 * Placeholder used when a rule has no Rule Identifier.
 *
 * Without it, the exported file name would start with "." (e.g. ".<uuid>.yml"),
 * which macOS treats as a hidden file.
 */
export const MISSING_RULE_ID = "NO_RULE_ID";

const toFileNamePart = (value: unknown): string =>
  (Array.isArray(value) ? value.join(",") : JSON.stringify(value)) ?? "";

/**
 * Builds the file name for a rule exported as YAML: `<RuleID>.<id>.yml`.
 */
export const ruleFileName = (ruleId: unknown, id: string): string =>
  `${toFileNamePart(ruleId) || MISSING_RULE_ID}.${id}.yml`;
