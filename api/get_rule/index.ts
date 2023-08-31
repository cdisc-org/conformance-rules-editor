import { STORAGE_PROVIDER } from "../providers/BaseStorage";
import { addUsernamesToRule } from "../providers/BaseUsers";
import handle_response from "../utils/handle_response";

export default async (context, req) => {
  await handle_response(context, async () => {
    const rule = await STORAGE_PROVIDER.getRule(
      context.bindingData.id,
      context.bindingData.version
    );
    await addUsernamesToRule(rule);
    return {
      body: rule,
    };
  });
};
