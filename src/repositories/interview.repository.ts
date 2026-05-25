import { prisma } from '../config/prisma.js';
import { Prisma } from '@prisma/client';

export class InterviewRepository {
  async findAll(filters: {
    appId?: number;
    interviewerId?: number;
    type?: string;
    confirmStatus?: string;
    result?: string;
  }) {
    const where: Prisma.InterviewWhereInput = {};

    if (filters.appId) where.appId = filters.appId;
    if (filters.interviewerId) where.interviewerId = filters.interviewerId;
    if (filters.type) where.type = filters.type;
    if (filters.confirmStatus) where.confirmStatus = filters.confirmStatus;
    if (filters.result) where.result = filters.result;

    return prisma.interview.findMany({
      where,
      orderBy: { interviewDate: 'desc' },
      include: {
        application: {
          include: {
            candidate: true,
            jobPosting: true,
          },
        },
        interviewer: {
          select: {
            fullName: true,
            email: true,
            role: true,
          },
        },
      },
    });
  }

  async findById(interviewId: number) {
    return prisma.interview.findUnique({
      where: { interviewId },
      include: {
        application: {
          include: {
            candidate: true,
            jobPosting: true,
          },
        },
        interviewer: {
          select: {
            fullName: true,
            email: true,
            role: true,
          },
        },
      },
    });
  }

  async findConflicts(interviewerId: number, interviewDate: Date, currentInterviewId?: number) {
    const durationMinutes = 60;
    const startTime = new Date(interviewDate.getTime() - durationMinutes * 60 * 1000 + 1000); 
    const endTime = new Date(interviewDate.getTime() + durationMinutes * 60 * 1000 - 1000); 

    return prisma.interview.findFirst({
      where: {
        interviewerId,
        interviewDate: {
          gt: startTime,
          lt: endTime,
        },
        NOT: currentInterviewId ? { interviewId: currentInterviewId } : undefined,
      },
    });
  }

  async create(data: Prisma.InterviewUncheckedCreateInput) {
    return prisma.$transaction(async (tx) => {
      const interview = await tx.interview.create({ data });

      // Update application status to 'Interviewing' if it's currently in an earlier stage
      const app = await tx.application.findUnique({ where: { appId: data.appId } });
      if (app && ['New', 'Screening', 'Shortlisted'].includes(app.status)) {
        await tx.application.update({
          where: { appId: data.appId },
          data: { status: 'Interviewing' },
        });
      }

      return interview;
    });
  }

  async update(interviewId: number, data: Prisma.InterviewUpdateInput) {
    return prisma.interview.update({
      where: { interviewId },
      data,
    });
  }

  async updateConfirmStatus(interviewId: number, confirmStatus: string) {
    return prisma.interview.update({
      where: { interviewId },
      data: { confirmStatus },
    });
  }

  async evaluate(interviewId: number, data: {
    technicalScore?: number;
    softScore?: number;
    attitudeScore?: number;
    result: string;
    feedback?: string;
  }) {
    return prisma.$transaction(async (tx) => {
      // 1. Cập nhật điểm và kết quả phỏng vấn
      const interview = await tx.interview.update({
        where: { interviewId },
        data,
      });

      // 2. Tự động cập nhật trạng thái Application dựa trên kết quả phỏng vấn
      if (data.result === 'Pass') {
        await tx.application.update({
          where: { appId: interview.appId },
          data: { status: 'InterviewPassed' },
        });
      } else if (data.result === 'Fail') {
        await tx.application.update({
          where: { appId: interview.appId },
          data: { status: 'InterviewFailed' },
        });
      }

      return interview;
    });
  }

  async findByToken(confirmToken: string) {
    return prisma.interview.findUnique({
      where: { confirmToken },
      include: {
        application: {
          include: {
            candidate: true,
            jobPosting: true,
          },
        },
        interviewer: {
          select: {
            fullName: true,
            email: true,
          },
        },
      },
    });
  }

  async setConfirmToken(interviewId: number, token: string) {
    return prisma.interview.update({
      where: { interviewId },
      data: { confirmToken: token },
    });
  }

  async clearConfirmToken(interviewId: number) {
    return prisma.interview.update({
      where: { interviewId },
      data: { confirmToken: null },
    });
  }

  async delete(interviewId: number) {
    return prisma.interview.delete({
      where: { interviewId },
    });
  }
}

export const interviewRepository = new InterviewRepository();
