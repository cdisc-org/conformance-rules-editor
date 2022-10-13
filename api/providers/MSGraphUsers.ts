import { Client } from "@microsoft/microsoft-graph-client";
import { TokenCredentialAuthenticationProvider } from "@microsoft/microsoft-graph-client/authProviders/azureTokenCredentials";
import { ClientSecretCredential } from "@azure/identity";
import "isomorphic-fetch";
import { IUser } from "../types/IUser";

const authProvider = new TokenCredentialAuthenticationProvider(
  new ClientSecretCredential(
    process.env["SWA_TENANT_ID"],
    process.env["SWA_CLIENT_ID"],
    process.env["SWA_CLIENT_SECRET"]
  ),
  {
    scopes: ["https://graph.microsoft.com/.default"],
  }
);

const client = Client.initWithMiddleware({
  debugLogging: true,
  authProvider,
});

interface IMSGraphUser {
  id: string;
  displayName: string;
}

const getUsersByIds = async (
  ids: string[]
): Promise<{ [id: string]: IUser }> => {
  return ids.length
    ? Object.assign(
        {},
        ...(
          await client
            .api("/users")
            .filter(`id in (${ids.map((id) => `'${id}'`).join(", ")})`)
            .get()
        ).value.map((user: IMSGraphUser) => ({
          [user.id]: { id: user.id, name: user.displayName },
        }))
      )
    : {};
};

const getUsersByName = async (name: string): Promise<IUser[]> => {
  const users: IUser[] = [];
  var response: {
    value: IMSGraphUser[];
    "@odata.nextLink"?: string;
  };
  for (
    var nextLink = `/users?$filter=startsWith(displayName, '${name.replace(
      /'/g,
      "''"
    )}')`;
    nextLink;
    nextLink = response["@odata.nextLink"]
  ) {
    response = await client.api(nextLink).get();
    users.push(
      ...response.value.map((user) => ({
        id: user.id,
        name: user.displayName,
      }))
    );
  }
  return users;
};

export default {
  getUsersByIds,
  getUsersByName,
};
