import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function check() {
  const offers = await prisma.offer.findMany({
    include: {
      application: {
        include: {
          candidate: true,
          jobPosting: true,
        }
      }
    }
  });
  console.log('Offers in DB:', JSON.stringify(offers, null, 2));
}

check().catch(console.error).finally(() => prisma.$disconnect());
