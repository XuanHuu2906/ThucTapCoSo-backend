import { prisma } from '../config/prisma.js';
import { Prisma } from '@prisma/client';

export class OfferRepository {
  async findAll(filters: { appId?: number; status?: string }) {
    const where: Prisma.OfferWhereInput = {};

    if (filters.appId) where.appId = filters.appId;
    if (filters.status) where.status = filters.status;

    return prisma.offer.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        application: {
          include: {
            candidate: true,
            jobPosting: true,
          },
        },
        createdByUser: {
          select: { fullName: true, email: true, role: true },
        },
        approvedByUser: {
          select: { fullName: true, email: true, role: true },
        },
      },
    });
  }

  async findById(offerId: number) {
    return prisma.offer.findUnique({
      where: { offerId },
      include: {
        application: {
          include: {
            candidate: true,
            jobPosting: true,
          },
        },
        createdByUser: {
          select: { fullName: true, email: true, role: true },
        },
        approvedByUser: {
          select: { fullName: true, email: true, role: true },
        },
      },
    });
  }

  async create(data: Prisma.OfferUncheckedCreateInput) {
    return prisma.$transaction(async (tx) => {
      const offer = await tx.offer.create({ data });

      // Cập nhật trạng thái Application thành Offered
      await tx.application.update({
        where: { appId: data.appId },
        data: { status: 'Offered' },
      });

      return offer;
    });
  }

  async update(offerId: number, data: Prisma.OfferUpdateInput) {
    return prisma.offer.update({
      where: { offerId },
      data,
    });
  }

  async updateStatus(offerId: number, data: { status: string; approvedBy?: number; directorNote?: string }) {
    const updateData: Prisma.OfferUpdateInput = {
      status: data.status,
    };

    if (data.approvedBy) {
      updateData.approvedByUser = { connect: { userId: data.approvedBy } };
    }
    if (data.directorNote !== undefined) {
      updateData.directorNote = data.directorNote;
    }

    return prisma.offer.update({
      where: { offerId },
      data: updateData,
    });
  }

  async delete(offerId: number) {
    return prisma.offer.delete({
      where: { offerId },
    });
  }
}

export const offerRepository = new OfferRepository();
