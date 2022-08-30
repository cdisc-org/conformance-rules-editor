import post_json from "../utils/post_json";
import Authenticator from "../utils/AuthService";

const EngineAuthenticator = new Authenticator(
  process.env["ENGINE_BASE_URL"],
  process.env["ENGINE_PATH"],
  process.env["ENGINE_GRANT_TYPE"],
  process.env["ENGINE_SCOPE"],
  process.env["ENGINE_CLIENT_ID"],
  process.env["ENGINE_CLIENT_SECRET"]
);

export default async (context, req) => {
  await post_json(
    context,
    req,
    process.env["EXECUTE_RULE_URL"],
    await EngineAuthenticator.getToken()
  );
};
