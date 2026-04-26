import { Request, Response, NextFunction } from "express";
import { jobService } from "../services/job.service";

type AuthUser = {
  id: number | string;
  role: string;
};

const getJobs = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const jobs = await jobService.getJobs(req.query as Record<string, unknown>);

    res.status(200).json({
      message: "Lấy danh sách tin tuyển dụng thành công",
      data: jobs,
    });
  } catch (error) {
    next(error);
  }
};

const getJobById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const job = await jobService.getJobById(req.params.id);

    res.status(200).json({
      message: "Lấy chi tiết tin tuyển dụng thành công",
      data: job,
    });
  } catch (error) {
    next(error);
  }
};

const createJob = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as AuthUser;

    const job = await jobService.createJob(Number(user.id), req.body);

    res.status(201).json({
      message: "Tạo tin tuyển dụng thành công",
      data: job,
    });
  } catch (error) {
    next(error);
  }
};

const updateJob = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as AuthUser;

    const job = await jobService.updateJob(
      Number(user.id),
      user.role,
      req.params.id,
      req.body
    );

    res.status(200).json({
      message: "Cập nhật tin tuyển dụng thành công",
      data: job,
    });
  } catch (error) {
    next(error);
  }
};

const updateJobStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const job = await jobService.updateJobStatus(
      req.params.id,
      req.body.status
    );

    res.status(200).json({
      message: "Cập nhật trạng thái tin tuyển dụng thành công",
      data: job,
    });
  } catch (error) {
    next(error);
  }
};

const deleteJob = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const deletedJob = await jobService.deleteJob(req.params.id);

    res.status(200).json({
      message: "Xóa tin tuyển dụng thành công",
      data: deletedJob,
    });
  } catch (error) {
    next(error);
  }
};

export const jobController = {
  getJobs,
  getJobById,
  createJob,
  updateJob,
  updateJobStatus,
  deleteJob,
};