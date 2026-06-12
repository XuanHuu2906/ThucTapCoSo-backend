import crypto from 'crypto';
import { offerRepository } from '../repositories/offer.repository.js';
import { applicationRepository } from '../repositories/application.repository.js';
import { AppError } from '../utils/appError.js';
import { HTTP_STATUS } from '../constants/httpStatus.js';
import { emailService } from './email.service.js';
import { authService } from './auth.service.js';
import { configService } from './config.service.js';
import { userRepository } from '../repositories/user.repository.js';
import { notificationEmitter } from '../events/notification.events.js';
import { prisma } from '../config/prisma.js';

export class OfferService {
  private async getUserRole(userId: number) {
    const user = await userRepository.findById(userId);
    return user?.role;
  }
  async getOffers(filters: any) {
    return offerRepository.findAll(filters);
  }

  async getOfferById(offerId: number) {
    const offer = await offerRepository.findById(offerId);
    if (!offer) {
      throw new AppError('Offer not found', HTTP_STATUS.NOT_FOUND);
    }
    return offer;
  }

  async createOffer(userId: number, data: any) {
    // Check if application exists
    const app = await applicationRepository.findById(data.appId);
    if (!app) {
      throw new AppError('Application not found', HTTP_STATUS.NOT_FOUND);
    }

    // Check if an offer already exists for this application
    // Prisma unique constraint will also catch this, but it's better to provide a clear error message
    const existingOffers = await offerRepository.findAll({ appId: data.appId });
    if (existingOffers.length > 0) {
      throw new AppError('An offer already exists for this application', HTTP_STATUS.CONFLICT);
    }

    const newOffer = await offerRepository.create({
      ...data,
      createdBy: userId,
      startDate: new Date(data.startDate),
      status: 'Pending',
    });

    notificationEmitter.emit('offer.pending_approval', { offer: newOffer });

    return newOffer;
  }

  async updateOffer(offerId: number, data: any) {
    const offer = await this.getOfferById(offerId);

    if (offer.status !== 'Pending' && offer.status !== 'Rejected') {
      throw new AppError('Cannot update offer after it has been approved or processed', HTTP_STATUS.BAD_REQUEST);
    }

    const updateData = { ...data };
    if (data.startDate) {
      updateData.startDate = new Date(data.startDate);
    }

    // If updated after rejection, reset to Pending for re-approval
    if (offer.status === 'Rejected') {
      updateData.status = 'Pending';
    }

    return offerRepository.update(offerId, updateData);
  }

  async approveOffer(offerId: number, userId: number, status: string, directorNote?: string) {
    const offer = await this.getOfferById(offerId);

    if (offer.status !== 'Pending') {
      throw new AppError(`Cannot approve/reject an offer that is currently ${offer.status}`, HTTP_STATUS.BAD_REQUEST);
    }

    // Load configs
    const salaryThreshold = await configService.getConfig('DIRECTOR_SALARY_THRESHOLD');
    const highLevelPositions = await configService.getConfig('HIGH_LEVEL_POSITIONS') || [];

    const requireDirectorApproval =
      Number(offer.baseSalary) >= Number(salaryThreshold) ||
      highLevelPositions.includes(offer.application?.jobPosting?.title);

    // If it requires Director approval, only Director/Admin can approve
    const userRole = await this.getUserRole(userId); // Need to get user role
    if (requireDirectorApproval && userRole === 'HiringManager') {
      throw new AppError('This offer requires Director approval due to salary threshold or position level.', HTTP_STATUS.FORBIDDEN);
    }

    const result = await offerRepository.updateStatus(offerId, {
      status,
      approvedBy: userId,
      directorNote,
    });

    // REQ-017: Khi Director duyệt → sinh token + gửi email Offer với 2 nút Accept/Decline
    if (status === 'Approved') {
      const decisionToken = crypto.randomUUID();
      await offerRepository.setDecisionToken(offerId, decisionToken);

      const app = await applicationRepository.findById(offer.appId);
      if (app && app.candidate && app.jobPosting) {
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        emailService.sendOfferLetter(
          app.candidate.email,
          app.candidate.fullName,
          app.jobPosting.title,
          {
            basicSalary: Number(offer.baseSalary),
            probationSalary: Number(offer.baseSalary) * 0.85,
            startDate: offer.startDate,
            responseUrl: `${frontendUrl}/offer-response/${decisionToken}`,
          }
        );
      }
    }

    notificationEmitter.emit('offer.director_responded', { offer: { ...offer, status }, recruiterId: offer.createdBy });

    return result;
  }

  /**
   * UC-10: Ứng viên phản hồi Offer qua link trong email (public, không cần auth)
   */
  async getOfferByToken(token: string) {
    const offer = await offerRepository.findByToken(token);
    if (!offer) {
      throw new AppError('Offer không tồn tại hoặc đã được xử lý', HTTP_STATUS.NOT_FOUND);
    }
    if (offer.status !== 'Approved') {
      throw new AppError('Offer này đã được phản hồi trước đó', HTTP_STATUS.BAD_REQUEST);
    }
    return offer;
  }

