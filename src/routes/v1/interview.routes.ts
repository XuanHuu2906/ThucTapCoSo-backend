import { Router } from 'express';

import { validate } from '../../middleware/validate.js';
import { authMiddleware, roleMiddleware } from '../../middleware/auth.js';
import { interviewController } from '../../controllers/interview.controller.js';
import {
  scheduleInterviewSchema,
  updateInterviewSchema,
  confirmInterviewSchema,
  evaluateInterviewSchema,
} from '../../validators/interview.validator.js';

const router = Router();

// All interview routes require authentication
router.use(authMiddleware);

// Get lists and details
router.get('/', interviewController.getInterviews);
router.get('/:id', interviewController.getInterviewById);

// Recruiter/Admin only routes for scheduling
const scheduleRoles = ['Recruiter', 'Admin'];
router.post('/', roleMiddleware(scheduleRoles), validate(scheduleInterviewSchema), interviewController.scheduleInterview);
router.put('/:id', roleMiddleware(scheduleRoles), validate(updateInterviewSchema), interviewController.updateInterview);
router.delete('/:id', roleMiddleware(scheduleRoles), interviewController.deleteInterview);

// Interviewer actions (Authorization logic is inside service layer)
router.patch('/:id/confirm', validate(confirmInterviewSchema), interviewController.confirmInterview);
router.patch('/:id/evaluate', validate(evaluateInterviewSchema), interviewController.evaluateInterview);

export default router;
