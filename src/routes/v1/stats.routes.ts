import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth.js';
import { statsController } from '../../controllers/stats.controller.js';

const router = Router();

// All stats routes require authentication
router.use(authMiddleware);

// UC-15: Recruitment stats for Recruiters
router.get('/recruitment', statsController.getRecruitmentStats);

// UC-16: Director-level overview stats
router.get('/director', statsController.getDirectorStats);

export default router;
