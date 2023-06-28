import fetch, { Response } from "node-fetch";
import lodash from "lodash";
import deepdash from "deepdash";
const _ = deepdash(lodash);

/**
 * Allows you to match markdown files to json schema files using the following strategy:
 * - Match json subschemas with a markdown file of the same name.
 * - For each `const` within the subschema, check if a md section exists with the same name. Sections start with `## `.
 * - Create a new `markdownDescription` property within the same item as the `const` containing the markdown content within the corresponding section.
 * - Ignore lines starting with `# `
 */
export default async (doc: {}, baseURL: string): Promise<void> => {
  const md: string = await fetchMarkdown(doc, baseURL);
  const markDownDescriptions: { [name: string]: string } = markdownToDict(md);
  attachMarkdownDescriptions(doc, markDownDescriptions);
};

const fetchMarkdown = async (doc: {}, baseURL: string): Promise<string> => {
  const id = doc["$id"];
  const fileWithExt = id.substring(id.lastIndexOf("/"));
  const fileWithoutExt = fileWithExt.substring(0, fileWithExt.lastIndexOf("."));
  const href = `${baseURL}/${fileWithoutExt}.md`;
  const response: Response = await fetch(href);
  if (response.status !== 200) {
    return "";
  }
  return await response.text();
};

const markdownToDict = (md: string): { [name: string]: string } => {
  const lines = md.split(/\r?\n|\r|\n/g);
  let name: string;
  let markdownDescription: string[] = [];
  const markdownDescriptions: { [name: string]: string } = {};
  for (const line of lines) {
    if (line.startsWith("## ")) {
      if (name) {
        markdownDescriptions[name] = markdownDescription.join("\n");
      }
      name = line.replace("## ", "");
      markdownDescription = [];
    } else if (!line.startsWith("# ")) {
      markdownDescription.push(line);
    }
  }
  if (name) {
    markdownDescriptions[name] = markdownDescription.join("\n");
  }
  return markdownDescriptions;
};

const attachMarkdownDescriptions = (
  doc: {},
  markDownDescriptions: { [name: string]: string }
) => {
  _.eachDeep(
    doc,
    (value, key, parent, context) => {
      if (key === "const" && value in markDownDescriptions) {
        parent["markdownDescription"] = markDownDescriptions[value];
      }
    },
    {}
  );
};
