// services/products/graphql.js
async function adminGraphql(query, variables) {
  const res = await fetch(
    "https://your-shop.myshopify.com/admin/api/2024-04/graphql.json",
    {
      method: "POST",
      headers: {
        "X-Shopify-Access-Token": process.env.SHOPIFY_ADMIN_TOKEN,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query, variables }),
    },
  );
  const json = await res.json();
  return json.data;
}
module.exports = { adminGraphql };
