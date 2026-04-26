import { userRepository } from '../repositories/user.repository.js';
import { hashPassword, comparePassword, generateAccessToken, generateRefreshToken } from '../utils/crypto.js';
import { AppError } from '../utils/appError.js';
import { HTTP_STATUS } from '../constants/httpStatus.js';

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
}

export const authService = new AuthService();
