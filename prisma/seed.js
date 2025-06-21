import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const theme = 'Prestige';
  const productImageSelectors = [
    "img[src*='/products/']",
    "a[href*='/products/'] img",
    ".product-card__image.product-card__image--primary.aspect-square",
    ".jdgm-carousel-item__product-image",
    ".product-card-wrapper img",
    "div[data-product-id] img"
  ];

  const config = await prisma.themeConfig.upsert({
    where: {
      theme: theme,
    },
    update: {
      productImageSelectors: JSON.stringify(productImageSelectors),
    },
    create: {
      theme,
      productImageSelectors: JSON.stringify(productImageSelectors),
    },
  });

  console.log('ThemeConfig upserted:', config);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });