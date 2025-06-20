// services/products/product.service.js
const { adminGraphql } = require("./graphql");

async function updateProductAudio(productId, audioUrl) {
  const mutation = `mutation { ... }`;
  return await adminGraphql(mutation, { id: productId, audio: audioUrl });
}

module.exports = { updateProductAudio };
