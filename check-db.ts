import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function check() {
  const interviews = await prisma.interview.findMany({
    select: { interviewId: true, confirmToken: true, confirmStatus: true, result: true }
  });
  console.log('Interviews in DB:');
  console.table(interviews);
}

check().catch(console.error).finally(() => prisma.$disconnect());
