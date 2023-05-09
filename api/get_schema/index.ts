import fetch from "node-fetch";
import handle_response from "../utils/handle_response";

export default async (context, req) => {
  const res = await (
    await fetch(
      "https://raw.githubusercontent.com/cdisc-org/cdisc-rules-engine/main/resources/schema/CORE-base.json",
      {
        headers: {
          Accept: "application/json",
        },
      }
    )
  ).json();
  return await handle_response(context, async () => ({
    body: res,
  }));
};
