import type { NextFunction, Request, Response } from 'express';
import multer from 'multer';
import { AppError } from '../utils/appError.js';
import { HTTP_STATUS } from '../constants/httpStatus.js';
import { ERROR_MESSAGES } from '../constants/messages.js';

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  console.error('[Error]:', err);

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }
  if (err instanceof multer.MulterError) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: `File upload error: ${err.message}`,
    });
  }

  // Handle default or unexpected errors
  res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
    success: false,
    message: ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
    ...(process.env['NODE_ENV'] === 'development' && { stack: err.stack }),
  });
};
