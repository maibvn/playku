import React, { useState } from "react";
import { useFetcher, useLoaderData } from "@remix-run/react";
import { Page, Card, TextField, Button, BlockStack, InlineStack, Text } from "@shopify/polaris";
import { authenticate } from "../shopify.server";
import { getProductsWithAudio, updateProductAudio } from "../services/products/product.service";
import { ensureAudioMetafieldDefinition } from "../services/products/metafields";
import { registerPlaykuScriptTag } from "../services/player-ui/registerScriptTag.js";

export const loader = async ({ request }) => {
  const { admin } = await authenticate.admin(request);

  // Host your inject.js on a CDN or your server and use the public URL here:
const domain = new URL(request.url).hostname;
const protocol = request.headers.get("x-forwarded-proto") || "https";
const scriptUrl = `${protocol}://${domain}/playku-inject.js`;

console.log("Registering PlayKu script tag with URL:", scriptUrl);
  await registerPlaykuScriptTag(admin, scriptUrl);

  await ensureAudioMetafieldDefinition(admin);
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

  // Local state for audio URLs, keyed by product ID
  const [audioUrls, setAudioUrls] = useState(
    Object.fromEntries(products.map((p) => [p.id, p.audioUrl || ""]))
  );

  const handleChange = (productId, value) => {
    setAudioUrls((prev) => ({ ...prev, [productId]: value }));
  };

  return (
    <Page title="Products Dashboard">
      <BlockStack gap="400">
        {products.map((product) => (
          <Card key={product.id} sectioned>
            <InlineStack gap="400" align="center">
              <img src={product.image} alt={product.title} style={{ width: 80, height: 80, objectFit: "cover" }} />
              <Text variant="bodyMd">{product.title}</Text>
              <fetcher.Form method="post">
                <input type="hidden" name="productId" value={product.id} />
                <TextField
                  label="Audio URL"
                  name="audioUrl"
                  value={audioUrls[product.id]}
                  onChange={(value) => handleChange(product.id, value)}
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