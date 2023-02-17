import { USERS_PROVIDER } from "../providers/BaseUsers";
import handle_response from "../utils/handle_response";

export default async (context, req) => {
  const user = JSON.parse(
    Buffer.from(req.headers["x-ms-client-principal"], "base64").toString(
      "ascii"
    )
  );
  await handle_response(context, async () => ({
    body: await USERS_PROVIDER.getUserPermissions({
      id: user.userId,
      name: user.userDetails,
    }),
  }));
};
