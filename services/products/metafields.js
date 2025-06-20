const { adminGraphql } = require("./graphql");

async function createAudioUrlMetafieldDefinition() {
  const mutation = `
    mutation metafieldDefinitionCreate($definition: MetafieldDefinitionInput!) {
      metafieldDefinitionCreate(definition: $definition) {
        createdDefinition {
          id
          name
          namespace
          key
        }
        userErrors {
          field
          message
        }
      }
    }
  `;
  const variables = {
    definition: {
      name: "Audio Preview URL",
      namespace: "app--playku",
      key: "audio_url",
      description: "Audio preview URL for PlayKu player",
      ownerType: "PRODUCT",
      type: "single_line_text_field",
      visibleToStorefrontApi: true,
      access: {
        admin: true,
        storefront: true,
      },
    },
  };
  return await adminGraphql(mutation, variables);
}

module.exports = { createAudioUrlMetafieldDefinition };
