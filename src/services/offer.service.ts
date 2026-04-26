import { offerRepository } from '../repositories/offer.repository.js';
import { applicationRepository } from '../repositories/application.repository.js';
import { AppError } from '../utils/appError.js';
import { HTTP_STATUS } from '../constants/httpStatus.js';

export class OfferService {
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

    return offerRepository.updateStatus(offerId, {
      status,
      approvedBy: userId,
      directorNote,
    });
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
}

export const offerService = new OfferService();
