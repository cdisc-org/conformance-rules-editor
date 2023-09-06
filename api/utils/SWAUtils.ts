import { HttpRequest } from "@azure/functions";

export const getUser = (
  request: HttpRequest
): {
  identityProvider: string;
  userId: string;
  userDetails: string;
  userRoles: string[];
} =>
  JSON.parse(
    Buffer.from(request.headers["x-ms-client-principal"], "base64").toString(
      "ascii"
    )
  );
