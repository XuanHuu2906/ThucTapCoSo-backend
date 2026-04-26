import { Router } from "express";
import jobRoutes from "./v1/job.routes";

const router = Router();

router.use("/api/v1/jobs", jobRoutes);

export default router;