import type { Request, Response, NextFunction } from 'express';
import { statsService } from '../services/stats.service.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { HTTP_STATUS } from '../constants/httpStatus.js';

export class StatsController {
  /**
   * UC-15: Thống kê tuyển dụng cho Recruiter
   * GET /api/v1/stats/recruitment?timeFilter=all&jobFilter=all&deptFilter=all
   */
  async getRecruitmentStats(req: Request, res: Response, next: NextFunction) {
    try {
      const { timeFilter, jobFilter, deptFilter } = req.query;
      const stats = await statsService.getRecruitmentStats({
        timeFilter: timeFilter as string,
        jobFilter: jobFilter as string,
        deptFilter: deptFilter as string,
      });
      sendSuccess(res, stats, 'Recruitment stats retrieved successfully', HTTP_STATUS.OK);
    } catch (error) {
      next(error);
    }
  }

  /**
   * UC-16: Thống kê tổng hợp cho Director
   * GET /api/v1/stats/director?deptFilter=all
   */
  async getDirectorStats(req: Request, res: Response, next: NextFunction) {
    try {
      const { deptFilter } = req.query;
      const stats = await statsService.getDirectorStats({
        deptFilter: deptFilter as string,
      });
      sendSuccess(res, stats, 'Director stats retrieved successfully', HTTP_STATUS.OK);
    } catch (error) {
      next(error);
    }
  }
}

export const statsController = new StatsController();
