import { Router } from 'express';

import { validate } from '../../middleware/validate.js';
import { authMiddleware, roleMiddleware } from '../../middleware/auth.js';
import { applicationController } from '../../controllers/application.controller.js';
import { submitApplicationSchema, updateApplicationStatusSchema } from '../../validators/application.validator.js';
import { uploadCV } from '../../middleware/upload.js';

const router = Router();

// Public route for Candidate to submit application
// We use uploadCV.single('cvFile') to handle file upload before validation
router.post(
  '/',
  uploadCV.single('cvFile'),
  validate(submitApplicationSchema),
  applicationController.submitApplication
);

// Protected routes (Recruiter, Admin)
const allowedRoles = ['Recruiter', 'Admin'];

router.get('/', authMiddleware, roleMiddleware(allowedRoles), applicationController.getApplications);
router.get('/:id', authMiddleware, roleMiddleware(allowedRoles), applicationController.getApplicationById);
router.patch(
  '/:id/status',
  authMiddleware,
  roleMiddleware(allowedRoles),
  validate(updateApplicationStatusSchema),
  applicationController.updateApplicationStatus
);

export default router;
