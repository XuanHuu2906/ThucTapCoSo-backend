import type { Request, Response, NextFunction } from 'express';
import { userService } from '../services/user.service.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { HTTP_STATUS } from '../constants/httpStatus.js';

export class UserController {
  async getUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const { role, status } = req.query;
      const users = await userService.getUsers({
        role: role as string | undefined,
        status: status as string | undefined,
      });

      return sendSuccess(res, users, 'Users retrieved successfully', HTTP_STATUS.OK);
    } catch (error) {
      next(error);
    }
  }
}

export const userController = new UserController();
