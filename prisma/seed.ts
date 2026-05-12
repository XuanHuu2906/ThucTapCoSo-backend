import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  // 1. Clean up existing data (Order matters to avoid foreign key constraints)
  await prisma.probationEvaluation.deleteMany();
  await prisma.probation.deleteMany();
  await prisma.offer.deleteMany();
  await prisma.interview.deleteMany();
  await prisma.application.deleteMany();
  await prisma.jobPosting.deleteMany();
  await prisma.candidate.deleteMany();
  await prisma.user.deleteMany();

  // Reset sequences (PostgreSQL)
  try {
    await prisma.$executeRawUnsafe(`ALTER SEQUENCE "User_UserID_seq" RESTART WITH 1;`);
    await prisma.$executeRawUnsafe(`ALTER SEQUENCE "Candidate_CandidateID_seq" RESTART WITH 1;`);
    await prisma.$executeRawUnsafe(`ALTER SEQUENCE "JobPosting_JobID_seq" RESTART WITH 1;`);
    await prisma.$executeRawUnsafe(`ALTER SEQUENCE "Application_AppID_seq" RESTART WITH 1;`);
    await prisma.$executeRawUnsafe(`ALTER SEQUENCE "Interview_InterviewID_seq" RESTART WITH 1;`);
    await prisma.$executeRawUnsafe(`ALTER SEQUENCE "Offer_OfferID_seq" RESTART WITH 1;`);
    await prisma.$executeRawUnsafe(`ALTER SEQUENCE "Probation_ProbationID_seq" RESTART WITH 1;`);
    await prisma.$executeRawUnsafe(`ALTER SEQUENCE "ProbationEvaluation_EvalID_seq" RESTART WITH 1;`);
  } catch (e) {
    console.log('Skipping RE-SEED sequences');
  }

  const defaultPassword = await bcrypt.hash('123456', 10);

  // 2. Seed Users
  const admin = await prisma.user.create({
    data: {
      fullName: 'System Admin',
      email: 'admin@company.com',
      password: defaultPassword,
      role: 'Admin',
      status: 'Active',
    },
  });

  const director = await prisma.user.create({
    data: {
      fullName: 'John Director',
      email: 'director@company.com',
      password: defaultPassword,
      role: 'Director',
      status: 'Active',
    },
  });

  const hm1 = await prisma.user.create({
    data: {
      fullName: 'Mike Tech Lead',
      email: 'hm.tech@company.com',
      password: defaultPassword,
      role: 'HiringManager',
      status: 'Active',
    },
  });

  const hm2 = await prisma.user.create({
    data: {
      fullName: 'Sarah Marketing Lead',
      email: 'hm.marketing@company.com',
      password: defaultPassword,
      role: 'HiringManager',
      status: 'Active',
    },
  });

  const recruiter1 = await prisma.user.create({
    data: {
      fullName: 'Alice HR',
      email: 'alice.hr@company.com',
      password: defaultPassword,
      role: 'Recruiter',
      status: 'Active',
    },
  });

  const probationerUser = await prisma.user.create({
    data: {
      fullName: 'Peter Probationer',
      email: 'peter.probationer@gmail.com',
      password: defaultPassword,
      role: 'Probationer',
      status: 'Active',
    },
  });

  // 3. Seed Candidates
  const candidate1 = await prisma.candidate.create({
    data: {
      fullName: 'Peter Probationer',
      email: 'peter.probationer@gmail.com',
      phone: '0987654321',
    },
  });

  const candidate2 = await prisma.candidate.create({
    data: {
      fullName: 'Anna Developer',
      email: 'anna.dev@gmail.com',
      phone: '0123456789',
    },
  });

  const candidate3 = await prisma.candidate.create({
    data: {
      fullName: 'David Designer',
      email: 'david.design@gmail.com',
      phone: '0909123456',
    },
  });

  // 4. Seed Job Postings
  const job1 = await prisma.jobPosting.create({
    data: {
      postedBy: recruiter1.userId,
      deptName: 'IT',
      title: 'Senior Frontend Developer',
      description: 'We are looking for an experienced React developer...',
      requirements: '- 3+ years of experience with React\n- TypeScript proficiency',
      salaryRange: '$1500 - $3000',
      startDate: new Date('2023-01-01'),
      endDate: new Date('2023-12-31'),
      status: 'Open',
    },
  });

  const job2 = await prisma.jobPosting.create({
    data: {
      postedBy: recruiter1.userId,
      deptName: 'Marketing',
      title: 'Digital Marketing Specialist',
      description: 'Looking for a creative marketer to join our team...',
      requirements: '- 2+ years of experience\n- SEO/SEM skills',
      salaryRange: '$800 - $1200',
      startDate: new Date('2023-05-01'),
      endDate: new Date('2023-11-30'),
      status: 'Open',
    },
  });

  // 5. Seed Applications
  const app1 = await prisma.application.create({
    data: {
      jobId: job1.jobId,
      candidateId: candidate1.candidateId,
      managedBy: recruiter1.userId,
      cvFile: 'peter_cv.pdf',
      status: 'Hired',
    },
  });

  const app2 = await prisma.application.create({
    data: {
      jobId: job1.jobId,
      candidateId: candidate2.candidateId,
      managedBy: recruiter1.userId,
      cvFile: 'anna_cv.pdf',
      status: 'Interviewing',
    },
  });

  const app3 = await prisma.application.create({
    data: {
      jobId: job2.jobId,
      candidateId: candidate3.candidateId,
      managedBy: recruiter1.userId,
      cvFile: 'david_cv.pdf',
      status: 'New',
    },
  });

  // 6. Seed Interviews
  const interview1 = await prisma.interview.create({
    data: {
      appId: app1.appId,
      interviewerId: hm1.userId,
      interviewDate: new Date('2023-06-15T10:00:00Z'),
      location: 'Meeting Room 1 / Google Meet',
      type: 'Technical',
      confirmStatus: 'Confirmed',
      technicalScore: 8,
      softScore: 7,
      attitudeScore: 9,
      result: 'Pass',
      feedback: 'Good technical skills, positive attitude.',
    },
  });

  // 7. Seed Offers
  const offer1 = await prisma.offer.create({
    data: {
      appId: app1.appId,
      createdBy: recruiter1.userId,
      approvedBy: director.userId,
      baseSalary: 2000.00,
      allowance: 150.00,
      startDate: new Date('2023-07-01'),
      status: 'Accepted',
    },
  });

  // 8. Seed Probation
  const probation1 = await prisma.probation.create({
    data: {
      offerId: offer1.offerId,
      probationerId: probationerUser.userId,
      supervisorId: hm1.userId,
      startDate: new Date('2023-07-01'),
      endDate: new Date('2023-08-31'),
      status: 'PendingEvaluation',
    },
  });

  // 9. Seed ProbationEvaluation
  const evaluation1 = await prisma.probationEvaluation.create({
    data: {
      probationId: probation1.probationId,
      submittedBy: hm1.userId,
      kpiScore: 85,
      comment: 'Completed tasks well. Needs to improve communication with other teams.',
      recommendation: 'Pass',
      status: 'Submitted',
      submittedAt: new Date('2023-08-25T14:30:00Z'),
    },
  });

  console.log('Seeding finished successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
