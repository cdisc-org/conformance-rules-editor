const https = require('https');
const querystring = require('querystring');

class Authenticator {
    constructor() {
        this.token = "";
        this.expires = Date.now();
    }
    async generateToken() {
        const url = process.env["API_BASE_URL"]
        const options = {
            hostname: url,
            path: '/oauth/token',
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        }

        var resp_body = ""
        return new Promise((resolve, reject) => {
            var req = https.request(options, (resp) => {
                resp.on("data", (chunk) => {
                    resp_body += chunk
                });

                resp.on("end", () => resolve(resp_body))
            })
            req.on('error', (error) => {
                console.log("error")
            })
            req.write(querystring.stringify({
                "grant_type": process.env["API_GRANT_TYPE"],
                "scope": process.env["API_SCOPE"],
                "client_id": process.env["API_CLIENT_ID"],
                "client_secret": process.env["API_CLIENT_SECRET"]
            }))
            req.end()
            return resp_body
        })
    }

    async getToken() {
        if (this.token === "" || Date.now() > this.expires) {
            console.log("generating new token")
            const data = await this.generateToken()
            const json_data = JSON.parse(data)
            this.token = json_data["access_token"]
            this.expires = Date.now() + json_data["expires_in"]
        }
        return this.token
    }
}

module.exports = new Authenticator()
