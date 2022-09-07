import post_json from "../utils/post_json";

export default async (context, req) => {
  await post_json(context, req, process.env["EXECUTE_RULE_URL"]);
};
