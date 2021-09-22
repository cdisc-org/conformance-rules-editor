const https = require('https');
const Authenticator = require("../utils/AuthService")

const propIfDefined = (name, value) => value !== undefined && { [name]: value };

module.exports = async function (context, req) {
    const url = process.env["API_BASE_URL"]
    const token = await Authenticator.getToken()
    const pageOffset = context.bindingData.query["page[offset]"] || 0;
    const pageLimit = context.bindingData.query["page[limit]"] || 50;
    let path = "/jsonapi/node/conformance_rule"
    path = path + "?" + new URLSearchParams({
        ...propIfDefined("page[offset]", pageOffset),
        ...propIfDefined("page[limit]", pageLimit),
    })
    const options = {
        hostname: url,
        path: path,
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
