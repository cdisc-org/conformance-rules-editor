/**
 * Base HTTP data service to handle all requests. Client-side request caching is enabled at this layer.
 * @packageDocumentation
 *
 * @module DataService
 */
 import { APIAuthService } from "./APIAuthService";
 import { API_URL } from "../config";

 export class DataService {
    private auth: APIAuthService;

    constructor(auth: APIAuthService) {
        this.auth = auth;;
      }

    private _fetch = async (url) => {
        const accessToken = await this.auth.getToken();
        const response = await fetch( API_URL + url, {
            method: 'GET',
            headers: {
              'Accept': "application/json",
              'Authorization': `Bearer ${accessToken}`,
            }
          });
        return response
    }

    public getRules = async () => {
        const response = await this._fetch("/rules")
        return response
    }

 }


