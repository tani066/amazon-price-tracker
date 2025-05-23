import { PrismaClient } from '@prisma/client';
import scrapeAmazon from '@/utils/scrapeAmazon';

const prisma = new PrismaClient();

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get('token');

  // Security check
  if (token !== process.env.CRON_SECRET) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const products = await prisma.product.findMany();
    let updatedCount = 0;

    for (const product of products) {
      try {
        const data = await scrapeAmazon(product.url);
        await prisma.priceHistory.create({
          data: {
            productId: product.id,
            price: parseFloat(data.price),
          },
        });
        updatedCount++;
      } catch (err) {
        console.error(`Failed to update ${product.url}:`, err.message);
      }
    }

    return Response.json({ status: 'Success', updated: updatedCount });
  } catch (err) {
    console.error('Update Prices Cron Error:', err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
    });
  }
}
