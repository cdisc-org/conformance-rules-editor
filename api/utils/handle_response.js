module.exports = async function (context, getResponseContent) {
  try {
    context.res = await getResponseContent();
  } catch (error) {
    context.res = {
      status: 500,
      body: error,
    };
  }
  context.done();
};
