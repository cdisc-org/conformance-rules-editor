const https = require('https');

module.exports = async function (context, req) {
    const url = process.env["API_BASE_URL"]
    const options = {
        hostname: url,
        path: '/jsonapi/node/rule',
        method: 'GET',
        headers: {
            
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