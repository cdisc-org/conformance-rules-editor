# conformance-rules-editor

## Environment Setup 

### Install dependencies
1. Run the command: `npm install`
2. Install static web app node libraries by running the following commands:
    ```
    npm install -g @azure/static-web-apps-cli
    npm install -g azure-functions-core-tools@3
    ```
3. If using VSCODE, install the "Azure Functions" extension.
4. Create a local.settings.json in the API folder to support local development of the API. It should contain the following values:
    ```
    {
        "IsEncrypted": false,
        "Values": {
          "ENGINE_BASE_URL": "<ENGINE_API_URL>",
          "ENGINE_CLIENT_ID": "<ENGINE_API_CLIENT_ID>",
          "ENGINE_CLIENT_SECRET": "<ENGINE_API_CLIENT_SECRET>",
          "ENGINE_GRANT_TYPE": "<ENGINE_API_GRANT_TYPE>",
          "ENGINE_PATH": "<ENGINE_API_PATH>",
          "ENGINE_SCOPE": "<ENGINE_API_SCOPE>",
          "EXECUTE_RULE_URL": "<RULE_EXECUTOR_URL>",
          "FUNCTIONS_WORKER_RUNTIME":"node",
          "GENERATE_RULE_URL": "<RULE_GENERATOR_URL (with code param)>",
        }
    }
    ```
5. Storage - There is a base Storage abstraction which allows for any storage implementation. Currently there are 2 storage implementations. Using one of these implementations requires the additional env variables to be added to the local.settings.json file    
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

1. Run the command `npm run build`
2. Run the app with the command: `swa start build --api api`
3. View the app running at: http://localhost:4280/

Alternatively, the app can be run with a single command: `$Env:BROWSER='none'; swa start http://localhost:3000/ --api api --run 'npm start' --devserver-timeout 120000`
