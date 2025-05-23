import { PrismaClient } from '@prisma/client';
import scrapeAmazon from '@/utils/scrapeAmazon';

const prisma = new PrismaClient();

export async function POST(req) {
  try {
    const body = await req.json();
    const { url } = body;

    const asinMatch = url.match(/(?:dp|gp\/product)\/([A-Z0-9]{10})/);
    if (!asinMatch) throw new Error('Invalid Amazon URL');
    const cleanUrl = `https://www.amazon.in/dp/${asinMatch[1]}`;

    const existing = await prisma.product.findUnique({ where: { url: cleanUrl } });
    if (existing) {
      const priceHistory = await prisma.priceHistory.findMany({ where: { productId: existing.id } });
      return Response.json({ product: existing, priceHistory });
    }

    const data = await scrapeAmazon(cleanUrl);

    const product = await prisma.product.create({
      data: {
        url: cleanUrl,
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
