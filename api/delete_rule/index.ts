import { STORAGE_PROVIDER } from "../providers/BaseStorage";
import handle_response from "../utils/handle_response";
import { getUser } from "../utils/SWAUtils";

export default async (context, req) => {
  const ruleBefore = await STORAGE_PROVIDER.getRule(context.bindingData.id);
  const ruleAfter = {
    ...ruleBefore,
    creator: { id: getUser(req).userId },
  };
  await handle_response(context, async () =>
    STORAGE_PROVIDER.deleteRule(ruleAfter)
  );
};
