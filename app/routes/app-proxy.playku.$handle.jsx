// filepath: app/routes/app-proxy.playku.$handle.jsx
import { json } from "@remix-run/node";
import { getAudioUrlByHandle } from "../services/products/product.service";
import { findUserByShop } from "../services/user/user.service";

export const loader = async ({ params, request }) => {
  const { handle } = params;

  // 1. Get shop domain from query or headers (Shopify sends it as ?shop=...)
  const url = new URL(request.url);
  const shop = url.searchParams.get("shop") ||
    request.headers.get("x-shopify-shop-domain");

  if (!shop) {
    return json({ error: "Missing shop" }, { status: 400 });
  }

  // 2. Find user by shop domain
  const user = await findUserByShop(shop);
  if (!user) {
    return json({ error: "Shop not registered" }, { status: 404 });
  }

  // 3. Get audio data for this handle and user
  const audioData = await getAudioUrlByHandle(handle, user.id);

  if (!audioData || !audioData.audioUrl) {
    return json({ error: "Not found" }, { status: 404 });
  }

  // Return both audioUrl and title
  return json({
    audioUrl: audioData.audioUrl,
    title: audioData.title,
  });
};