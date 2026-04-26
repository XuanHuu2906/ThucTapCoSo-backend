import { prisma } from '../config/prisma.js';
import { Prisma } from '@prisma/client';
import { hashPassword } from '../utils/crypto.js';

export class ProbationRepository {
  async findAll(filters: { status?: string }) {
    const where: Prisma.ProbationWhereInput = {};
    if (filters.status) where.status = filters.status;

    return prisma.probation.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        offer: {
          include: {
            application: {
              include: { jobPosting: true },
            },
          },
        },
        probationer: { select: { fullName: true, email: true } },
        supervisor: { select: { fullName: true, email: true } },
        evaluation: true,
      },
    });
  }

  async findById(probationId: number) {
    return prisma.probation.findUnique({
      where: { probationId },
      include: {
        offer: {
          include: {
            application: {
              include: { jobPosting: true },
            },
          },
        },
        probationer: { select: { fullName: true, email: true } },
        supervisor: { select: { fullName: true, email: true } },
        evaluation: {
          include: {
            submittedByUser: { select: { fullName: true, email: true } },
            approvedByUser: { select: { fullName: true, email: true } },
          },
        },
      },
    });
  }

  async createWithProbationerAccount(data: {
    offerId: number;
    supervisorId?: number;
    startDate: Date;
    endDate: Date;
  }) {
    return prisma.$transaction(async (tx) => {
      // 1. Get candidate info from Offer
      const offer = await tx.offer.findUnique({
        where: { offerId: data.offerId },
        include: { application: { include: { candidate: true } } },
      });

      if (!offer) throw new Error('Offer not found');
      
      const candidate = offer.application.candidate;

      // 2. Find or create Probationer User account
      let probationerUser = await tx.user.findUnique({
        where: { email: candidate.email },
      });

      if (!probationerUser) {
        // Create new account with default password '123456'
        const defaultPassword = await hashPassword('123456');
        probationerUser = await tx.user.create({
          data: {
            fullName: candidate.fullName,
            email: candidate.email,
            password: defaultPassword,
            role: 'Probationer',
            status: 'Active',
          },
        });
      }

      // 3. Check if probation already exists
      const existingProbation = await tx.probation.findUnique({
        where: { offerId: data.offerId },
      });

      if (existingProbation) throw new Error('Probation already exists for this offer');

      // 4. Create Probation record
      const probation = await tx.probation.create({
        data: {
          offerId: data.offerId,
          probationerId: probationerUser.userId,
          supervisorId: data.supervisorId,
          startDate: data.startDate,
          endDate: data.endDate,
          status: 'Ongoing',
        },
      });

      return probation;
    });
  }

  async update(probationId: number, data: Prisma.ProbationUpdateInput) {
    return prisma.probation.update({
      where: { probationId },
      data,
      include: {
        offer: {
          include: {
            application: {
              include: { jobPosting: true },
            },
          },
        },
        probationer: { select: { fullName: true, email: true } },
        supervisor: { select: { fullName: true, email: true } },
        evaluation: true,
      },
    });
  }

  async upsertEvaluation(probationId: number, data: {
    submittedBy: number;
    kpiScore?: number;
    comment?: string;
    recommendation?: string;
    isSubmit: boolean;
  }) {
    const status = data.isSubmit ? 'PendingApproval' : 'Draft';
    const submittedAt = data.isSubmit ? new Date() : null;

    return prisma.$transaction(async (tx) => {
      const evaluation = await tx.probationEvaluation.upsert({
        where: { probationId },
        update: {
          submittedBy: data.submittedBy,
          kpiScore: data.kpiScore,
          comment: data.comment,
          recommendation: data.recommendation,
          status,
          submittedAt,
        },
        create: {
          probationId,
          submittedBy: data.submittedBy,
          kpiScore: data.kpiScore,
          comment: data.comment,
          recommendation: data.recommendation,
          status,
          submittedAt,
        },
      });

      if (data.isSubmit) {
        await tx.probation.update({
          where: { probationId },
          data: { status: 'PendingApproval' },
        });
      }

      return evaluation;
    });
  }

  async approveEvaluation(evalId: number, data: {
    status: string; // 'Approved' or 'Rejected'
    approvedBy: number;
    directorNote?: string;
  }) {
    return prisma.$transaction(async (tx) => {
      const evaluation = await tx.probationEvaluation.update({
        where: { evalId },
        data: {
          status: data.status,
          approvedBy: data.approvedBy,
          approvedAt: new Date(),
          directorNote: data.directorNote,
        },
      });

      // Update probation overall status based on recommendation if approved
      if (data.status === 'Approved') {
        const finalStatus = evaluation.recommendation === 'Pass' ? 'Pass' : 'Fail';
        await tx.probation.update({
          where: { probationId: evaluation.probationId },
          data: { status: finalStatus },
        });
      } else {
        // If rejected, maybe back to Ongoing or PendingEvaluation?
        await tx.probation.update({
          where: { probationId: evaluation.probationId },
          data: { status: 'Ongoing' },
        });
      }

      return evaluation;
    });
  }
}

export const probationRepository = new ProbationRepository();
