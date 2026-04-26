import { applicationRepository } from '../repositories/application.repository.js';
import { jobRepository } from '../repositories/job.repository.js';
import { AppError } from '../utils/appError.js';
import { HTTP_STATUS } from '../constants/httpStatus.js';

export class ApplicationService {
  async getApplications(filters: { jobId?: number; status?: string }) {
    return applicationRepository.findAll(filters);
  }

  async getApplicationById(appId: number) {
    const application = await applicationRepository.findById(appId);
    if (!application) {
      throw new AppError('Application not found', HTTP_STATUS.NOT_FOUND);
    }
    return application;
  }

  async submitApplication(data: {
    jobId: number;
    fullName: string;
    email: string;
    phone?: string;
    cvFile?: string;
  }) {
    // Check if job exists and is Open
    const job = await jobRepository.findById(data.jobId);
    if (!job) {
      throw new AppError('Job not found', HTTP_STATUS.NOT_FOUND);
    }
    if (job.status !== 'Open') {
      throw new AppError('This job is no longer accepting applications', HTTP_STATUS.BAD_REQUEST);
    }

    try {
      const application = await applicationRepository.createApplicationWithCandidate(data);
      
      // In a real app, trigger an async job here to send confirmation email
      // sendConfirmationEmail(application.candidate.email, job.title);

      return application;
    } catch (error: any) {
      if (error.message === 'Application already exists') {
        throw new AppError('You have already applied for this job', HTTP_STATUS.CONFLICT);
      }
      throw error;
    }
  }

  async updateApplicationStatus(appId: number, status: string, userId: number) {
    const application = await applicationRepository.findById(appId);
    if (!application) {
      throw new AppError('Application not found', HTTP_STATUS.NOT_FOUND);
    }

    return applicationRepository.updateStatus(appId, status, userId);
  }
}

export const applicationService = new ApplicationService();
