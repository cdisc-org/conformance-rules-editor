const https = require('https');
const {StorageAuthenticator} = require("../utils/AuthService")

module.exports = async function (context, req) {
    const url = process.env["API_BASE_URL"]
    const token = await StorageAuthenticator.getToken()
    const ruleId = context.bindingData.id
    
    const options = {
        hostname: url,
        path: `/jsonapi/node/conformance_rule/${ruleId}`,
        method: 'GET',
        headers: {
            "Authorization": "Bearer " + token
        }
    }

    var resp_body = ""
    await new Promise((resolve, reject) => {
        https.get(options, (resp) => {
            resp.on("data", (chunk) => {
                resp_body += chunk
            });

            resp.on("end", () => {
                context.res.json({
                    body: resp_body
                })
                context.done();
            })
        }).on('error', (error) => {
            context.res = {
                status: 500,
                body: error
            };
            context.done();
        }).end()
    })
}
