/**
 * Module to wrap configuration received from environment variables at build time. Responsible for setting default values when configuration keys are not explicitly set.
 * @packageDocumentation
 *
 * @module Config
 */
 import parseBoolString from "./utilities/DataUtils";

 // Create React App Environment Variables
 // https://create-react-app.dev/docs/adding-custom-environment-variables

 /**
  * B2C Authentication Configuration
  */
 export const AUTHENTICATION = {
   tenant: process.env.REACT_APP_B2C_TENANT_NAME,
   clientId: process.env.REACT_APP_B2C_CLIENT_ID,
   b2cPolicies: {
     names: {
       signUpSignIn: process.env.REACT_APP_B2C_FLOW_SIGN_IN_NAME,
       forgotPassword: process.env.REACT_APP_B2C_FLOW_PASSWORD_RESET_NAME,
       editProfile: process.env.REACT_APP_B2C_FLOW_EDIT_PROFILE_NAME,
     },
     authorities: {
       signUpSignIn: {
         authority: process.env.REACT_APP_B2C_FLOW_SIGN_IN_ENDPOINT
       },
       forgotPassword: {
         authority: process.env.REACT_APP_B2C_FLOW_PASSWORD_RESET_ENDPOINT
       },
       editProfile: {
         authority: process.env.REACT_APP_B2C_FLOW_EDIT_PROFILE_ENDPOINT
       },
     }
   }
 }

 /**
  * Base path of the SPA.
  */
 export const {PUBLIC_URL} = process.env;

 /**
  * Define the B2C token scopes that will be requested when a B2C access token is acquired for calling the API.
  *
  * Default Value: `[]`
  */
 export const B2C_TOKEN_SCOPES =  typeof(process.env.REACT_APP_B2C_API_TOKEN_SCOPES) === "undefined" ? [] : process.env.REACT_APP_B2C_API_TOKEN_SCOPES.split(",");

 /**
  * Require the user to be authenticated when accessing the SPA. If enabled, users will be redirected to the B2C login page upon accessing the SPA.
  *
  * Default Value: `true`
  */
 export const FORCE_LOGIN = typeof(process.env.REACT_APP_FORCE_LOGIN) === "undefined" ? true : parseBoolString(process.env.REACT_APP_FORCE_LOGIN);

 export const API_URL = process.env.REACT_APP_API_BASE_URL
 export const API_CLIENT_ID = process.env.REACT_APP_API_CLIENT_ID
 export const API_CLIENT_SECRET = process.env.REACT_APP_API_CLIENT_SECRET
 export const API_GRANT_TYPE = process.env.REACT_APP_API_GRANT_TYPE
 export const API_SCOPE = process.env.REACT_APP_API_SCOPE
 export const API_USERNAME = process.env.REACT_APP_API_USERNAME
 export const API_PASSWORD = process.env.REACT_APP_API_PASSWORD