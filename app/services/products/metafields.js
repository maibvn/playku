import { adminGraphql } from "./graphql.js";

export async function ensureAudioMetafieldDefinition(admin) {
  // Query for existing definition
  const query = `
    query {
      metafieldDefinitions(first: 1, namespace: "playku", key: "audio_url", ownerType: PRODUCT) {
        edges { node { id } }
      }
    }
  `;
  const data = await adminGraphql(admin, query);
  if (data.metafieldDefinitions.edges.length === 0) {
    // Create definition if not found
    const mutation = `
      mutation {
        metafieldDefinitionCreate(definition: {
          name: "Audio Preview URL",
          namespace: "playku",
          key: "audio_url",
          description: "Audio preview URL for PlayKu player",
          ownerType: PRODUCT,
          type: "single_line_text_field",
        }) {
          createdDefinition { id }
          userErrors { field message }
        }
      }
    `;
    await adminGraphql(admin, mutation);
  }
}
