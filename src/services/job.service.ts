import { jobRepository } from '../repositories/job.repository.js';
import { AppError } from '../utils/appError.js';
import { HTTP_STATUS } from '../constants/httpStatus.js';

export class JobService {
  async getJobs(filters: { search?: string; deptName?: string; status?: string }) {
    return jobRepository.findAll(filters);
  }

  async getJobById(jobId: number) {
    const job = await jobRepository.findById(jobId);
    if (!job) {
      throw new AppError('Job not found', HTTP_STATUS.NOT_FOUND);
    }
    return job;
  }

  async createJob(userId: number, data: any) {
    const newJob = await jobRepository.create({
      postedBy: userId,
      deptName: data.deptName,
      title: data.title,
      description: data.description,
      requirements: data.requirements,
      salaryRange: data.salaryRange,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
      type: data.type || 'full-time',
      experienceLevel: data.experienceLevel || 'fresher',
      location: data.location || 'Hà Nội',
      headcount: data.headcount || 1,
      status: data.status || 'Draft',
    });
    return newJob;
  }

  async updateJob(jobId: number, data: any) {
    const job = await jobRepository.findById(jobId);
    if (!job) {
      throw new AppError('Job not found', HTTP_STATUS.NOT_FOUND);
    }

    const updateData: any = { ...data };
    if (data.startDate) updateData.startDate = new Date(data.startDate);
    if (data.endDate) updateData.endDate = new Date(data.endDate);

    return jobRepository.update(jobId, updateData);
  }

  async updateJobStatus(jobId: number, status: string) {
    const job = await jobRepository.findById(jobId);
    if (!job) {
      throw new AppError('Job not found', HTTP_STATUS.NOT_FOUND);
    }

    return jobRepository.update(jobId, { status });
  }

  async deleteJob(jobId: number) {
    const job = await jobRepository.findById(jobId);
    if (!job) {
      throw new AppError('Job not found', HTTP_STATUS.NOT_FOUND);
    }
    await jobRepository.delete(jobId);
    return { message: 'Job deleted successfully' };
  }
}

export const jobService = new JobService();
