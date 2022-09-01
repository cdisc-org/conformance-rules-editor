import https from "https";

export default async (context, req, url, token?) => {
  const postData = JSON.stringify(req.body);

  const options = {
    hostname: url.split("/")[0],
    path: "/" + url.split("/").slice(1).join("/"),
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(postData),
      ...(token && {
        Authorization: "Bearer " + token,
      }),
    },
  };

  var resp_body = "";
  const request = https
    .request(options, (resp) => {
      resp.on("data", (chunk) => {
        resp_body += chunk;
      });

      resp.on("end", () => {
        if (resp.statusCode !== 200) {
          context.res["status"] = resp.statusCode;
          context.res["body"] = resp.statusMessage;
        }
        if (resp_body) {
          try {
            context.res.json(JSON.parse(resp_body));
          } catch (jsonParseException) {
            context.res = {
              status: 500,
              body: `Core Engine returned invalid JSON: ${resp_body}`,
            };
          }
        }
      });
    })
    .on("error", (error) => {
      context.res = {
        status: 500,
        body: error,
      };
    });
  request.write(postData);
  await new Promise((resolve, reject) => {
    request.end();
  });
};
