import { Prisma } from '@prisma/client';
import { prisma } from '../config/prisma.js';

export class UserRepository {
  async findByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
    });
  }

  async findById(userId: number) {
    return prisma.user.findUnique({
      where: { userId },
      select: {
        userId: true,
        fullName: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
      },
    });
  }

  async findAll(filters: { role?: string; status?: string }) {
    const where: Prisma.UserWhereInput = {};

    if (filters.role) where.role = filters.role;
    if (filters.status) where.status = filters.status;

    return prisma.user.findMany({
      where,
      orderBy: { fullName: 'asc' },
      select: {
        userId: true,
        fullName: true,
        email: true,
        role: true,
        status: true,
      },
    });
  }

  async updatePassword(userId: number, hashedPassword: string) {
    return prisma.user.update({
      where: { userId },
      data: { password: hashedPassword },
    });
  }

  async create(data: Prisma.UserCreateInput) {
    return prisma.user.create({
      data,
      select: {
        userId: true,
        fullName: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
      },
    });
  }
}

export const userRepository = new UserRepository();
