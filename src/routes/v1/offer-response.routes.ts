import { Router } from 'express';
import { offerController } from '../../controllers/offer.controller.js';

const router = Router();

// UC-10: Public routes - Ứng viên phản hồi Offer qua email (KHÔNG cần auth)
router.get('/:token', offerController.getOfferByToken);
router.post('/:token/accept', offerController.acceptOfferByToken);
router.post('/:token/decline', offerController.declineOfferByToken);

export default router;
