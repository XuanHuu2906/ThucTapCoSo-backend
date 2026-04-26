import { Router } from 'express';

import { authMiddleware, roleMiddleware } from '../../middleware/auth.js';
import { userController } from '../../controllers/user.controller.js';

const router = Router();

router.use(authMiddleware);

const recruiterRoles = ['Recruiter', 'Admin'];
router.get('/', roleMiddleware(recruiterRoles), userController.getUsers);

export default router;
