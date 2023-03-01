export default async (context, getResponseContent) => {
  context.res = await getResponseContent();
};
