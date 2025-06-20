import { adminGraphql } from "./graphql.js";

/**
 * Fetches products with their audio_url metafield.
 * @param {object} admin - The authenticated admin object.
 */
export async function getProductsWithAudio(admin) {
  const query = `
    {
      products(first: 20) {
        edges {
          node {
            id
            title
            images(first: 1) { edges { node { src } } }
            metafields(namespace: "playku", first: 1) {
              edges {
                node {
                  key
                  value
                }
              }
            }
          }
        }
      }
    }
  `;
  const data = await adminGraphql(admin, query, {});

  return data.products.edges.map(({ node }) => ({
    id: node.id,
    title: node.title,
    image: node.images.edges[0]?.node.src,
    audioUrl:
      node.metafields.edges.find((mf) => mf.node.key === "audio_url")?.node
        .value || "",
  }));
}

/**
 * Updates the audio_url metafield for a product.
 * @param {object} admin - The authenticated admin object.
 * @param {string} productId - The Shopify product ID.
 * @param {string} audioUrl - The new audio URL to set.
 */
export async function updateProductAudio(admin, productId, audioUrl) {
  const mutation = `
    mutation metafieldsSet($metafields: [MetafieldsSetInput!]!) {
      metafieldsSet(metafields: $metafields) {
        metafields {
          id
          key
          value
        }
        userErrors {
          field
          message
        }
      }
    }
  `;
  const variables = {
    metafields: [
      {
        ownerId: productId,
        namespace: "playku",
        key: "audio_url",
        type: "single_line_text_field",
        value: audioUrl,
      },
    ],
  };
  const data = await adminGraphql(admin, mutation, variables);
  if (data.metafieldsSet.userErrors.length) {
    throw new Error(JSON.stringify(data.metafieldsSet.userErrors));
  }
  return data.metafieldsSet.metafields[0];
}
// getAudioUrlByHandle.js
export async function getAudioUrlByHandle(admin, handle) {
  const query = `
    query GetAudioUrl($handle: String!) {
      productByHandle(handle: $handle) {
        id
        metafield(namespace: "playku", key: "audio_url") {
          value
        }
      }
    }
  `;

  const variables = { handle };

  const result = await adminGraphql(admin, query, variables);

  if (!result?.productByHandle) {
    throw new Error(`Product not found for handle: ${handle}`);
  }

  const audioUrl = result.productByHandle.metafield?.value || null;
  return audioUrl;
}
