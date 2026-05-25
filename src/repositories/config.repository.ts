import { Prisma } from '@prisma/client';
import { prisma } from '../config/prisma.js';

export class ConfigRepository {
  async findByKey(key: string) {
    return prisma.systemConfig.findUnique({
      where: { key },
    });
  }

  async findAll() {
    return prisma.systemConfig.findMany({
      orderBy: { key: 'asc' },
    });
  }

  async upsert(key: string, value: string, description?: string, updatedById?: number) {
    return prisma.systemConfig.upsert({
      where: { key },
      update: { value, description, updatedById },
      create: { key, value, description, updatedById },
    });
  }
}

export const configRepository = new ConfigRepository();
