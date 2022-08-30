import { STORAGE_PROVIDER } from "../providers/BaseStorage";
import handle_response from "../utils/handle_response";

export default async (context, req) => {
  await handle_response(context, async () => ({
    body: await STORAGE_PROVIDER.postRule(req.body.content, req.body.creator),
  }));
};
