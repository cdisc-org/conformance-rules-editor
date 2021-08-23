# conformance-rules-editor

## Environment Setup 

1. Run the command: `npm install`
2. Create a .env file with the following environment variables defined:

```
REACT_APP_B2C_API_TOKEN_SCOPES=<Azure ADB2C Token scopes>
REACT_APP_B2C_TENANT_NAME=<Azure ADB2C Tenant name>
REACT_APP_B2C_CLIENT_ID=<Client name in ADB2C Tenant>
REACT_APP_B2C_FLOW_SIGN_IN_NAME=<Sign in flow name>
REACT_APP_B2C_FLOW_SIGN_IN_ENDPOINT=<Sign in endpoint>
REACT_APP_FORCE_LOGIN=<true or false>
REACT_APP_API_GRANT_TYPE=<API GRANT TYPE>
REACT_APP_API_SCOPE=<SCOPE>
REACT_APP_API_BASE_URL=<URL>
REACT_APP_API_CLIENT_ID=<API CLIENT ID>
REACT_APP_API_CLIENT_SECRET=<API CLIENT SECRET>
```

## Running the App

1. Run the command `npm start`
2. View the app running at: http://localhost:3000/