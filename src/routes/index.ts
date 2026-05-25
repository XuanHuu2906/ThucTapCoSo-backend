import { Router } from 'express';
import authRoutes from './v1/auth.routes.js';
import jobRoutes from './v1/job.routes.js';
import applicationRoutes from './v1/application.routes.js';
import interviewRoutes from './v1/interview.routes.js';
import interviewConfirmRoutes from './v1/interview-confirm.routes.js';
import offerRoutes from './v1/offer.routes.js';
import offerResponseRoutes from './v1/offer-response.routes.js';
import probationRoutes from './v1/probation.routes.js';
import userRoutes from './v1/user.routes.js';
import statsRoutes from './v1/stats.routes.js';
import { HTTP_STATUS } from '../constants/httpStatus.js';
import { sendSuccess } from '../utils/apiResponse.js';

const router = Router();

// Health check route
router.get('/health', (_req, res) => {
  return sendSuccess(res, null, 'Server is healthy', HTTP_STATUS.OK);
});

router.use('/auth', authRoutes);
router.use('/jobs', jobRoutes);
router.use('/applications', applicationRoutes);
router.use('/interviews', interviewRoutes);
router.use('/interview-confirm', interviewConfirmRoutes); // UC-06: Public (không cần auth)
router.use('/offers', offerRoutes);
router.use('/offer-response', offerResponseRoutes); // UC-10: Public (không cần auth)
router.use('/probations', probationRoutes);
router.use('/users', userRoutes);
router.use('/stats', statsRoutes); // UC-15, UC-16: Stats/Reports

export default router;
