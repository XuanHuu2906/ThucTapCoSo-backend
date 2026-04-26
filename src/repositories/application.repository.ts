import { prisma } from '../config/prisma.js';
import { Prisma } from '@prisma/client';

export class ApplicationRepository {
  async findAll(filters: { jobId?: number; status?: string }) {
    const where: Prisma.ApplicationWhereInput = {};

    if (filters.jobId) {
      where.jobId = filters.jobId;
    }
    
    if (filters.status) {
      where.status = filters.status;
    }

    return prisma.application.findMany({
      where,
      orderBy: { appliedDate: 'desc' },
      include: {
        candidate: {
          select: {
            candidateId: true,
            fullName: true,
            email: true,
            phone: true,
          },
        },
        jobPosting: {
          select: {
            title: true,
            deptName: true,
          },
        },
      },
    });
  }

  async findById(appId: number) {
    return prisma.application.findUnique({
      where: { appId },
      include: {
        candidate: true,
        jobPosting: true,
        managedByUser: {
          select: {
            fullName: true,
            email: true,
          },
        },
      },
    });
  }

  async checkExistingApplication(jobId: number, candidateId: number) {
    return prisma.application.findFirst({
      where: {
        jobId,
        candidateId,
      },
    });
  }

  async createApplicationWithCandidate(data: {
    jobId: number;
    fullName: string;
    email: string;
    phone?: string;
    cvFile?: string;
  }) {
    // Transaction to ensure atomicity
    return prisma.$transaction(async (tx) => {
      // 1. Find or create candidate
      let candidate = await tx.candidate.findUnique({
        where: { email: data.email },
      });

      if (!candidate) {
        candidate = await tx.candidate.create({
          data: {
            fullName: data.fullName,
            email: data.email,
            phone: data.phone,
          },
        });
      }

      // 2. Check if application already exists
      const existingApp = await tx.application.findFirst({
        where: {
          jobId: data.jobId,
          candidateId: candidate.candidateId,
        },
      });

      if (existingApp) {
        throw new Error('Application already exists');
      }

      // 3. Create application
      const application = await tx.application.create({
        data: {
          jobId: data.jobId,
          candidateId: candidate.candidateId,
          cvFile: data.cvFile,
          status: 'New',
        },
      });

      return application;
    });
  }

  async updateStatus(appId: number, status: string, managedBy?: number) {
    const data: Prisma.ApplicationUpdateInput = { status };
    if (managedBy) {
      data.managedByUser = { connect: { userId: managedBy } };
    }

    return prisma.application.update({
      where: { appId },
      data,
    });
  }
}

export const applicationRepository = new ApplicationRepository();
