import { STORAGE_PROVIDER } from "../providers/BaseStorage";
import { USERS_PROVIDER } from "../providers/BaseUsers";
import { IQuery } from "../types/IQuery";
import handle_response from "../utils/handle_response";

export default async (context, req) => {
  await handle_response(context, async () => {
    const query: IQuery = JSON.parse(req.query.query);
    query.select.splice(query.select.indexOf("creator.name"), 1, "creator.id");
    const creatorNameFilters = query.filters.filter(
      (filter) =>
        filter.name === "creator.name" && filter.operator === "contains"
    );
    for (const creatorNameFilter of creatorNameFilters) {
      creatorNameFilter.name = "creator.id";
      creatorNameFilter.operator = "in";
      creatorNameFilter.value = (
        await USERS_PROVIDER.getUsersByName(creatorNameFilter.value.toString())
      ).map((user) => user.id);
    }
    const rules = await STORAGE_PROVIDER.getRules(query);
    const users = await USERS_PROVIDER.getUsersByIds([
      ...new Set(rules.rules.map((rule) => rule.creator.id)),
    ]);
    return {
      body: {
        ...rules,
        rules: rules.rules.map((rule) => ({
          ...rule,
          creator: users[rule.creator.id],
        })),
      },
    };
  });
};
