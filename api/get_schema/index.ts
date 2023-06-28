import handle_response from "../utils/handle_response";
import bundleJsonSchema from "../utils/bundleJsonSchema";

export default async (context, req) => {
  const resolvedRefs = await bundleJsonSchema(process.env["RULE_SCHEMA_URL"]);

  return await handle_response(context, async () => ({
    body: resolvedRefs,
  }));
};
