// server/cron.js
const cron = require('node-cron');
const { PrismaClient } = require('@prisma/client');
const scrapeAmazon = require('../utils/scrapeAmazon');

const prisma = new PrismaClient();

cron.schedule('*/30 * * * *', async () => {
  console.log('Running price tracker cron job...');
  const products = await prisma.product.findMany();
  for (const product of products) {
    try {
      const data = await scrapeAmazon(product.url);
      await prisma.priceHistory.create({
        data: {
          productId: product.id,
          price: parseFloat(data.price),
        },
      });
      console.log(`✅ Updated price for ${product.title}: ₹${data.price}`);
    } catch (err) {
      console.error(`❌ Error scraping ${product.url}`, err);
    }
  }
});
