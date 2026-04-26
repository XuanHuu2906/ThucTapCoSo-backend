import { Router } from 'express';

import { validate } from '../../middleware/validate.js';
import { authMiddleware, roleMiddleware } from '../../middleware/auth.js';
import { jobController } from '../../controllers/job.controller.js';
import { createJobSchema, updateJobSchema, updateJobStatusSchema } from '../../validators/job.validator.js';

const router = Router();

// Public routes
router.get('/', jobController.getJobs);
router.get('/:id', jobController.getJobById);

// Protected routes (Recruiter, Admin)
const allowedRoles = ['Recruiter', 'Admin'];

router.post('/', authMiddleware, roleMiddleware(allowedRoles), validate(createJobSchema), jobController.createJob);
router.put('/:id', authMiddleware, roleMiddleware(allowedRoles), validate(updateJobSchema), jobController.updateJob);
router.delete('/:id', authMiddleware, roleMiddleware(allowedRoles), jobController.deleteJob);
router.patch('/:id/status', authMiddleware, roleMiddleware(allowedRoles), validate(updateJobStatusSchema), jobController.updateJobStatus);

export default router;
