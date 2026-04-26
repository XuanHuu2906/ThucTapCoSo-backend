import { Prisma } from "@prisma/client";
import prisma from "../config/prisma";

type JobStatus = "Draft" | "Open" | "Closed";

type FindAllFilters = {
  search?: string;
  deptName?: string;
  status?: JobStatus;
};

const findAll = async (filters: FindAllFilters) => {
  const where: Prisma.JobPostingWhereInput = {};

  if (filters.search) {
    where.title = {
      contains: filters.search,
    };
  }

  if (filters.deptName) {
    where.deptName = filters.deptName;
  }

  if (filters.status) {
    where.status = filters.status;
  }

  return prisma.jobPosting.findMany({
    where,
    orderBy: {
      createdAt: "desc",
    },
    include: {
      postedByUser: true,
    },
  });
};

const findById = async (jobId: number) => {
  return prisma.jobPosting.findUnique({
    where: { jobId },
    include: {
      postedByUser: true,
    },
  });
};

const create = async (data: Prisma.JobPostingUncheckedCreateInput) => {
  return prisma.jobPosting.create({
    data,
  });
};

const update = async (
  jobId: number,
  data: Prisma.JobPostingUncheckedUpdateInput
) => {
  return prisma.jobPosting.update({
    where: { jobId },
    data,
  });
};

const remove = async (jobId: number) => {
  const job = await prisma.jobPosting.findUnique({
    where: { jobId },
    include: {
      _count: {
        select: {
          applications: true,
        },
      },
    },
  });

  if (!job) {
    return null;
  }

  if (job._count.applications > 0) {
    const error = new Error(
      "Tin tuyển dụng đã có ứng viên ứng tuyển, không thể xóa"
    ) as Error & { statusCode?: number };
    error.statusCode = 409;
    throw error;
  }

  return prisma.jobPosting.delete({
    where: { jobId },
  });
};

export const jobRepository = {
  findAll,
  findById,
  create,
  update,
  delete: remove,
};