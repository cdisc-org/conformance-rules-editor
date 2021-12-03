const https = require("https");

module.exports = async function (context, req, url) {
  const postData = JSON.stringify(req.body);

  const options = {
    hostname: url.split("/")[0],
    path: "/" + url.split("/").slice(1).join("/"),
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Length": postData.length,
    },
  };

  var resp_body = "";
  const request = https
    .request(options, (resp) => {
      resp.on("data", (chunk) => {
        resp_body += chunk;
      });

      resp.on("end", () => {
        if (resp.statusCode === 200) {
          context.res.json(JSON.parse(resp_body));
        } else {
          context.res = {
            status: resp.statusCode,
            body: resp.statusMessage,
          };
        }
        context.done();
      });
    })
    .on("error", (error) => {
      context.res = {
        status: 500,
        body: error,
      };
      context.done();
    });
  request.write(postData);
  await new Promise((resolve, reject) => {
    request.end();
  });
};
