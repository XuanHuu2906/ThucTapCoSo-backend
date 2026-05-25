import { Router } from 'express';

import { validate } from '../../middleware/validate.js';
import { authMiddleware, roleMiddleware } from '../../middleware/auth.js';
import { probationController } from '../../controllers/probation.controller.js';
import {
  createProbationSchema,
  updateProbationSchema,
  evaluateProbationSchema,
  approveEvaluationSchema,
} from '../../validators/probation.validator.js';

const router = Router();

// All probation routes require authentication
router.use(authMiddleware);

// Get lists and details
router.get('/ending-soon', probationController.getEndingSoon);
router.get('/', probationController.getProbations);
router.get('/:id', probationController.getProbationById);

// Recruiter/Admin only routes for creating and updating probation
const recruiterRoles = ['Recruiter', 'Admin'];
router.post('/', roleMiddleware(recruiterRoles), validate(createProbationSchema), probationController.createProbation);
router.put('/:id', roleMiddleware(recruiterRoles), validate(updateProbationSchema), probationController.updateProbation);

// Supervisor evaluates (Roles: HiringManager, Director, Admin, Recruiter)
const supervisorRoles = ['HiringManager', 'Director', 'Recruiter', 'Admin'];
router.put('/:id/evaluate', roleMiddleware(supervisorRoles), validate(evaluateProbationSchema), probationController.evaluateProbation);

// Director/Admin/HiringManager approves evaluation
const approverRoles = ['Director', 'Admin', 'HiringManager'];
router.patch('/:id/approve', roleMiddleware(approverRoles), validate(approveEvaluationSchema), probationController.approveEvaluation);

export default router;
