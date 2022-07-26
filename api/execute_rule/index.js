const post_json = require("../utils/post_json");
const Authenticator = require("../utils/AuthService");

const EngineAuthenticator = new Authenticator(
  process.env["ENGINE_BASE_URL"],
  process.env["ENGINE_PATH"],
  process.env["ENGINE_GRANT_TYPE"],
  process.env["ENGINE_SCOPE"],
  process.env["ENGINE_CLIENT_ID"],
  process.env["ENGINE_CLIENT_SECRET"]
);

module.exports = async function (context, req) {
  await post_json(
    context,
    req,
    process.env["EXECUTE_RULE_URL"],
    await EngineAuthenticator.getToken()
  );
};
