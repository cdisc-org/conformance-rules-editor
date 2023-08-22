import { STORAGE_PROVIDER } from "../providers/BaseStorage";
import handle_response from "../utils/handle_response";
import { formatYAML, removeInvalidCoreid } from "../utils/json_yaml";

export default async (context, req) => {
  req.body.content = formatYAML(
    removeInvalidCoreid(
      req.body.content,
      (await STORAGE_PROVIDER.getRule(context.bindingData.id)).content
    )
  );
  await handle_response(context, async () => ({
    body: await STORAGE_PROVIDER.patchRule(context.bindingData.id, req.body),
  }));
};
