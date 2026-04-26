import { Router } from 'express';

import { validate } from '../../middleware/validate.js';
import { authMiddleware, roleMiddleware } from '../../middleware/auth.js';
import { offerController } from '../../controllers/offer.controller.js';
import {
  createOfferSchema,
  updateOfferSchema,
  approveOfferSchema,
  updateOfferStatusSchema,
} from '../../validators/offer.validator.js';

const router = Router();

// All offer routes require authentication
router.use(authMiddleware);

// Get lists and details
router.get('/', offerController.getOffers);
router.get('/:id', offerController.getOfferById);

// Recruiter/Admin only routes for creating and updating before approval
const recruiterRoles = ['Recruiter', 'Admin'];
router.post('/', roleMiddleware(recruiterRoles), validate(createOfferSchema), offerController.createOffer);
router.put('/:id', roleMiddleware(recruiterRoles), validate(updateOfferSchema), offerController.updateOffer);
router.delete('/:id', roleMiddleware(recruiterRoles), offerController.deleteOffer);

// Recruiter updates status to Sent, Accepted, Declined
router.patch('/:id/status', roleMiddleware(recruiterRoles), validate(updateOfferStatusSchema), offerController.updateOfferStatus);

// Director/Admin only routes for approving
const directorRoles = ['Director', 'Admin'];
router.patch('/:id/approve', roleMiddleware(directorRoles), validate(approveOfferSchema), offerController.approveOffer);

export default router;
