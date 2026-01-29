import { STORAGE_PROVIDER } from "../providers/BaseStorage";
import handle_response from "../utils/handle_response";
import { addUsernamesToRule } from "../providers/BaseUsers";
import { getUser } from "../utils/SWAUtils";
import { publish } from "../utils/json_yaml";

const next_core_id = async () =>
  `CORE-${(parseInt((await STORAGE_PROVIDER.maxCoreId()).slice(-6)) + 1)
    .toString()
    .padStart(6, "0")}`;

export default async (context, req) => {
  await handle_response(context, async () => {
    const rule = await STORAGE_PROVIDER.getRule(context.bindingData.id);
    rule.content = await publish(rule.content, next_core_id);
    rule.creator = { id: getUser(req).userId };
    const publishedRule = await STORAGE_PROVIDER.patchRule(rule);
    await addUsernamesToRule(publishedRule);
    return {
      body: publishedRule,
    };
  });
};
