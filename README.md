# conformance-rules-editor

## Reference Guide

https://cdisc-org.github.io/conformance-rules-editor/

## Environment Setup

### Install Node

Install Node.js version **20**: https://nodejs.org/en/download/releases

### Install dependencies

1. Install frontend dependencies - From the root directory, run the command: `npm install`
2. Install api dependencies - From the ./api directory, run the command: `npm install`
3. Install static web app node libraries by running the following commands:
   ```
   npm install -g @azure/static-web-apps-cli@2.0.5
   ```
4. Using VSCODE, install the "Azure Functions" extension.
5. Create a local.settings.json in the API folder to support local development of the API. It should contain the following values which provide information for the staticwebapp config and the Microsoft Graph API for Users' name resolution:

   ```
   {
       "IsEncrypted": false,
       "Values": {
         "EXECUTE_RULE_URL": "<RULE_EXECUTOR_URL>",
         "FUNCTIONS_WORKER_RUNTIME": "node",
         "SWA_TENANT_ID": "<Static Web App Tenant ID>",
         "SWA_CLIENT_ID": "<Static Web App Client ID>",
         "SWA_CLIENT_SECRET": "<Static Web App Client Secret>",
         "CORE_AUTHOR_GROUP": "<User Group ID for write permissions>",
         "RULE_SCHEMA_URL": "https://raw.githubusercontent.com/cdisc-org/cdisc-rules-engine/main/resources/schema/rule/CORE-base.json"
       }
   }
   ```

   By default, the Rules Editor will use the `MSGraph` Users Provider. If you do not have a SWA tenant, you can omit the `SWA_TENANT_ID`, `SWA_CLIENT_ID`, `SWA_CLIENT_SECRET`, and `CORE_AUTHOR_GROUP` variables. Instead, you can use the following:

   ```
   "USERS_PROVIDER": "Dummy",
   ```

6. Storage - Currently, Rule Editor supports CosmosDB and requires the additional env variables to be added to the local.settings.json file

   - CosmosDB (SQL)

     ```
     "STORAGE_PROVIDER": "CosmosSQL",
     "COSMOS_BASE_URL": <COSMOS_BASE_URL>,
     "COSMOS_KEY": <COSMOS_KEY>,
     "COSMOS_DATABASE": <COSMOS DB Name>,
     "COSMOS_CONTAINER": <COSMOS Container Name>,
     "COSMOS_HISTORY_CONTAINER": <COSMOS History Container Name>
     ```

     Optional env variable to ignore unauthorized https connections when cosmosdb is running in a local emulator:

     ```
     "NODE_TLS_REJECT_UNAUTHORIZED": "0",
     ```

## Running the App

If using Windows, you may need to change the Powershell execution policy:

1. Open Powershell in Administrator mode
2. Run the command: `Set-ExecutionPolicy RemoteSigned` and input `Y` at the prompt.

### Using VSCode

Run the "Everything" compound (see launch.json).

A browser should open that points to: http://localhost:4280/

Alternatively, you can run the launch components individually.

### Using the commandline

Run: `$Env:BROWSER='none'; npm run --prefix ./api build; swa start http://localhost:3000 --api-location ./api --run 'npm start'`

Navigate to: http://localhost:4280/

## More...

For more development details, refer to the [wiki](https://github.com/cdisc-org/conformance-rules-editor/wiki).
