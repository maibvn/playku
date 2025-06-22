import prisma from "../../db.server.js";

/**
 * Get player settings for a shop.
 */
export async function getPlayerSettings(shop) {
  return prisma.playkuSettings.findUnique({ where: { shop } });
}

/**
 * Update player settings for a shop.
 */
export async function updatePlayerSettings(shop, data) {
  return prisma.playkuSettings.upsert({
    where: { shop },
    update: data,
    create: { shop, ...data },
  });
}
