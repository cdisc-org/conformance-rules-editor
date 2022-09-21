# conformance-rules-editor

## Reference Guide

https://cdisc-org.github.io/conformance-rules-editor/

## Environment Setup

### Install dependencies

1. Install frontend dependencies - From the root directory, run the command: `npm install`
2. Install api dependencies - From the ./api directory, run the command: `npm install`
3. Install static web app node libraries by running the following commands:
   ```
   npm install -g @azure/static-web-apps-cli
   ```
4. Using VSCODE, install the "Azure Functions" extension.
5. Create a local.settings.json in the API folder to support local development of the API. It should contain the following values:
   ```
   {
       "IsEncrypted": false,
       "Values": {
         "EXECUTE_RULE_URL": "<RULE_EXECUTOR_URL>",
         "FUNCTIONS_WORKER_RUNTIME":"node"
       }
   }
   ```
6. Storage - There is a base Storage abstraction which allows for any storage implementation. Currently there are 2 storage implementations. Using one of these implementations requires the additional env variables to be added to the local.settings.json file

   - CosmosDB (SQL)

     Tell the editor which storage implementation to use:

     ```
     "STORAGE_PROVIDER": "CosmosSQL",
     ```

     ```
     "COSMOS_BASE_URL": <COSMOS_BASE_URL>,
     "COSMOS_KEY": <COSMOS_KEY>,
     "COSMOS_DATABASE": <COSMOS DB Name>,
     "COSMOS_CONTAINER": <COSMOS Container Name>,
     ```

     Optional env variable to ignore unauthorized https connections when cosmosdb is running in a local emulator:

     ```
     "NODE_TLS_REJECT_UNAUTHORIZED": "0",
     ```

   - Drupal

     Tell the editor which storage implementation to use:

     ```
     "STORAGE_PROVIDER": "Drupal",
     ```

     ```
     "DRUPAL_BASE_URL": "<DRUPAL_API_URL>",
     "DRUPAL_CLIENT_ID": "<DRUPAL_API_CLIENT_ID>",
     "DRUPAL_CLIENT_SECRET": "<DRUPAL_API_CLIENT_SECRET>",
     "DRUPAL_GRANT_TYPE": "<DRUPAL_API_GRANT_TYPE>",
     "DRUPAL_PATH": "<DRUPAL_API_PATH>",
     "DRUPAL_SCOPE": "<DRUPAL_API_SCOPE>",
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

Run: `$Env:BROWSER='none'; swa start http://localhost:3000 --api-location ./api --run 'npm start'`

Navigate to: http://localhost:4280/
