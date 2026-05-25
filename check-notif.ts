import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function check() {
  const notifications = await prisma.notification.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5
  });
  console.log("Recent Notifications:", notifications);
  
  const interviews = await prisma.interview.findMany({
    orderBy: { createdAt: 'desc' },
    take: 1,
    include: {
      application: {
        include: {
          jobPosting: true
        }
      }
    }
  });
  console.log("Latest Interview Job Posted By:", interviews[0]?.application?.jobPosting?.postedBy);
}

check().catch(console.error).finally(() => prisma.$disconnect());
