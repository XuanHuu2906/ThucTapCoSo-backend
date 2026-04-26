import { interviewRepository } from '../repositories/interview.repository.js';
import { applicationRepository } from '../repositories/application.repository.js';
import { AppError } from '../utils/appError.js';
import { HTTP_STATUS } from '../constants/httpStatus.js';

export class InterviewService {
  async getInterviews(filters: any) {
    return interviewRepository.findAll(filters);
  }

  async getInterviewById(interviewId: number) {
    const interview = await interviewRepository.findById(interviewId);
    if (!interview) {
      throw new AppError('Interview not found', HTTP_STATUS.NOT_FOUND);
    }
    return interview;
  }

  async scheduleInterview(data: any) {
    // Check if application exists
    const app = await applicationRepository.findById(data.appId);
    if (!app) {
      throw new AppError('Application not found', HTTP_STATUS.NOT_FOUND);
    }

    // Check for interviewer schedule conflicts
    const interviewDate = new Date(data.interviewDate);
    const conflict = await interviewRepository.findConflicts(Number(data.interviewerId), interviewDate);
    
    if (conflict) {
      throw new AppError('Người phỏng vấn đã có lịch trong khoảng thời gian này. Vui lòng chọn giờ khác.', HTTP_STATUS.BAD_REQUEST);
    }

    const newInterview = await interviewRepository.create({
      ...data,
      interviewDate,
      confirmStatus: 'Pending',
      result: 'Pending',
    });

    return newInterview;
  }

  async updateInterview(interviewId: number, data: any) {
    const interview = await this.getInterviewById(interviewId);

    const updateData = { ...data };
    if (data.interviewDate) {
      updateData.interviewDate = new Date(data.interviewDate);
    }

    // If changing interviewer or date, reset confirm status and check for conflicts
    const isChangingInterviewer = data.interviewerId && Number(data.interviewerId) !== interview.interviewerId;
    const isChangingDate = data.interviewDate && new Date(data.interviewDate).getTime() !== interview.interviewDate.getTime();

    if (isChangingInterviewer || isChangingDate) {
      updateData.confirmStatus = 'Pending';
      
      const newInterviewerId = data.interviewerId ? Number(data.interviewerId) : interview.interviewerId;
      const newDate = data.interviewDate ? new Date(data.interviewDate) : interview.interviewDate;

      const conflict = await interviewRepository.findConflicts(newInterviewerId, newDate, interviewId);
      if (conflict) {
        throw new AppError('Người phỏng vấn đã có lịch trong khoảng thời gian này. Vui lòng chọn giờ khác.', HTTP_STATUS.BAD_REQUEST);
      }
    }

    return interviewRepository.update(interviewId, updateData);
  }

  async confirmInterview(interviewId: number, userId: number, userRole: string, status: string) {
    const interview = await this.getInterviewById(interviewId);

    // Only the assigned interviewer or Admin can confirm/decline
    if (interview.interviewerId !== userId && userRole !== 'Admin') {
      throw new AppError('You are not authorized to confirm this interview', HTTP_STATUS.FORBIDDEN);
    }

    return interviewRepository.updateConfirmStatus(interviewId, status);
  }

  async evaluateInterview(interviewId: number, userId: number, userRole: string, data: any) {
    const interview = await this.getInterviewById(interviewId);

    // Only the assigned interviewer or Admin can evaluate
    if (interview.interviewerId !== userId && userRole !== 'Admin') {
      throw new AppError('You are not authorized to evaluate this interview', HTTP_STATUS.FORBIDDEN);
    }

    if (interview.confirmStatus !== 'Confirmed') {
      throw new AppError('Cannot evaluate an interview that is not confirmed', HTTP_STATUS.BAD_REQUEST);
    }

    return interviewRepository.evaluate(interviewId, data);
  }

  async deleteInterview(interviewId: number) {
    await this.getInterviewById(interviewId);
    await interviewRepository.delete(interviewId);
    return { message: 'Interview deleted successfully' };
  }
}

export const interviewService = new InterviewService();
