const { STORAGE_PROVIDER } = require("../providers/BaseStorage");
const handle_response = require("../utils/handle_response");

module.exports = async function (context, req) {
  await handle_response(context, async () => ({
    body: await STORAGE_PROVIDER.postRule(req.body.content, req.body.creator),
  }));
};
