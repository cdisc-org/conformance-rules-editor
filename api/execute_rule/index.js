const post_json = require("../utils/post_json");
const { EngineAuthenticator } = require("../utils/AuthService");

module.exports = async function (context, req) {
  await post_json(
    context,
    req,
    process.env["EXECUTE_RULE_URL"],
    await EngineAuthenticator.getToken()
  );
};
