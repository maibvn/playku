// filepath: app/routes/app-proxy.playku.$handle.jsx
import { json } from "@remix-run/node";
import { getAudioUrlByHandle } from "../services/products/product.service";

export const loader = async ({ params, request }) => {
  // No authentication needed for proxy, but you may want to validate the request
  const { handle } = params;
  const audioUrl = await getAudioUrlByHandle(handle);
  if (!audioUrl) {
    return json({ error: "Not found" }, { status: 404 });
  }
  return json({ audioUrl });
};