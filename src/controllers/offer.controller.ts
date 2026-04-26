import type { Request, Response, NextFunction } from 'express';
import { offerService } from '../services/offer.service.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { HTTP_STATUS } from '../constants/httpStatus.js';

export class OfferController {
  async getOffers(req: Request, res: Response, next: NextFunction) {
    try {
      const { appId, status } = req.query;
      
      const filters = {
        appId: appId ? parseInt(appId as string) : undefined,
        status: status as string,
      };

      const offers = await offerService.getOffers(filters);
      sendSuccess(res, offers, 'Offers retrieved successfully', HTTP_STATUS.OK);
    } catch (error) {
      next(error);
    }
  }

  async getOfferById(req: Request, res: Response, next: NextFunction) {
    try {
      const offerId = parseInt(req.params.id as string);
      const offer = await offerService.getOfferById(offerId);
      sendSuccess(res, offer, 'Offer retrieved successfully', HTTP_STATUS.OK);
    } catch (error) {
      next(error);
    }
  }

  async createOffer(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = parseInt(req.user!.id);
      const newOffer = await offerService.createOffer(userId, req.body);
      sendSuccess(res, newOffer, 'Offer created successfully', HTTP_STATUS.CREATED);
    } catch (error) {
      next(error);
    }
  }

  async updateOffer(req: Request, res: Response, next: NextFunction) {
    try {
      const offerId = parseInt(req.params.id as string);
      const updatedOffer = await offerService.updateOffer(offerId, req.body);
      sendSuccess(res, updatedOffer, 'Offer updated successfully', HTTP_STATUS.OK);
    } catch (error) {
      next(error);
    }
  }

  async approveOffer(req: Request, res: Response, next: NextFunction) {
    try {
      const offerId = parseInt(req.params.id as string);
      const { status, directorNote } = req.body;
      const userId = parseInt(req.user!.id);

      const updatedOffer = await offerService.approveOffer(offerId, userId, status, directorNote);
      sendSuccess(res, updatedOffer, `Offer ${status} successfully`, HTTP_STATUS.OK);
    } catch (error) {
      next(error);
    }
  }

  async updateOfferStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const offerId = parseInt(req.params.id as string);
      const { status } = req.body;

      const updatedOffer = await offerService.updateOfferStatus(offerId, status);
      sendSuccess(res, updatedOffer, 'Offer status updated successfully', HTTP_STATUS.OK);
    } catch (error) {
      next(error);
    }
  }

  async deleteOffer(req: Request, res: Response, next: NextFunction) {
    try {
      const offerId = parseInt(req.params.id as string);
      const result = await offerService.deleteOffer(offerId);
      sendSuccess(res, null, result.message, HTTP_STATUS.OK);
    } catch (error) {
      next(error);
    }
  }
}

export const offerController = new OfferController();
