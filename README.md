# conformance-rules-editor

## Environment Setup 

### Install dependencies
1. Run the command: `npm install`
2. Install static web app node libraries by running the following commands:
```
npm install -g @azure/static-web-apps-cli
npm install -g azure-functions-core-tools@3
```
3. Create a local.settings.json in the API folder to support local development of the API. It should contain the following values:

```
{
    "IsEncrypted": false,
    "Values": {
      "FUNCTIONS_WORKER_RUNTIME":"node",
      "API_BASE_URL": "<API_URL>",
      "API_GRANT_TYPE": "<API_GRANT_TYPE>",
      "API_SCOPE": "<API_SCOPE>",
      "API_CLIENT_ID": "<API_CLIENT_ID>",
      "API_CLIENT_SECRET": "<API_CLIENT_SECRET>"
    }
}
```

## Running the App

1. Run the command `npm run build`
2. Run the app with the command: `swa start build --api api`
3. View the app running at: http://localhost:4280/