import { adminGraphql } from "./graphql.js";
import prisma from "../../db.server.js";

/**
 * Fetches products from Shopify and attaches audioUrl from your database.
 */
export async function getProductsWithAudio(admin) {
  const query = `
    {
      products(first: 20) {
        edges {
          node {
            id
            handle
            title
            images(first: 1) { edges { node { src } } }
          }
        }
      }
    }
  `;
  const data = await adminGraphql(admin, query, {});

  // Get all product IDs from Shopify
  const products = data.products.edges.map(({ node }) => ({
    id: node.id,
    handle: node.handle,
    title: node.title,
    image: node.images.edges[0]?.node.src || "",
  }));

  // Fetch all audio URLs from your DB for these products
  const dbAudios = await prisma.productAudio.findMany({
    where: { id: { in: products.map((p) => p.id) } },
  });

  // Map DB audio URLs by product ID
  const audioMap = Object.fromEntries(dbAudios.map((a) => [a.id, a.audioUrl]));

  // Attach audioUrl to each product
  return products.map((p) => ({
    ...p,
    audioUrl: audioMap[p.id] || "",
  }));
}

/**
 * Updates or creates the audio_url for a product in your database.
 */
export async function updateProductAudio(
  productId,
  handle,
  title,
  image,
  audioUrl,
  userId,
) {
  return prisma.productAudio.upsert({
    where: { id: productId },
    update: { handle, title, image, audioUrl, userId },
    create: { id: productId, handle, title, image, audioUrl, userId },
  });
}

// getAudioUrlByHandle.js
// export async function getAudioUrlByHandle(handle, userId) {
//   const dbAudio = await prisma.productAudio.findUnique({
//     where: { handle_userId: { handle, userId } },
//     select: { audioUrl: true, title: true },
//   });
//   return dbAudio
//     ? { audioUrl: dbAudio.audioUrl, title: dbAudio.title }
//     : { audioUrl: null, title: null };
// }

/**
 * Returns all audio data for a user, keyed by product handle.
 * { [handle]: { audioUrl, title } }
 */
export async function getAllAudioByUser(userId) {
  const dbAudios = await prisma.productAudio.findMany({
    where: { userId },
    select: { handle: true, audioUrl: true, title: true },
  });

  // Build object: { handle: { audioUrl, title } }
  return Object.fromEntries(
    dbAudios.map((a) => [a.handle, { audioUrl: a.audioUrl, title: a.title }]),
  );
}

export async function getThemeConfig() {
  return prisma.themeConfig.findMany();
}
