const post_json = require("../utils/post_json");

module.exports = async function (context, req) {
  await post_json(context, req, process.env["EXECUTE_RULE_URL"]);
};
