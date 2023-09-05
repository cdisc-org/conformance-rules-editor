import { HttpRequest } from "@azure/functions";

export const getUser = (request: HttpRequest) =>
  JSON.parse(
    Buffer.from(request.headers["x-ms-client-principal"], "base64").toString(
      "ascii"
    )
  );
