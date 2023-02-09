import {
  BatchRequestContent,
  BatchResponseContent,
  Client,
} from "@microsoft/microsoft-graph-client";
import { User } from "@microsoft/microsoft-graph-types";
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

const maxChildClauses = 15;

const chunkify = <ListType>(
  list: ListType[],
  chunkSize: number
): ListType[][] =>
  [...Array(Math.ceil(list.length / chunkSize))].map((_) =>
    list.splice(0, chunkSize)
  );

const getUsersByIds = async (
  ids: string[]
): Promise<{ [id: string]: IUser }> => {
  if (!ids.length) {
    return {};
  }
  /* We need to batch requests for multiple userids 
  because graph only allows a filter with a max # of child clauses per query */
  const chunked = chunkify(ids, maxChildClauses);
  const requests = await new BatchRequestContent(
    chunked.map((chunk, chunkIndex) => ({
      id: chunkIndex.toString(),
      request: new Request(
        `/users?$filter=id+in+(${chunk.map((id) => `'${id}'`).join(", ")})`,
        {
          method: "GET",
        }
      ),
    }))
  ).getContent();
  const responses = [
    ...new BatchResponseContent(await client.api("/$batch").post(requests))
      .getResponses()
      .values(),
  ];
  const flat = (
    await Promise.all(
      responses.map(async (response: Response) => (await response.json()).value)
    )
  ).flat();
  const users = flat.map((user: User) => ({
    [user.id]: { id: user.id, name: user.displayName },
  }));
  return Object.assign({}, ...users);
};

const getUsersByName = async (name: string): Promise<IUser[]> => {
  const users: IUser[] = [];
  var response: {
    value: User[];
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

const getUserPermissions = async (user: IUser): Promise<IUser> => {
  if ("CORE_AUTHOR_GROUP" in process.env) {
    var link = `/users/${user.id}/memberOf?$count=true&$filter=id eq '${process.env["CORE_AUTHOR_GROUP"]}'`;
    const response = await client.api(link).get();
    user.write_allowed = response.value && response.value.length === 1;
  } else {
    user.write_allowed = true;
  }
  return user;
};

export default {
  getUsersByIds,
  getUsersByName,
  getUserPermissions,
};
