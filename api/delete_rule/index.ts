import { STORAGE_PROVIDER } from "../providers/BaseStorage";
import handle_response from "../utils/handle_response";
import { formatYAML, unpublish } from "../utils/json_yaml";
import { getUser } from "../utils/SWAUtils";

export default async (context, req) => {
  const ruleBefore = await STORAGE_PROVIDER.getRule(context.bindingData.id);
  const ruleAfter = {
    ...ruleBefore,
    creator: { id: getUser(req).userId },
    content: formatYAML(unpublish(ruleBefore.content)),
  };
  await handle_response(context, async () =>
    STORAGE_PROVIDER.deleteRule(ruleAfter)
  );
};
