const https = require('https');
const {StorageAuthenticator} = require("../utils/AuthService")

module.exports = async function (context, req) {
    const url = process.env["API_BASE_URL"]
    const token = await StorageAuthenticator.getToken()

    const options = {
        hostname: url,
        path: `/jsonapi/node/conformance_rule`,
        method: 'POST',
        headers: {
            "Authorization": "Bearer " + token,
            "Accept": "application/vnd.api+json",
            "Content-Type": "application/vnd.api+json"
        }
    }

    var resp_body = ""
    const request =
        https.request(options, (resp) => {
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
        });
    request.write(JSON.stringify(req.body));
    await new Promise((resolve, reject) => {
        request.end();
    });
}
