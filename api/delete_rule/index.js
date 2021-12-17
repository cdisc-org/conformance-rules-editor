const https = require('https');
const {StorageAuthenticator} = require("../utils/AuthService")

module.exports = async function (context, req) {
    const url = process.env["API_BASE_URL"]
    const token = await StorageAuthenticator.getToken()
    const ruleId = context.bindingData.id

    const options = {
        hostname: url,
        path: `/jsonapi/node/conformance_rule/${ruleId}`,
        method: 'DELETE',
        headers: {
            "Authorization": "Bearer " + token,
            "Content-Type": "application/vnd.api+json"
        }
    }

    await new Promise((resolve, reject) => {
        https.get(options, (resp) => {
            context.res.json({
                body: JSON.stringify(resp.statusCode)
            })
            context.done();
        }).on('error', (error) => {
            context.res = {
                status: 500,
                body: error
            };
            context.done();
        }).end()
    });
}
