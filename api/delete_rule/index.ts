import { STORAGE_PROVIDER } from "../providers/BaseStorage";
import handle_response from "../utils/handle_response";

export default async (context, req) => {
  await handle_response(context, async () =>
    STORAGE_PROVIDER.deleteRule(context.bindingData.id)
  );
};
