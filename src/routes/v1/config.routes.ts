import { Router } from 'express';
import { authMiddleware, roleMiddleware } from '../../middleware/auth.js';
import { configController } from '../../controllers/config.controller.js';

const router = Router();

router.use(authMiddleware);

const adminRoles = ['Admin'];
router.get('/', roleMiddleware(adminRoles), configController.getConfigs);
router.put('/', roleMiddleware(adminRoles), configController.updateConfigs);

export default router;
