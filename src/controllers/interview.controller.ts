import type { Request, Response, NextFunction } from 'express';
import { interviewService } from '../services/interview.service.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { HTTP_STATUS } from '../constants/httpStatus.js';

export class InterviewController {
  async getInterviews(req: Request, res: Response, next: NextFunction) {
    try {
      const { appId, interviewerId, type, confirmStatus, result } = req.query;
      
      let finalInterviewerId = interviewerId ? parseInt(interviewerId as string) : undefined;
      if (req.user!.role === 'HiringManager') {
        finalInterviewerId = parseInt(req.user!.id);
      }

      const filters = {
        appId: appId ? parseInt(appId as string) : undefined,
        interviewerId: finalInterviewerId,
        type: type as string,
        confirmStatus: confirmStatus as string,
        result: result as string,
      };

      const interviews = await interviewService.getInterviews(filters);
      sendSuccess(res, interviews, 'Interviews retrieved successfully', HTTP_STATUS.OK);
    } catch (error) {
      next(error);
    }
  }

  async getInterviewById(req: Request, res: Response, next: NextFunction) {
    try {
      const interviewId = parseInt(req.params.id as string);
      const interview = await interviewService.getInterviewById(interviewId);
      sendSuccess(res, interview, 'Interview retrieved successfully', HTTP_STATUS.OK);
    } catch (error) {
      next(error);
    }
  }

  async scheduleInterview(req: Request, res: Response, next: NextFunction) {
    try {
      const newInterview = await interviewService.scheduleInterview(req.body);
      sendSuccess(res, newInterview, 'Interview scheduled successfully', HTTP_STATUS.CREATED);
    } catch (error) {
      next(error);
    }
  }

  async updateInterview(req: Request, res: Response, next: NextFunction) {
    try {
      const interviewId = parseInt(req.params.id as string);
      const updatedInterview = await interviewService.updateInterview(interviewId, req.body);
      sendSuccess(res, updatedInterview, 'Interview updated successfully', HTTP_STATUS.OK);
    } catch (error) {
      next(error);
    }
  }

  async confirmInterview(req: Request, res: Response, next: NextFunction) {
    try {
      const interviewId = parseInt(req.params.id as string);
      const { confirmStatus } = req.body;
      const userId = parseInt(req.user!.id);
      const userRole = req.user!.role;

      const updatedInterview = await interviewService.confirmInterview(interviewId, userId, userRole, confirmStatus);
      sendSuccess(res, updatedInterview, 'Interview confirmation status updated', HTTP_STATUS.OK);
    } catch (error) {
      next(error);
    }
  }

  async evaluateInterview(req: Request, res: Response, next: NextFunction) {
    try {
      const interviewId = parseInt(req.params.id as string);
      const userId = parseInt(req.user!.id);
      const userRole = req.user!.role;

      const updatedInterview = await interviewService.evaluateInterview(interviewId, userId, userRole, req.body);
      sendSuccess(res, updatedInterview, 'Interview evaluated successfully', HTTP_STATUS.OK);
    } catch (error) {
      next(error);
    }
  }

  async deleteInterview(req: Request, res: Response, next: NextFunction) {
    try {
      const interviewId = parseInt(req.params.id as string);
      const result = await interviewService.deleteInterview(interviewId);
      sendSuccess(res, null, result.message, HTTP_STATUS.OK);
    } catch (error) {
      next(error);
    }
  }
}

export const interviewController = new InterviewController();
