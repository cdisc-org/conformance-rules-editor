const https = require('https');
const {StorageAuthenticator} = require("../utils/AuthService")

const validParamNames = new Set([
    "page[offset]",
    "page[limit]",
    "sort",
    "fields[node--conformance_rule]",
    "filter[title][operator]",
    "filter[title][value]",
    "filter[field_conformance_rule_type][operator]",
    "filter[field_conformance_rule_type][value]",
    "filter[field_conformance_rule_creator][operator]",
    "filter[field_conformance_rule_creator][value]",
    "filter[id][operator]",
    "filter[id][value]",
    "filter[status][operator]",
    "filter[status][value]",
    "filter[created][operator]",
    "filter[created][value]",
    "filter[changed][operator]",
    "filter[changed][value]",
    "filter[revision_timestamp][operator]",
    "filter[revision_timestamp][value]",
    "filter[body.value][operator]",
    "filter[body.value][value]",
]);

module.exports = async function (context, req) {
    const url = process.env["API_BASE_URL"]
    const token = await StorageAuthenticator.getToken()
    const filteredParams = Object.fromEntries(
        Object.entries(context.bindingData.query).filter(
            ([name, value]) => validParamNames.has(name) && value !== undefined)
    );
    const paramsWithDefaults = {
        ...filteredParams,
        "page[limit]": context.bindingData.query["page[limit]"] || 50
    };
    let path = "/jsonapi/node/conformance_rule"
    path = path + "?" + new URLSearchParams(paramsWithDefaults)
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
