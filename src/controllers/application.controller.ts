import type { Request, Response, NextFunction } from 'express';
import { applicationService } from '../services/application.service.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { AppError } from '../utils/appError.js';
import { HTTP_STATUS } from '../constants/httpStatus.js';

export class ApplicationController {
  async getApplications(req: Request, res: Response, next: NextFunction) {
    try {
      const { jobId, status } = req.query;
      const filters = {
        jobId: jobId ? parseInt(jobId as string) : undefined,
        status: status as string,
      };

      const applications = await applicationService.getApplications(filters);
      sendSuccess(res, applications, 'Applications retrieved successfully', HTTP_STATUS.OK);
    } catch (error) {
      next(error);
    }
  }

  async getApplicationById(req: Request, res: Response, next: NextFunction) {
    try {
      const appId = parseInt(req.params.id as string);
      const application = await applicationService.getApplicationById(appId);
      sendSuccess(res, application, 'Application retrieved successfully', HTTP_STATUS.OK);
    } catch (error) {
      next(error);
    }
  }

  async submitApplication(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        throw new AppError('CV file is required', HTTP_STATUS.BAD_REQUEST);
      }

      const cvFile = req.file.path; // Multer-storage-cloudinary provides the URL in req.file.path
      
      const applicationData = {
        jobId: parseInt(req.body.jobId),
        fullName: req.body.fullName,
        email: req.body.email,
        phone: req.body.phone,
        cvFile,
      };

      const application = await applicationService.submitApplication(applicationData);
      sendSuccess(res, application, 'Application submitted successfully', HTTP_STATUS.CREATED);
    } catch (error: any) {
      next(error);
    }
  }

  async updateApplicationStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const appId = parseInt(req.params.id as string);
      const { status } = req.body;
      const userId = parseInt(req.user!.id); // Assuming Recruiter updating the status

      const application = await applicationService.updateApplicationStatus(appId, status, userId);
      sendSuccess(res, application, 'Application status updated successfully', HTTP_STATUS.OK);
    } catch (error) {
      next(error);
    }
  }
}

export const applicationController = new ApplicationController();
