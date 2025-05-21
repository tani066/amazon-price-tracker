import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  const history = await prisma.priceHistory.findMany({
    where: { productId: id },
    orderBy: { createdAt: 'asc' },
  });
  return Response.json(history);
}