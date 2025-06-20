// Example usage in your install flow
const {
  createAudioUrlMetafieldDefinition,
} = require("../../services/products/metafields");

async function onAppInstall() {
  const result = await createAudioUrlMetafieldDefinition();
  if (result.metafieldDefinitionCreate.userErrors.length) {
    console.error(
      "Metafield definition error:",
      result.metafieldDefinitionCreate.userErrors,
    );
  } else {
    console.log(
      "Metafield definition created:",
      result.metafieldDefinitionCreate.createdDefinition,
    );
  }
}
