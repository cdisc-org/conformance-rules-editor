import { STORAGE_PROVIDER } from "../providers/BaseStorage";
import handle_response from "../utils/handle_response";
import { formatYAML, removeInvalidCoreid } from "../utils/json_yaml";

export default async (context, req) => {
  await handle_response(context, async () => ({
    body: await STORAGE_PROVIDER.postRule(
      formatYAML(removeInvalidCoreid(req.body.content)),
      req.body.creatorId
    ),
  }));
};
