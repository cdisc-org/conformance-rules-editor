import { USERS_PROVIDER } from "../providers/BaseUsers";
import handle_response from "../utils/handle_response";
import { getUser } from "../utils/SWAUtils";

export default async (context, req) => {
  const user = getUser(req);
  await handle_response(context, async () => ({
    body: await USERS_PROVIDER.getUserPermissions({
      id: user.userId,
      name: user.userDetails,
    }),
  }));
};
