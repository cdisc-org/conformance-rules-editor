import { STORAGE_PROVIDER } from "../providers/BaseStorage";
import handle_response from "../utils/handle_response";
import { formatYAML } from "../utils/json_yaml";

export default async (context, req) => {
  req.body.content = formatYAML(req.body.content);
  await handle_response(context, async () => ({
    body: await STORAGE_PROVIDER.patchRule(context.bindingData.id, req.body),
  }));
};
