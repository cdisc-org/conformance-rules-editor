import { STORAGE_PROVIDER } from "../providers/BaseStorage";
import { addUsernamesToRule } from "../providers/BaseUsers";
import handle_response from "../utils/handle_response";
import { formatYAML, removeInvalidCoreid } from "../utils/json_yaml";

export default async (context, req) => {
  req.body.content = formatYAML(
    removeInvalidCoreid(
      req.body.content,
      (await STORAGE_PROVIDER.getRule(context.bindingData.id)).content
    )
  );
  await handle_response(context, async () => {
    const rule = await STORAGE_PROVIDER.patchRule({
      ...req.body,
      id: context.bindingData.id,
    });
    await addUsernamesToRule(rule);
    return {
      body: rule,
    };
  });
};
