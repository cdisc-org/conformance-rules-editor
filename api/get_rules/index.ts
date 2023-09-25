import { STORAGE_PROVIDER } from "../providers/BaseStorage";
import {
  addUsernamesToRules,
  usernameQueryToUserid,
} from "../providers/BaseUsers";
import { IQuery } from "../types/IQuery";
import handle_response from "../utils/handle_response";

export default async (context, req) => {
  await handle_response(context, async () => {
    const query: IQuery = JSON.parse(req.query.query);

    // The username search string needs to be converted to a list of userids for the storage provider.
    await usernameQueryToUserid(query);
    // Get list of rules from storage using the updated query
    const rules = await STORAGE_PROVIDER.getRules(query);
    // Add usernames to rules using the User provider
    await addUsernamesToRules(rules.rules);

    return {
      body: rules,
    };
  });
};
