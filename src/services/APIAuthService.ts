
import { API_URL, API_CLIENT_ID, API_CLIENT_SECRET, API_SCOPE, API_GRANT_TYPE, API_USERNAME, API_PASSWORD } from "../config";

export class APIAuthService {
  private token: string
  private expires_time: number
  constructor() {
    this.token = null;
    this.expires_time = null;
  }

  private getQueryString = (data: { [key: string]: string; } = {}) => {
    return Object.entries(data)
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
      .join('&');
  };

  private generateToken = async (): Promise<{ token?: any, expires?: number}> => {
    const response = await fetch(API_URL+`oauth/token`, {
      method: "post",
      headers: { "Content-Type" : "application/x-www-form-urlencoded" },
      body: this.getQueryString({
        "grant_type": API_GRANT_TYPE,
        "scope": API_SCOPE,
        "client_id": API_CLIENT_ID,
        "client_secret": API_CLIENT_SECRET,
      }),
    })
    
    if (response.ok) {
      const data = await response.json()
      return {
        token: data.token,
        expires: Date.now() + data.expires_in
      }
    } else {
      return null
    }

  }

  public getToken = async (): Promise<string> => {
    if (this.token == null || this.expires_time < Date.now()) {
      const tokenData = await this.generateToken()
      this.token = tokenData?.token
      this.expires_time = tokenData?.expires
    }

    return this.token
  }
}