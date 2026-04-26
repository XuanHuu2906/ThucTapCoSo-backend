// src/middlewares/role.middleware.ts
import { Response, NextFunction } from "express";
import { AuthRequest } from "../types/index.js";
import { Role } from "../repositories/user.repository.js";
import { sendError } from "../utils/response.js";

export const roleMiddleware = (allowedRoles: Role[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      sendError(res, "Chưa xác thực người dùng", 401);
      return;
    }

    const userRole = req.user.role;

    if (!allowedRoles.includes(userRole as Role)) {
      sendError(
        res,
        `Bạn không có quyền thực hiện hành động này. Yêu cầu quyền: ${allowedRoles.join(", ")}`,
        403,
      );
      return;
    }

    next();
  };
};
