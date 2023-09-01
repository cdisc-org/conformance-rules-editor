import { STORAGE_PROVIDER } from "../providers/BaseStorage";
import handle_response from "../utils/handle_response";

export default async (context, req) => {
  const user = JSON.parse(
    Buffer.from(req.headers["x-ms-client-principal"], "base64").toString(
      "ascii"
    )
  );
  await handle_response(context, async () =>
    STORAGE_PROVIDER.deleteRule(context.bindingData.id, user.userId)
  );
};
