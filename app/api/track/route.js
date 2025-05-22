import { PrismaClient } from '@prisma/client';
import scrapeAmazon from '@/utils/scrapeAmazon';
import searchOtherPlatforms from '@/utils/searchOtherPlatforms';

const prisma = new PrismaClient();

export async function POST(req) {
  try {
    const body = await req.json();
    const { url } = body;

    // Check if product already exists
    const existing = await prisma.product.findUnique({ where: { url } });
    if (existing) {
      return Response.json({ product: existing });
    }

    // Scrape Amazon for product data
    const data = await scrapeAmazon(url);

    // Save product to DB
    const product = await prisma.product.create({
      data: {
        url,
        title: data.title,
        image: data.image,
        platform: 'Amazon',
      },
    });

    // Save initial price to price history
    await prisma.priceHistory.create({
      data: {
        productId: product.id,
        price: parseFloat(data.price),
      },
    });

    // Search competitor platforms using title
    const otherPrices = await searchOtherPlatforms(data.title);

    // Return both Amazon product and competitor data
    return Response.json({ product, otherPrices });

  } catch (err) {
    console.error('API /track error:', err.message);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
    });
  }
}
