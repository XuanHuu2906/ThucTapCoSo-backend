import { Router } from "express";
import { jobController } from "../../controllers/job.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { roleMiddleware } from "../../middlewares/role.middleware";
import { validate } from "../../middlewares/validate.middleware";
import {
  createJobSchema,
  updateJobSchema,
  updateJobStatusSchema,
} from "../../validators/job.validator";

const router = Router();

// Public routes
router.get("/", jobController.getJobs);
router.get("/:id", jobController.getJobById);

// Protected routes
router.post(
  "/",
  authMiddleware,
  roleMiddleware(["Recruiter", "Admin"]),
  validate(createJobSchema),
  jobController.createJob
);

router.put(
  "/:id",
  authMiddleware,
  roleMiddleware(["Recruiter", "Admin"]),
  validate(updateJobSchema),
  jobController.updateJob
);

router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware(["Recruiter", "Admin"]),
  jobController.deleteJob
);

router.patch(
  "/:id/status",
  authMiddleware,
  roleMiddleware(["Recruiter", "Admin"]),
  validate(updateJobStatusSchema),
  jobController.updateJobStatus
);

export default router;