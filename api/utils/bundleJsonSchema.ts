import { clearCache, findRefsAt } from "json-refs";
import addMarkdownDescriptions from "../utils/addMarkdownDescriptions";
import lodash from "lodash";
import deepdash from "deepdash";
const _ = deepdash(lodash);

export default async (baseURL: string): Promise<{}> => {
  clearCache();
  let resolvedRefs = {};
  const unresolvedRefs = new Set([baseURL]);
  const urlPath = baseURL.substring(0, baseURL.lastIndexOf("/"));

  while (unresolvedRefs.size) {
    const currentHref = unresolvedRefs.values().next().value;
    unresolvedRefs.delete(currentHref);
    const defs = await findRefsAt(currentHref, {
      filter: ["relative"],
    });
    await addMarkdownDescriptions(defs["value"], urlPath);
    if (baseURL === currentHref) {
      resolvedRefs = defs["value"];
    } else {
      const id = defs["value"]["$id"];
      delete defs["value"]["$id"];
      delete defs["value"]["$schema"];
      resolvedRefs["$defs"][id] = defs["value"];
      transformRefs(resolvedRefs, (value: string) =>
        value === id ? `#/$defs/${id}` : value
      );
      transformRefs(resolvedRefs, (value: string) =>
        value.startsWith(`${id}#`)
          ? value.replace(`${id}#`, `#/$defs/${id}`)
          : value
      );
    }
    for (const ref of Object.values(defs["refs"])) {
      const id = ref["uri"].split("#")[0];
      const file = id.substring(id.lastIndexOf("/"));
      const href = `${urlPath}/${file}`;
      const resolvedId = new URL(id, resolvedRefs["$id"]).toString();
      if (
        !(resolvedId === resolvedRefs["$id"] || id in resolvedRefs["$defs"])
      ) {
        unresolvedRefs.add(href);
      }
    }
  }
  const pathName = new URL(resolvedRefs["$id"]).pathname.replace("/", "");
  transformRefs(resolvedRefs, (value: string) =>
    value.startsWith(`${pathName}#`)
      ? value.replace(`${pathName}#`, `#`)
      : value
  );
  return resolvedRefs;
};

const transformRefs = (doc: {}, transformation: (value: string) => string) => {
  _.eachDeep(
    doc,
    (value, key, parent, context) => {
      if (key === "$ref") {
        parent[key] = transformation(value);
      }
    },
    {}
  );
};
