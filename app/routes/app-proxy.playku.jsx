import { json } from "@remix-run/node";
import { getAllAudioByUser, getThemeConfig } from "../services/products/product.service";
import { findUserByShop } from "../services/user/user.service";

export const loader = async ({ request }) => {
  console.log("PlayKu: loader called");
  return null;
};

export const action = async ({ request }) => {
  console.log("PlayKu: action called");

  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, { status: 405 });
  }

  let theme;
  try {
    const body = await request.json();
    theme = body.theme;
  } catch {
    return json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!theme) {
    return json({ error: "Missing theme" }, { status: 400 });
  }

  // Get all theme configs
  const configs = await getThemeConfig();
  // Find the config with the matching theme name
  let config = configs.find(cfg => cfg.theme === theme);

  // If not found, combine all selectors from all configs
  if (!config) {
    const allSelectors = configs
      .map(cfg => {
        try {
          return JSON.parse(cfg.productImageSelectors);
        } catch {
          return [];
        }
      })
      .flat();
    config = {
      theme: "combined",
      productImageSelectors: JSON.stringify(allSelectors),
    };
  }


  // Get shop domain from query or headers
  const url = new URL(request.url);
  const shop =
    url.searchParams.get("shop") ||
    request.headers.get("x-shopify-shop-domain");

  if (!shop) {
    return json({ error: "Missing shop" }, { status: 400 });
  }

  // Find user by shop domain
  const user = await findUserByShop(shop);
  if (!user) {
    return json({ error: "Shop not registered" }, { status: 404 });
  }

  // Get all audio data for this user
  const allAudioData = await getAllAudioByUser(user.id);


  return json({ themeConfig: config, audioData: allAudioData });
};