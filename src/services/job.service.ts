import { jobRepository } from "../repositories/job.repository";
import {
  CreateJobInput,
  UpdateJobInput,
} from "../validators/job.validator";

type JobStatus = "Draft" | "Open" | "Closed";

class HttpError extends Error {
  statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
  }
}

const getJobs = async (query: Record<string, unknown>) => {
  const filters = {
    search: typeof query.search === "string" ? query.search : undefined,
    deptName: typeof query.deptName === "string" ? query.deptName : undefined,
    status:
      typeof query.status === "string"
        ? (query.status as JobStatus)
        : undefined,
  };

  return jobRepository.findAll(filters);
};

const getJobById = async (id: string) => {
  const jobId = Number(id);

  if (Number.isNaN(jobId)) {
    throw new HttpError(400, "Job ID không hợp lệ");
  }

  const job = await jobRepository.findById(jobId);

  if (!job) {
    throw new HttpError(404, "Không tìm thấy tin tuyển dụng");
  }

  return job;
};

const createJob = async (userId: number, data: CreateJobInput) => {
  return jobRepository.create({
    ...data,
    postedBy: userId,
    status: data.status ?? "Draft",
  });
};

const updateJob = async (
  _userId: number,
  _role: string,
  id: string,
  data: UpdateJobInput
) => {
  const jobId = Number(id);

  if (Number.isNaN(jobId)) {
    throw new HttpError(400, "Job ID không hợp lệ");
  }

  const existingJob = await jobRepository.findById(jobId);

  if (!existingJob) {
    throw new HttpError(404, "Không tìm thấy tin tuyển dụng");
  }

  return jobRepository.update(jobId, data);
};

const updateJobStatus = async (id: string, status: JobStatus) => {
  const jobId = Number(id);

  if (Number.isNaN(jobId)) {
    throw new HttpError(400, "Job ID không hợp lệ");
  }

  const existingJob = await jobRepository.findById(jobId);

  if (!existingJob) {
    throw new HttpError(404, "Không tìm thấy tin tuyển dụng");
  }

  return jobRepository.update(jobId, { status });
};

const deleteJob = async (id: string) => {
  const jobId = Number(id);

  if (Number.isNaN(jobId)) {
    throw new HttpError(400, "Job ID không hợp lệ");
  }

  const existingJob = await jobRepository.findById(jobId);

  if (!existingJob) {
    throw new HttpError(404, "Không tìm thấy tin tuyển dụng");
  }

  return jobRepository.delete(jobId);
};

export const jobService = {
  getJobs,
  getJobById,
  createJob,
  updateJob,
  updateJobStatus,
  deleteJob,
};