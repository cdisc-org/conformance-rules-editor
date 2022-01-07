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
      "FUNCTIONS_WORKER_RUNTIME":"node",
      "API_BASE_URL": "<STORAGE_API_URL>",
      "API_PATH": "<STORAGE_API_PATH>",
      "API_GRANT_TYPE": "<STORAGE_API_GRANT_TYPE>",
      "API_SCOPE": "<STORAGE_API_SCOPE>",
      "API_CLIENT_ID": "<STORAGE_API_CLIENT_ID>",
      "API_CLIENT_SECRET": "<STORAGE_API_CLIENT_SECRET>",
      "GENERATE_RULE_URL": "<RULE_GENERATOR_URL (with code param)>",
      "EXECUTE_RULE_URL": "<RULE_EXECUTOR_URL>",
      "ENGINE_BASE_URL": "<ENGINE_API_URL>",
      "ENGINE_PATH": "<ENGINE_API_PATH>",
      "ENGINE_GRANT_TYPE": "<ENGINE_API_GRANT_TYPE>",
      "ENGINE_SCOPE": "<ENGINE_API_SCOPE>",
      "ENGINE_CLIENT_ID": "<ENGINE_API_CLIENT_ID>",
      "ENGINE_CLIENT_SECRET": "<ENGINE_API_CLIENT_SECRET>"
    }
}
```

## Running the App

1. Run the command `npm run build`
2. Run the app with the command: `swa start build --api api`
3. View the app running at: http://localhost:4280/

Alternatively, the app can be run with a single command: `$Env:BROWSER='none'; swa start http://localhost:3000/ --api api --run 'npm start' --devserver-timeout 120000`
