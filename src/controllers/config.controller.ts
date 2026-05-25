import type { Request, Response, NextFunction } from 'express';
import { configService } from '../services/config.service.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { HTTP_STATUS } from '../constants/httpStatus.js';

export class ConfigController {
  async getConfigs(req: Request, res: Response, next: NextFunction) {
    try {
      const configs = await configService.getConfigs();
      return sendSuccess(res, configs, 'Configs retrieved successfully', HTTP_STATUS.OK);
    } catch (error) {
      next(error);
    }
  }

  async updateConfigs(req: Request, res: Response, next: NextFunction) {
    try {
      // @ts-ignore
      const requestUserId = Number(req.user.id);
      const { configs } = req.body;
      
      const updated = await configService.updateConfigs(configs, requestUserId);
      return sendSuccess(res, updated, 'Configs updated successfully', HTTP_STATUS.OK);
    } catch (error) {
      next(error);
    }
  }
}

export const configController = new ConfigController();
