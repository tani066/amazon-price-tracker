import { PrismaClient } from '@prisma/client';
import scrapeAmazon from '@/utils/scrapeAmazon';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const products = await prisma.product.findMany();

    for (const product of products) {
      const data = await scrapeAmazon(product.url);
      await prisma.priceHistory.create({
        data: {
          productId: product.id,
          price: parseFloat(data.price),
        },
      });
    }

    return Response.json({ status: 'Success', updated: products.length });
  } catch (err) {
    console.error('Update Prices Cron Error:', err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
    });
  }
}