  async respondToOffer(token: string, decision: 'accept' | 'decline', declineReason?: string) {
    const offer = await offerRepository.findByToken(token);
    if (!offer) {
      throw new AppError('Offer không tồn tại hoặc đã được xử lý', HTTP_STATUS.NOT_FOUND);
    }
    if (offer.status !== 'Approved') {
      throw new AppError('Offer này đã được phản hồi trước đó', HTTP_STATUS.BAD_REQUEST);
    }

    if (decision === 'accept') {
      // Cập nhật status Offer → Accepted
      await offerRepository.updateStatus(offer.offerId, { status: 'Accepted' });
      // Cập nhật Application → Hired
      await applicationRepository.updateStatus(offer.appId, 'Hired');
      // Clear token (dùng 1 lần)
      // await offerRepository.clearToken(offer.offerId);

      // REQ-019: Tự động tạo tài khoản Probationer + gửi email thông tin đăng nhập
      const app = await applicationRepository.findById(offer.appId);
      if (app && app.candidate) {
        const tempPassword = crypto.randomBytes(6).toString('base64url');
        try {
          await authService.register({
            email: app.candidate.email,
            password: tempPassword,
            fullName: app.candidate.fullName,
            role: 'Probationer',
          });
          emailService.sendOnboardingCredentials(
            app.candidate.email,
            app.candidate.fullName,
            { username: app.candidate.email, password: tempPassword }
          );
        } catch (error: any) {
          console.error('Failed to create probationer account:', error);
        }
        await this.createProbationForAcceptedOffer(offer);
      }

      notificationEmitter.emit('offer.candidate_responded', { offer: { ...offer, status: 'Accepted' }, recruiterId: offer.createdBy });

      return { decision: 'accepted' };
    } else {
      // Decline
      if (!declineReason || declineReason.trim().length === 0) {
        throw new AppError('Vui lòng nhập lý do từ chối', HTTP_STATUS.BAD_REQUEST);
      }
      await offerRepository.updateStatus(offer.offerId, { status: 'Declined' });
      await offerRepository.setDeclineReason(offer.offerId, declineReason.trim());
      await applicationRepository.updateStatus(offer.appId, 'Rejected');
      // await offerRepository.clearToken(offer.offerId);

      notificationEmitter.emit('offer.candidate_responded', { offer: { ...offer, status: 'Declined' }, recruiterId: offer.createdBy });

      return { decision: 'declined' };
    }
  }

  async updateOfferStatus(offerId: number, status: string) {
    const offer = await this.getOfferById(offerId);

    // Validate valid state transitions
    if (status === 'Sent' && offer.status !== 'Approved') {
      throw new AppError('Offer must be Approved before it can be Sent', HTTP_STATUS.BAD_REQUEST);
    }

    if ((status === 'Accepted' || status === 'Declined') && offer.status !== 'Sent') {
      throw new AppError('Offer must be Sent before it can be Accepted or Declined', HTTP_STATUS.BAD_REQUEST);
    }

    const result = await offerRepository.updateStatus(offerId, { status });

    // If accepted, update application status as well
    if (status === 'Accepted') {
      await applicationRepository.updateStatus(offer.appId, 'Hired');
      
      // REQ-019: Tự động tạo tài khoản và gửi email thông tin đăng nhập
      const app = await applicationRepository.findById(offer.appId);
      if (app && app.candidate) {
        // Sinh mật khẩu ngẫu nhiên 12 ký tự
        const tempPassword = Math.random().toString(36).slice(-6) + Math.random().toString(36).slice(-6).toUpperCase();
        
        try {
          await authService.register({
            email: app.candidate.email,
            password: tempPassword,
            fullName: app.candidate.fullName,
            role: 'Probationer',
          });
          
          emailService.sendOnboardingCredentials(
            app.candidate.email,
            app.candidate.fullName,
            {
              username: app.candidate.email,
              password: tempPassword,
            }
          );
        } catch (error: any) {
          console.error('Failed to create probationer account:', error);
          // Don't fail the whole request if user already exists
        }
        await this.createProbationForAcceptedOffer(offer);
      }
    }

    return result;
  }

  async deleteOffer(offerId: number) {
    const offer = await this.getOfferById(offerId);
    
    if (offer.status !== 'Pending' && offer.status !== 'Rejected') {
       throw new AppError('Cannot delete offer that is already in progress', HTTP_STATUS.BAD_REQUEST);
    }

    await offerRepository.delete(offerId);
    
    // Revert application status back to Interviewing or Shortlisted? Let's just leave it or set to Interviewing
    await applicationRepository.updateStatus(offer.appId, 'Interviewing');

    return { message: 'Offer deleted successfully' };
  }

  private async createProbationForAcceptedOffer(offer: any) {
    try {
      const app = await applicationRepository.findById(offer.appId);
      if (!app || !app.candidate) return;

      // Check if probation already exists
      const existingProbation = await prisma.probation.findUnique({
        where: { offerId: offer.offerId },
      });
      if (existingProbation) return;

      const registeredUser = await prisma.user.findUnique({
        where: { email: app.candidate.email },
      });
      if (!registeredUser) return;

      // Find supervisor (interviewer of the latest interview)
      const latestInterview = await prisma.interview.findFirst({
        where: { appId: offer.appId },
        orderBy: { interviewDate: 'desc' },
      });
      const supervisorId = latestInterview ? latestInterview.interviewerId : null;

      const startDate = new Date(offer.startDate);
      const endDate = new Date(startDate);
      const days = offer.probationDays ? Number(offer.probationDays) : 90;
      endDate.setDate(endDate.getDate() + days);

      await prisma.probation.create({
        data: {
          offerId: offer.offerId,
          probationerId: registeredUser.userId,
          supervisorId,
          startDate,
          endDate,
          status: 'Ongoing',
        },
      });
      console.log(`Successfully created probation record for offer ${offer.offerId}`);
    } catch (error) {
      console.error('Failed to automatically create probation record:', error);
    }
  }
}

export const offerService = new OfferService();
