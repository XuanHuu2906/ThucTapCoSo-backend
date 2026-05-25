import { Router } from 'express';
import { interviewConfirmController } from '../../controllers/interview-confirm.controller.js';

const router = Router();

// UC-06: Public routes - Ứng viên xác nhận/từ chối lịch PV qua email (KHÔNG cần auth)
router.get('/:token', interviewConfirmController.getInterviewByToken);
router.post('/:token/confirm', interviewConfirmController.confirmInterviewByToken);
router.post('/:token/decline', interviewConfirmController.declineInterviewByToken);

export default router;
