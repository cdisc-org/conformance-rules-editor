const https = require("https");

module.exports = class Authenticator {
  constructor(baseUrl, path, grantType, scope, clientId, clientSecret) {
    this.token = "";
    this.expires = Date.now();
    this.baseUrl = baseUrl;
    this.path = path;
    this.grantType = grantType;
    this.scope = scope;
    this.clientId = clientId;
    this.clientSecret = clientSecret;
  }

  async generateToken() {
    const postData = new URLSearchParams({
      grant_type: this.grantType,
      scope: this.scope,
      client_id: this.clientId,
      client_secret: this.clientSecret,
    }).toString();

    const options = {
      hostname: this.baseUrl,
      path: this.path,
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Content-Length": postData.length,
      },
    };

    var resp_body = "";
    return new Promise((resolve, reject) => {
      var req = https.request(options, (resp) => {
        resp.on("data", (chunk) => {
          resp_body += chunk;
        });

        resp.on("end", () => resolve(resp_body));
      });
      req.on("error", (error) => {
        console.log("error");
        console.log(error);
      });
      req.write(postData);
      req.end();
      return resp_body;
    });
  }

  async getToken() {
    if (this.token === "" || Date.now() > this.expires) {
      console.log("generating new token");
      const data = await this.generateToken();
      const json_data = JSON.parse(data);
      this.token = json_data["access_token"];
      this.expires = Date.now() + json_data["expires_in"];
    }
    return this.token;
  }
};
