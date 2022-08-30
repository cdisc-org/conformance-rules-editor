export default async (context, getResponseContent) => {
  try {
    context.res = await getResponseContent();
  } catch (error) {
    context.res = {
      status: 500,
      body: error,
    };
  }
};
