import jwt from 'jsonwebtoken';
import { userRepository } from '../repositories/user.repository.js';
import { hashPassword, comparePassword, generateAccessToken, generateRefreshToken } from '../utils/crypto.js';
import { AppError } from '../utils/appError.js';
import { HTTP_STATUS } from '../constants/httpStatus.js';
import { emailService } from './email.service.js';
import { env } from '../config/env.js';

export class AuthService {
  async register(data: any) {
    const existingUser = await userRepository.findByEmail(data.email);
    if (existingUser) {
      throw new AppError('Email already in use', HTTP_STATUS.BAD_REQUEST);
    }

    const hashedPassword = await hashPassword(data.password);

    const newUser = await userRepository.create({
      email: data.email,
      password: hashedPassword,
      fullName: data.fullName,
      role: data.role, // Set role from request (Admin only route)
      status: 'Active',
    });

    return newUser;
  }

  async login(data: any) {
    const user = await userRepository.findByEmail(data.email);
    if (!user) {
      throw new AppError('Invalid email or password', HTTP_STATUS.UNAUTHORIZED);
    }

    const isMatch = await comparePassword(data.password, user.password);
    if (!isMatch) {
      throw new AppError('Invalid email or password', HTTP_STATUS.UNAUTHORIZED);
    }

    if (user.status !== 'Active') {
      throw new AppError('Account is inactive', HTTP_STATUS.FORBIDDEN);
    }

    const payload = {
      userId: user.userId.toString(),
      email: user.email,
      role: user.role,
    };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    // Remove password from user object before returning
    const { password, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      accessToken,
      refreshToken,
    };
  }

  async getMe(userId: string | number) {
    const parsedId = Number(userId);
    const user = await userRepository.findById(parsedId);
    if (!user) {
      throw new AppError('User not found', HTTP_STATUS.NOT_FOUND);
    }
    return user;
  }

  /**
   * REQ-003: Quên mật khẩu - gửi email reset link
   */
  async forgotPassword(email: string) {
    const user = await userRepository.findByEmail(email);

    // Không tiết lộ email có tồn tại hay không (bảo mật)
    if (!user) {
      return { message: 'Nếu email tồn tại, bạn sẽ nhận được link đặt lại mật khẩu.' };
    }

    // Tạo JWT reset token (hết hạn sau 15 phút)
    const resetToken = jwt.sign(
      { email: user.email, type: 'password_reset' },
      env.JWT_SECRET,
      { expiresIn: '15m' },
    );

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;

    await emailService.sendPasswordReset(email, user.fullName, resetUrl);

    return { message: 'Nếu email tồn tại, bạn sẽ nhận được link đặt lại mật khẩu.' };
  }

  /**
   * REQ-003: Đặt lại mật khẩu với token
   */
  async resetPassword(token: string, newPassword: string) {
    // Verify JWT token
    let payload: { email: string; type: string };
    try {
      payload = jwt.verify(token, env.JWT_SECRET) as { email: string; type: string };
    } catch {
      throw new AppError('Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn', HTTP_STATUS.BAD_REQUEST);
    }

    if (payload.type !== 'password_reset') {
      throw new AppError('Token không hợp lệ', HTTP_STATUS.BAD_REQUEST);
    }

    // Find user and update password
    const user = await userRepository.findByEmail(payload.email);
    if (!user) {
      throw new AppError('Người dùng không tồn tại', HTTP_STATUS.NOT_FOUND);
    }

    const hashedPassword = await hashPassword(newPassword);
    await userRepository.updatePassword(user.userId, hashedPassword);

    return { message: 'Mật khẩu đã được đặt lại thành công.' };
  }
}

export const authService = new AuthService();
