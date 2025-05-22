import { PrismaClient } from '@prisma/client';
import scrapeAmazon from '@/utils/scrapeAmazon';


const prisma = new PrismaClient();

export async function POST(req) {
  try {
    const body = await req.json();
    const { url } = body;

    const existing = await prisma.product.findUnique({ where: { url } });
    if (existing) {
      return Response.json({ product: existing });
    }

    const data = await scrapeAmazon(url);

    const product = await prisma.product.create({
      data: {
        url,
        title: data.title,
        image: data.image,
        platform: 'Amazon',
      },
    });

    await prisma.priceHistory.create({
      data: {
        productId: product.id,
        price: parseFloat(data.price),
      },
    });

    return Response.json({ product });
  } catch (err) {
    console.error('API /track error:', err.message);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
    });
  }
}
