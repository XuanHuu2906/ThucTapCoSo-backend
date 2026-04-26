import { Router } from 'express';
import authRoutes from './v1/auth.routes.js';
import jobRoutes from './v1/job.routes.js';
import applicationRoutes from './v1/application.routes.js';
import interviewRoutes from './v1/interview.routes.js';
import offerRoutes from './v1/offer.routes.js';
import probationRoutes from './v1/probation.routes.js';
import userRoutes from './v1/user.routes.js';
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
router.use('/offers', offerRoutes);
router.use('/probations', probationRoutes);
router.use('/users', userRoutes);

export default router;
