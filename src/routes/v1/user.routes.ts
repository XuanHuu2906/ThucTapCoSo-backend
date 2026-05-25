import { Router } from 'express';

import { authMiddleware, roleMiddleware } from '../../middleware/auth.js';
import { userController } from '../../controllers/user.controller.js';

const router = Router();

router.use(authMiddleware);

router.get('/departments', userController.getDepartments);

const recruiterRoles = ['Recruiter', 'Admin'];
router.get('/', roleMiddleware(recruiterRoles), userController.getUsers);

const adminRoles = ['Admin'];
router.post('/', roleMiddleware(adminRoles), userController.createUser);
router.put('/:id', roleMiddleware(adminRoles), userController.updateUser);
router.post('/:id/reset-password', roleMiddleware(adminRoles), userController.resetPassword);

export default router;
