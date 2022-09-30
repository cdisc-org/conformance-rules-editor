import fetch, { RequestInit, Response } from "node-fetch";

export default class Authenticator {
  token: string;
  expires: number;
  baseUrl: string;
  path: string;
  grantType: string;
  scope: string;
  clientId: string;
  clientSecret: string;

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

  async generateToken(): Promise<string> {
    const postData = new URLSearchParams({
      grant_type: this.grantType,
      scope: this.scope,
      client_id: this.clientId,
      client_secret: this.clientSecret,
    }).toString();

    const options: RequestInit = {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: postData,
    };

    const res: Response = await fetch(
      `https://${this.baseUrl}${this.path}`,
      options
    );
    if (res.status === 200) {
      return await res.json();
    } else {
      console.log(`Error generating token: ${res.status} - ${res.statusText}`);
    }
  }

  async getToken(): Promise<string> {
    if (this.token === "" || Date.now() > this.expires) {
      console.log("generating new token");
      const json_data = await this.generateToken();
      this.token = json_data["access_token"];
      this.expires = Date.now() + json_data["expires_in"];
    }
    return this.token;
  }
}
