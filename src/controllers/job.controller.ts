import type { Request, Response, NextFunction } from 'express';
import { jobService } from '../services/job.service.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { HTTP_STATUS } from '../constants/httpStatus.js';

export class JobController {
  async getJobs(req: Request, res: Response, next: NextFunction) {
    try {
      const { search, deptName, status } = req.query;
      const filters = {
        search: search as string,
        deptName: deptName as string,
        status: status as string,
      };

      const jobs = await jobService.getJobs(filters);
      sendSuccess(res, jobs, 'Jobs retrieved successfully', HTTP_STATUS.OK);
    } catch (error) {
      next(error);
    }
  }

  async getJobById(req: Request, res: Response, next: NextFunction) {
    try {
      const jobId = parseInt(req.params.id as string);
      const job = await jobService.getJobById(jobId);
      sendSuccess(res, job, 'Job retrieved successfully', HTTP_STATUS.OK);
    } catch (error) {
      next(error);
    }
  }

  async createJob(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = parseInt(req.user!.id);
      const newJob = await jobService.createJob(userId, req.body);
      sendSuccess(res, newJob, 'Job created successfully', HTTP_STATUS.CREATED);
    } catch (error) {
      next(error);
    }
  }

  async updateJob(req: Request, res: Response, next: NextFunction) {
    try {
      const jobId = parseInt(req.params.id as string);
      const updatedJob = await jobService.updateJob(jobId, req.body);
      sendSuccess(res, updatedJob, 'Job updated successfully', HTTP_STATUS.OK);
    } catch (error) {
      next(error);
    }
  }

  async updateJobStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const jobId = parseInt(req.params.id as string);
      const { status } = req.body;
      const updatedJob = await jobService.updateJobStatus(jobId, status);
      sendSuccess(res, updatedJob, 'Job status updated successfully', HTTP_STATUS.OK);
    } catch (error) {
      next(error);
    }
  }

  async deleteJob(req: Request, res: Response, next: NextFunction) {
    try {
      const jobId = parseInt(req.params.id as string);
      const result = await jobService.deleteJob(jobId);
      sendSuccess(res, null, result.message, HTTP_STATUS.OK);
    } catch (error) {
      next(error);
    }
  }
}

export const jobController = new JobController();
