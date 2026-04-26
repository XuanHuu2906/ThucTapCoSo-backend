import { Router } from 'express';

import { validate } from '../../middleware/validate.js';
import { authMiddleware, roleMiddleware } from '../../middleware/auth.js';
import { authController } from '../../controllers/auth.controller.js';
import { loginSchema, registerSchema } from '../../validators/auth.validator.js';

const router = Router();

router.post('/register', authMiddleware, roleMiddleware(['Admin']), validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);
router.get('/me', authMiddleware, authController.getMe);

export default router;
