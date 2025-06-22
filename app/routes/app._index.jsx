import React, { useState } from "react";
import { useFetcher, useLoaderData } from "@remix-run/react";
import { Page, Card, TextField, Button, BlockStack, InlineStack, Text } from "@shopify/polaris";
import { authenticate } from "../shopify.server";
import { getProductsWithAudio, updateProductAudio } from "../services/products/product.service";
import { registerPlaykuScriptTag } from "../services/player-ui/registerScriptTag.js";
import { findOrCreateUser, findUserByShop } from "../services/user/user.service";

export const loader = async ({ request }) => {
  const { admin, session } = await authenticate.admin(request);
  const shop = session.shop;

  // Ensure the user/shop exists in your DB and get the user
  const user = await findOrCreateUser(shop);

  // Host your inject.js on a CDN or your server and use the public URL here:
  const domain = new URL(request.url).hostname;
  const protocol = request.headers.get("x-forwarded-proto") || "https";
  const scriptUrl = `${protocol}://${domain}/playku-inject.js`;

  await registerPlaykuScriptTag(admin, scriptUrl);

  // Fetch products and their audio_url from your DB
  const products = await getProductsWithAudio(admin);
  return { products, userId: user.id };
};

export const action = async ({ request }) => {
  const { admin, session } = await authenticate.admin(request);
  const shop = session.shop;
  const formData = await request.formData();
  const productId = formData.get("productId");
  const handle = formData.get("handle");
  const title = formData.get("title");
  const image = formData.get("image");
  const audioUrl = formData.get("audioUrl");

  // Just look up the user, don't upsert
  const user = await findUserByShop(shop);

  if (!user) {
    return new Response("User not found", { status: 404 });
  }

  // Save/update in DB
  await updateProductAudio(productId, handle, title, image, audioUrl, user.id);

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
            <InlineStack gap="400" >
              <img src={product.image} alt={product.title} style={{ width: 80, height: 80, objectFit: "cover" }} />
              <Text variant="bodyMd">{product.title}</Text>
              <fetcher.Form method="post">
                <input type="hidden" name="productId" value={product.id} />
                <input type="hidden" name="handle" value={product.handle} />
                <input type="hidden" name="title" value={product.title} />
                <input type="hidden" name="image" value={product.image} />
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