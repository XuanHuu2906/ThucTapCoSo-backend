// src/controllers/auth.controller.ts
import { Response } from "express";
import { AuthRequest } from "../types/index.js";
import * as authService from "../services/auth.service.js";
import { sendSuccess, sendError } from "../utils/response.js";
import { RegisterInput, LoginInput } from "../validators/auth.validator.js";

/**
 * POST /api/v1/auth/register
 * Chỉ Admin mới truy cập được (được bảo vệ bởi authMiddleware + roleMiddleware)
 */
export const register = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const input = req.body as RegisterInput;
    const newUser = await authService.register(input);

    sendSuccess(
      res,
      newUser,
      `Tạo tài khoản thành công cho ${newUser.fullName} với quyền ${newUser.role}`,
      201,
    );
  } catch (error) {
    if (error instanceof Error) {
      // Email trùng hoặc lỗi nghiệp vụ
      sendError(res, error.message, 400);
      return;
    }
    sendError(res, "Lỗi hệ thống khi tạo tài khoản", 500);
  }
};

/**
 * POST /api/v1/auth/login
 * Route công khai - không cần token
 */
export const login = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const input = req.body as LoginInput;
    const result = await authService.login(input);

    sendSuccess(res, result, "Đăng nhập thành công");
  } catch (error) {
    if (error instanceof Error) {
      sendError(res, error.message, 401);
      return;
    }
    sendError(res, "Lỗi hệ thống khi đăng nhập", 500);
  }
};

/**
 * GET /api/v1/auth/me
 * Lấy thông tin người dùng đang đăng nhập (cần token hợp lệ)
 */
export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, "Không tìm thấy thông tin người dùng", 401);
      return;
    }

    const user = await authService.getMe(req.user.id);
    sendSuccess(res, user, "Lấy thông tin người dùng thành công");
  } catch (error) {
    if (error instanceof Error) {
      sendError(res, error.message, 404);
      return;
    }
    sendError(res, "Lỗi hệ thống", 500);
  }
};
