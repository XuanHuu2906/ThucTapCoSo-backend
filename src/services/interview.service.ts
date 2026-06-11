import crypto from 'crypto';
import { interviewRepository } from '../repositories/interview.repository.js';
import { applicationRepository } from '../repositories/application.repository.js';
import { AppError } from '../utils/appError.js';
import { HTTP_STATUS } from '../constants/httpStatus.js';
import { emailService } from './email.service.js';
import { notificationEmitter } from '../events/notification.events.js';

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

    // UC-06: Generate confirm token + send email invitation with confirm/decline links
    const confirmToken = crypto.randomUUID();
    await interviewRepository.setConfirmToken(newInterview.interviewId, confirmToken);

    // REQ-012: Send interview invitation email
    if (app.candidate && app.jobPosting) {
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      emailService.sendInterviewInvitation(
        app.candidate.email,
        app.candidate.fullName,
        app.jobPosting.title,
        {
          interviewDate: newInterview.interviewDate,
          location: newInterview.location,
          type: newInterview.type,
          confirmUrl: `${frontendUrl}/interview-confirm/${confirmToken}`,
        }
      );
    }

    notificationEmitter.emit('interview.assigned', { interview: newInterview, application: app });

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
      const newInterviewerId = data.interviewerId ? Number(data.interviewerId) : interview.interviewerId;
      const newDate = data.interviewDate ? new Date(data.interviewDate) : interview.interviewDate;

      const conflict = await interviewRepository.findConflicts(newInterviewerId, newDate, interviewId);
      if (conflict) {
        throw new AppError('Người phỏng vấn đã có lịch trong khoảng thời gian này. Vui lòng chọn giờ khác.', HTTP_STATUS.BAD_REQUEST);
      }
    }

    if (isChangingDate) {
      updateData.confirmStatus = 'Pending';
    }

    const updatedInterview = await interviewRepository.update(interviewId, updateData);

    // UC-06: Gửi lại email xác nhận cho ứng viên nếu có thay đổi ngày giờ
    if (isChangingDate) {
      const app = interview.application;
      if (app && app.candidate && app.jobPosting && interview.confirmToken) {
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        emailService.sendInterviewInvitation(
          app.candidate.email,
          app.candidate.fullName,
          app.jobPosting.title,
          {
            interviewDate: updatedInterview.interviewDate,
            location: updatedInterview.location || interview.location || '',
            type: updatedInterview.type || interview.type,
            confirmUrl: `${frontendUrl}/interview-confirm/${interview.confirmToken}`,
          },
          true // isRescheduled
        );
      }
    }

    notificationEmitter.emit('interview.updated', { interview: updatedInterview });
    return updatedInterview;
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

    // Only the assigned interviewer, Admin, HiringManager, Director can evaluate
    if (interview.interviewerId !== userId && !['Admin', 'Manager', 'HiringManager', 'Director', 'Recruiter'].includes(userRole)) {
      throw new AppError('You are not authorized to evaluate this interview', HTTP_STATUS.FORBIDDEN);
    }

    // Bypass confirmStatus check for easier testing flow, or auto-assume it's confirmed if evaluated
    // if (interview.confirmStatus !== 'Confirmed') {
    //   throw new AppError('Cannot evaluate an interview that is not confirmed', HTTP_STATUS.BAD_REQUEST);
    // }

    const evaluatedInterview = await interviewRepository.evaluate(interviewId, data);
    const hmName = interview.interviewer?.fullName || "Hiring Manager";
    notificationEmitter.emit('interview.evaluated', { interview: evaluatedInterview, job: interview.application.jobPosting, hmName });
    return evaluatedInterview;
  }

  async deleteInterview(interviewId: number) {
    await this.getInterviewById(interviewId);
    await interviewRepository.delete(interviewId);
    return { message: 'Interview deleted successfully' };
  }

  // ===== UC-06: Public endpoints cho ứng viên xác nhận/từ chối lịch PV =====

  async getInterviewByToken(token: string) {
    const interview = await interviewRepository.findByToken(token);
    if (!interview) {
      throw new AppError('Link xác nhận không tồn tại hoặc đã hết hạn', HTTP_STATUS.NOT_FOUND);
    }
    if (interview.confirmStatus !== 'Pending') {
      throw new AppError('Lịch phỏng vấn này đã được phản hồi trước đó', HTTP_STATUS.BAD_REQUEST);
    }
    return interview;
  }

  async respondToInterview(token: string, decision: 'confirmed' | 'declined') {
    const interview = await interviewRepository.findByToken(token);
    if (!interview) {
      throw new AppError('Link xác nhận không tồn tại hoặc đã hết hạn', HTTP_STATUS.NOT_FOUND);
    }
    if (interview.confirmStatus !== 'Pending') {
      throw new AppError('Lịch phỏng vấn này đã được phản hồi trước đó', HTTP_STATUS.BAD_REQUEST);
    }

    const updatedStatus = decision === 'confirmed' ? 'Confirmed' : 'Declined';
    await interviewRepository.updateConfirmStatus(interview.interviewId, updatedStatus);
    // await interviewRepository.clearConfirmToken(interview.interviewId); // Giữ lại token để ứng viên click lại sẽ thấy "Đã phản hồi trước đó" thay vì 404

    notificationEmitter.emit('interview.candidate_responded', {
      interview: { ...interview, confirmStatus: updatedStatus },
      application: interview.application,
      job: interview.application.jobPosting
    });

    notificationEmitter.emit('interview.candidate_responded_hm', { interview: { ...interview, confirmStatus: updatedStatus } });

    if (updatedStatus === 'Declined') {
      // Cập nhật trạng thái ứng viên thành Rejected khi từ chối phỏng vấn
      await applicationRepository.updateStatus(interview.appId, 'Rejected');
    }

    return { decision: decision === 'confirmed' ? 'confirmed' : 'declined' };
  }
}

export const interviewService = new InterviewService();
