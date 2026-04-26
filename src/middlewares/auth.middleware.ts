// src/middlewares/auth.middleware.ts
import { Response, NextFunction } from "express";
import { AuthRequest } from "../types/index.js";
import { verifyAccessToken } from "../utils/jwt.js";
import { sendError } from "../utils/response.js";

/**
 * Middleware xác thực - Kiểm tra Access Token trong header.
 * Nếu hợp lệ, gán thông tin user vào req.user để các middleware/controller tiếp theo dùng.
 */
export const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      sendError(res, "Không có token xác thực. Vui lòng đăng nhập", 401);
      return;
    }

    const token = authHeader.split(" ")[1];

    // Giải mã và xác thực token
    const decoded = verifyAccessToken(token);
    req.user = decoded;

    next();
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === "TokenExpiredError") {
        sendError(res, "Token đã hết hạn. Vui lòng đăng nhập lại", 401);
        return;
      }
      if (error.name === "JsonWebTokenError") {
        sendError(res, "Token không hợp lệ", 401);
        return;
      }
    }
    sendError(res, "Lỗi xác thực", 401);
  }
};
