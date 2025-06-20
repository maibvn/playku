import { useFetcher, useLoaderData } from "@remix-run/react";
import { Page, Card, TextField, Button, BlockStack, InlineStack, Text } from "@shopify/polaris";
import { authenticate } from "../shopify.server";
import { getProductsWithAudio, updateProductAudio } from "../services/products/product.service";
import { ensureAudioMetafieldDefinition } from "../services/products/metafields";

export const loader = async ({ request }) => {
  const { admin } = await authenticate.admin(request);
  await ensureAudioMetafieldDefinition(admin); // Ensure metafield definition exists
  // Fetch products and their audio_url metafield
  const products = await getProductsWithAudio(admin);
  return { products };
};

export const action = async ({ request }) => {
  const { admin } = await authenticate.admin(request);
  const formData = await request.formData();
  const productId = formData.get("productId");
  const audioUrl = formData.get("audioUrl");
  await updateProductAudio(admin, productId, audioUrl);
  return null;
};

export default function ProductsDashboard() {
  const { products } = useLoaderData();
  const fetcher = useFetcher();

  return (
    <Page title="Products Dashboard">
      <BlockStack gap="400">
        {products.map((product) => (
          <Card key={product.id} sectioned>
            <InlineStack gap="400">
              <img src={product.image} alt={product.title} style={{ width: 80, height: 80, objectFit: "cover" }} />
              <Text variant="bodyMd">{product.title}</Text>
              <fetcher.Form method="post">
                <input type="hidden" name="productId" value={product.id} />
                <TextField
                  label="Audio URL"
                  name="audioUrl"
                  value={product.audioUrl || ""}
                  onChange={() => {}}
                  autoComplete="off"
                />
                <Button submit>Save</Button>
              </fetcher.Form>
            </InlineStack>
          </Card>
        ))}
      </BlockStack>
    </Page>
  );
}