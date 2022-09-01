# conformance-rules-editor

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