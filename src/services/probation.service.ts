import { probationRepository } from '../repositories/probation.repository.js';
import { offerRepository } from '../repositories/offer.repository.js';
import { AppError } from '../utils/appError.js';
import { HTTP_STATUS } from '../constants/httpStatus.js';
import { emailService } from './email.service.js';
import { configService } from './config.service.js';
import { userRepository } from '../repositories/user.repository.js';
import { notificationEmitter } from '../events/notification.events.js';

export class ProbationService {
  private async getUserRole(userId: number) {
    const user = await userRepository.findById(userId);
    return user?.role;
  }
  async getEndingSoon() {
    return probationRepository.findEndingSoon(7);
  }

  async getProbations(filters: any) {
    return probationRepository.findAll(filters);
  }

  async getProbationById(probationId: number) {
    const probation = await probationRepository.findById(probationId);
    if (!probation) {
      throw new AppError('Probation not found', HTTP_STATUS.NOT_FOUND);
    }
    return probation;
  }

  async createProbation(data: any) {
    // 1. Check if offer exists and is Accepted
    const offer = await offerRepository.findById(data.offerId);
    if (!offer) {
      throw new AppError('Offer not found', HTTP_STATUS.NOT_FOUND);
    }

    if (offer.status !== 'Accepted') {
      throw new AppError('Cannot start probation for an offer that is not Accepted', HTTP_STATUS.BAD_REQUEST);
    }

    try {
      const newProbation = await probationRepository.createWithProbationerAccount({
        offerId: data.offerId,
        supervisorId: data.supervisorId,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
      });

      return newProbation;
    } catch (error: any) {
      if (error.message.includes('already exists')) {
        throw new AppError(error.message, HTTP_STATUS.CONFLICT);
      }
      throw error;
    }
  }

  async updateProbation(probationId: number, data: any) {
    const probation = await this.getProbationById(probationId);

    if (probation.status === 'Pass' || probation.status === 'Fail') {
      throw new AppError('Cannot update a completed probation', HTTP_STATUS.BAD_REQUEST);
    }

    const updateData = { ...data };
    if (data.startDate) updateData.startDate = new Date(data.startDate);
    if (data.endDate) updateData.endDate = new Date(data.endDate);

    return probationRepository.update(probationId, updateData);
  }

  async evaluateProbation(probationId: number, userId: number, userRole: string, data: any) {
    const probation = await this.getProbationById(probationId);

    if (probation.status === 'Pass' || probation.status === 'Fail') {
      throw new AppError('Probation is already completed', HTTP_STATUS.BAD_REQUEST);
    }

    // Only the assigned supervisor or Admin can evaluate
    if (probation.supervisorId !== userId && userRole !== 'Admin') {
      throw new AppError('You are not authorized to evaluate this probation', HTTP_STATUS.FORBIDDEN);
    }

    const result = await probationRepository.upsertEvaluation(probationId, {
      ...data,
      submittedBy: userId,
    });

    if (result.status === 'PendingApproval') {
      notificationEmitter.emit('probation.pending_approval', { probation });
    }

    return result;
  }

  async approveEvaluation(probationId: number, userId: number, status: string, directorNote?: string) {
    const probation = await this.getProbationById(probationId);

    if (!probation.evaluation) {
      throw new AppError('No evaluation found to approve', HTTP_STATUS.BAD_REQUEST);
    }

    if (probation.evaluation.status !== 'PendingApproval') {
      throw new AppError('Evaluation is not pending approval', HTTP_STATUS.BAD_REQUEST);
    }

    // Load config
    const highLevelPositions = await configService.getConfig('HIGH_LEVEL_POSITIONS') || [];
    const isHighLevel = highLevelPositions.includes(probation.offer?.application?.jobPosting?.title);

    const userRole = await this.getUserRole(userId);
    if (isHighLevel && userRole === 'HiringManager') {
      throw new AppError('This probation evaluation requires Director approval due to the position level.', HTTP_STATUS.FORBIDDEN);
    }

    const result = await probationRepository.approveEvaluation(probation.evaluation.evalId, {
      status,
      approvedBy: userId,
      directorNote,
    });

    // REQ-025: Gửi email thông báo kết quả thử việc cho nhân viên sau khi Director phê duyệt
    if (status === 'Approved') {
      emailService.sendProbationResult(
        probation.probationer.email,
        probation.probationer.fullName,
        {
          recommendation: result.recommendation,
          note: directorNote
        }
      );
    }

    notificationEmitter.emit('probation.director_responded', { 
      probation: { ...probation, status: result.recommendation === 'Pass' && status === 'Approved' ? 'Pass' : 'Fail' }, 
      recruiterId: probation.offer?.createdBy 
    });

    return result;
  }
}

export const probationService = new ProbationService();
