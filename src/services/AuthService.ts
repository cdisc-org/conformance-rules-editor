import { AccountInfo, Configuration, LogLevel, PublicClientApplication } from "@azure/msal-browser";
import { AUTHENTICATION, B2C_TOKEN_SCOPES, PUBLIC_URL } from "../config";

const LOGIN_SCOPES = [
  ...B2C_TOKEN_SCOPES,
  "offline_access"
  // required to obtain a refresh token with B2C -> https://github.com/AzureAD/microsoft-authentication-library-for-js/issues/1999
  // with offline_access, we get a 14-day refresh token (not recommended for production)
  // without offline_access, we should get a 24-hour refresh token, however we don't receive a refresh token at all which causes the user to re-auth every 60 mins
  // this may be fixed when all non-SPA redirectUri types are removed from the App Registration per linked issue
];

const B2C_TENANT_URL = `${AUTHENTICATION.tenant}.b2clogin.com`;

export const BASE_REDIRECT_URL = `${window.location.origin}${PUBLIC_URL}/`;

export class AuthService {
  private msalApp: PublicClientApplication;

  constructor() {
    this.msalApp = this.initPublicClient();
  }

  public get msal(): PublicClientApplication {
    return this.msalApp;
  }

  private initPublicClient = (): PublicClientApplication => {
    const msalConfig: Configuration = {
      auth: {
        authority: AUTHENTICATION.b2cPolicies.authorities.signUpSignIn.authority,
        clientId: AUTHENTICATION.clientId,
        knownAuthorities: [ `${AUTHENTICATION.tenant}.b2clogin.com` ],
        postLogoutRedirectUri: BASE_REDIRECT_URL,
        navigateToLoginRequestUrl: true,
      },
      cache: {
        cacheLocation: "localStorage",
        storeAuthStateInCookie: true,
      },
      system: {
        loggerOptions: {
          logLevel: LogLevel.Verbose,
          piiLoggingEnabled: false
        }
      }
    };

    const msal = new PublicClientApplication(msalConfig);
    return msal;
  }

  private getAccount = (): AccountInfo => this.msalApp.getAllAccounts().find(a => a.environment === B2C_TENANT_URL);

  public isAuthenticated = (): boolean => !!this.getAccount();

  public login = async (redirectStartPage?: string): Promise<void> => this.msalApp.loginRedirect({
      authority: AUTHENTICATION.b2cPolicies.authorities.signUpSignIn.authority,
      scopes: LOGIN_SCOPES,
      redirectUri: BASE_REDIRECT_URL,
      redirectStartPage
    });

  public logout = async (): Promise<void> => {
    let account = null;
    try {
      account = this.getAccount();
    }
    catch (error) {
      // Nothing to do here
    }
    finally {
      this.msalApp.logout(account ?? { account });
    }
  };

  public getToken = async (): Promise<string> => {
    let token = null;
    const account = this.getAccount();

    try {
      if (account) {
        try {
          // First Attempt: Silent Token Acquisition
          const silentTokenResult = await this.msalApp.acquireTokenSilent({
            scopes: LOGIN_SCOPES,
            account
          });
          if (silentTokenResult && silentTokenResult.accessToken) {
            token = silentTokenResult.accessToken;
          }
        }
        catch (error) {
          // Second Attempt: Redirect Token Acquisition
          await this.msalApp.acquireTokenRedirect({
            scopes: LOGIN_SCOPES,
            account
          });
        }
      }
      else {
        await this.login();
      }
    }
    catch (error) {
      // Nothing to do here
    }

    return token;
  }
}