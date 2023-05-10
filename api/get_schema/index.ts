import fetch from "node-fetch";
import handle_response from "../utils/handle_response";

export default async (context, req) => {
  const res = await (
    await fetch(process.env["RULE_SCHEMA_URL"], {
      headers: {
        Accept: "application/json",
      },
    })
  ).json();
  return await handle_response(context, async () => ({
    body: res,
  }));
};
