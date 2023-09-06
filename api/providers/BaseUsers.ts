import { IQuery } from "../types/IQuery";
import { IRule } from "../types/IRule";
import { IUsers } from "../types/IUsers";
import DummyUsers from "./DummyUsers";
import MSGraphUsers from "./MSGraphUsers";

const USERS_PROVIDERS: { [provider: string]: IUsers } = {
  Dummy: DummyUsers,
  MSGraph: MSGraphUsers,
};

export const USERS_PROVIDER =
  USERS_PROVIDERS[process.env["USERS_PROVIDER"] ?? "MSGraph"];

export async function usernameQueryToUserid(query: IQuery) {
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

export async function addUsernamesToRules(rules: IRule[]) {
  // Get list of all unique userids in the rules list and get matching usernames from the Users provider
  const users = await USERS_PROVIDER.getUsersByIds([
    ...new Set(rules.map((rule) => rule.creator.id)),
  ]);
  for (const rule of rules) {
    rule.creator = users[rule.creator.id] ?? {
      id: rule.creator.id,
      name: null,
    };
  }
}

export async function addUsernamesToRule(rule: IRule) {
  const histories = rule.history ?? [];
  // Get list of all unique userids in the rule history list and get matching usernames from the Users provider
  const users = await USERS_PROVIDER.getUsersByIds([
    ...new Set(histories.map((history) => history.creator.id)),
  ]);
  for (const history of histories) {
    history.creator = users[history.creator.id] ?? {
      id: history.creator.id,
      name: null,
    };
  }
}
