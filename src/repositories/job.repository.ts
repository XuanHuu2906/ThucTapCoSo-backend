import { prisma } from '../config/prisma.js';
import { Prisma } from '@prisma/client';

export class JobRepository {
  async findAll(filters: { search?: string; deptName?: string; status?: string }) {
    const where: Prisma.JobPostingWhereInput = {};

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.deptName) {
      where.deptName = filters.deptName;
    }

    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search } },
        { description: { contains: filters.search } },
      ];
    }

    return prisma.jobPosting.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        postedByUser: {
          select: {
            userId: true,
            fullName: true,
            email: true,
            role: true,
          },
        },
      },
    });
  }

  async findById(jobId: number) {
    return prisma.jobPosting.findUnique({
      where: { jobId },
      include: {
        postedByUser: {
          select: {
            userId: true,
            fullName: true,
            email: true,
            role: true,
          },
        },
      },
    });
  }

  async create(data: Prisma.JobPostingUncheckedCreateInput) {
    return prisma.jobPosting.create({
      data,
    });
  }

  async update(jobId: number, data: Prisma.JobPostingUpdateInput) {
    return prisma.jobPosting.update({
      where: { jobId },
      data,
    });
  }

  async delete(jobId: number) {
    return prisma.jobPosting.delete({
      where: { jobId },
    });
  }
}

export const jobRepository = new JobRepository();
