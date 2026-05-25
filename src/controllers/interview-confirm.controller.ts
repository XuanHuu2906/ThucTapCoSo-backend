import type { Request, Response, NextFunction } from 'express';
import { interviewService } from '../services/interview.service.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { HTTP_STATUS } from '../constants/httpStatus.js';

export class InterviewConfirmController {
  async getInterviewByToken(req: Request, res: Response, next: NextFunction) {
    try {
      const { token } = req.params;
      const interview = await interviewService.getInterviewByToken(token as string);
      sendSuccess(res, {
        candidateName: interview.application?.candidate?.fullName,
        jobTitle: interview.application?.jobPosting?.title,
        interviewDate: interview.interviewDate,
        location: interview.location,
        type: interview.type,
        interviewerName: interview.interviewer?.fullName,
        status: interview.confirmStatus,
      }, 'Interview info retrieved', HTTP_STATUS.OK);
    } catch (error) {
      next(error);
    }
  }

  async confirmInterviewByToken(req: Request, res: Response, next: NextFunction) {
    try {
      const { token } = req.params;
      const result = await interviewService.respondToInterview(token as string, 'confirmed');
      sendSuccess(res, result, 'Xác nhận tham gia phỏng vấn thành công', HTTP_STATUS.OK);
    } catch (error) {
      next(error);
    }
  }

  async declineInterviewByToken(req: Request, res: Response, next: NextFunction) {
    try {
      const { token } = req.params;
      const result = await interviewService.respondToInterview(token as string, 'declined');
      sendSuccess(res, result, 'Đã từ chối lịch phỏng vấn', HTTP_STATUS.OK);
    } catch (error) {
      next(error);
    }
  }
}

export const interviewConfirmController = new InterviewConfirmController();
