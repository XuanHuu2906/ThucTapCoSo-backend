import type { Request, Response, NextFunction } from 'express';
import { userService } from '../services/user.service.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { HTTP_STATUS } from '../constants/httpStatus.js';

export class UserController {
  getDepartments = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const departments = await userService.getDepartments();
      return sendSuccess(res, departments, 'Departments retrieved successfully', HTTP_STATUS.OK);
    } catch (error) {
      next(error);
    }
  };

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

  async createUser(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await userService.createUser(req.body);
      return sendSuccess(res, user, 'User created successfully', HTTP_STATUS.CREATED);
    } catch (error) {
      next(error);
    }
  }

  async updateUser(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = Number(req.params.id);
      // @ts-ignore
      const requestUserId = Number(req.user.id);
      const user = await userService.updateUser(userId, requestUserId, req.body);
      return sendSuccess(res, user, 'User updated successfully', HTTP_STATUS.OK);
    } catch (error) {
      next(error);
    }
  }

  async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = Number(req.params.id);
      const result = await userService.resetUserPassword(userId);
      return sendSuccess(res, result, 'Password reset initiated', HTTP_STATUS.OK);
    } catch (error) {
      next(error);
    }
  }
}

export const userController = new UserController();
