#!/usr/bin/env node
/**
 * YAML Format & Sort Script
 *
 * Formats and sorts YAML files using the same algorithm as the app:
 * alphabetical, recursive sorting by key name.
 *
 * Usage:
 *   node scripts/format-yaml.mjs [--check] <glob...>
 *
 * --check   Exit with non-zero code if any file is not properly formatted/sorted
 *           (does NOT write files). Use this in CI and pre-commit hooks.
 *
 * Examples:
 *   node scripts/format-yaml.mjs public/**\/*.yml
 *   node scripts/format-yaml.mjs --check public/**\/*.yml
 */

import { readFileSync, writeFileSync } from "fs";
import { globSync } from "glob";
import { parseDocument, YAMLMap, YAMLSeq } from "yaml";

const args = process.argv.slice(2);
const checkMode = args.includes("--check");
const patterns = args.filter((a) => a !== "--check");

if (patterns.length === 0) {
  console.error("Usage: format-yaml.mjs [--check] <glob...>");
  process.exit(1);
}

/**
 * Recursively sort YAML map keys alphabetically — same logic as formatYAML in json_yaml.ts
 */
function sortDeep(node) {
  if (node instanceof YAMLMap) {
    node.items.sort((a, b) => String(a.key).localeCompare(String(b.key)));
    node.items.forEach((i) => sortDeep(i.value));
  } else if (node instanceof YAMLSeq) {
    node.items.forEach(sortDeep);
  }
}

function formatYAML(raw) {
  const doc = parseDocument(raw);
  sortDeep(doc.contents);
  return doc.toString();
}

const files = patterns.flatMap((p) => globSync(p, { nodir: true }));

if (files.length === 0) {
  console.log("No files matched the provided patterns.");
  process.exit(0);
}

let hasErrors = false;

for (const file of files) {
  const original = readFileSync(file, "utf8");
  let formatted;
  try {
    formatted = formatYAML(original);
  } catch (e) {
    console.error(`❌ ${file}: parse error — ${e.message}`);
    hasErrors = true;
    continue;
  }

  if (original === formatted) {
    console.log(`✅ ${file}`);
  } else if (checkMode) {
    console.error(`❌ ${file}: not properly formatted/sorted`);
    hasErrors = true;
  } else {
    writeFileSync(file, formatted, "utf8");
    console.log(`🔧 ${file}: formatted`);
  }
}

if (hasErrors) {
  if (checkMode) {
    console.error(
      "\nSome files are not properly formatted/sorted.\n" +
        "Run: node scripts/format-yaml.mjs <glob> to fix them."
    );
  }
  process.exit(1);
}

