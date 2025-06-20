import prisma from "../../db.server.js";

/**
 * Find or create a user (shop) by shop domain.
 * @param {string} shop - The shop domain (e.g. "my-shop.myshopify.com")
 * @returns {Promise<User>}
 */
export async function findOrCreateUser(shop) {
  return prisma.user.upsert({
    where: { shop },
    update: {},
    create: { id: crypto.randomUUID(), shop },
  });
}

/**
 * Find a user by shop domain.
 */
export async function findUserByShop(shop) {
  return prisma.user.findUnique({ where: { shop } });
}
