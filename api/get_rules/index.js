const https = require('https');
const Authenticator = require("../utils/AuthService")

module.exports = async function (context, req) {
    const url = process.env["API_BASE_URL"]
    const token = await Authenticator.getToken()
    // If the bind value is set to 0, a string object is given instead of int. Maybe a bug in swa?
    const pageOffset = context.bindingData.pageOffset === null || typeof context.bindingData.pageOffset === 'object' ? 0 : context.bindingData.pageOffset;
    const pageLimit = context.bindingData.pageLimit

    console.log(`/jsonapi/node/conformance_rule?page[offset]=${pageOffset}&page[limit]=${pageLimit}`);
    console.log(pageOffset);
    const options = {
        hostname: url,
        path: `/jsonapi/node/conformance_rule?page[offset]=${pageOffset}&page[limit]=${pageLimit}`,
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
