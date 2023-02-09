import { STORAGE_PROVIDER } from "../providers/BaseStorage";
import { USERS_PROVIDER } from "../providers/BaseUsers";
import { IQuery } from "../types/IQuery";
import { IRule } from "../types/IRule";
import handle_response from "../utils/handle_response";

async function usernameQueryToUserid(query: IQuery) {
  // convert the storage query select variable from creator name to creator id
  query.select = query.select.map((col) =>
    col === "creator.name" ? "creator.id" : col
  );
  // For any storage query filters that search for user names using "contains", convert the storage query filters to userid filters using "in"
  const creatorNameFilters = query.filters.filter(
    (filter) => filter.name === "creator.name" && filter.operator === "contains"
  );
  for (const creatorNameFilter of creatorNameFilters) {
    creatorNameFilter.name = "creator.id";
    creatorNameFilter.operator = "in";
    // Get a list of userids matching a username substring from the Users provider
    creatorNameFilter.value = (
      await USERS_PROVIDER.getUsersByName(creatorNameFilter.value.toString())
    ).map((user) => user.id);
  }
}

async function addUsernames(rules: IRule[]) {
  // Get list of all unique userids in the rules list and get matching usernames from the Users provider
  const users = await USERS_PROVIDER.getUsersByIds([
    ...new Set(rules.map((rule) => rule.creator.id)),
  ]);
  for (const rule of rules) {
    rule.creator = users[rule.creator.id];
  }
}

export default async (context, req) => {
  await handle_response(context, async () => {
    const query: IQuery = JSON.parse(req.query.query);

    // The username search string needs to be converted to a list of userids for the storage provider.
    await usernameQueryToUserid(query);
    // Get list of rules from storage using the updated query
    const rules = await STORAGE_PROVIDER.getRules(query);
    // Add usernames to rules using the User provider
    await addUsernames(rules.rules);

    return {
      body: rules,
    };
  });
};
