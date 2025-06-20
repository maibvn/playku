export async function adminGraphql(admin, query, variables = {}) {
  const response = await admin.graphql(query, { variables });
  const result = await response.json();

  if (result.errors) {
    console.error("Shopify GraphQL errors:", result.errors);
    throw new Error(JSON.stringify(result.errors));
  }
  return result.data;
}
