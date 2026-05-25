import crypto from 'crypto';
import { userRepository } from '../repositories/user.repository.js';
import { AppError } from '../utils/appError.js';
import { HTTP_STATUS } from '../constants/httpStatus.js';
import { hashPassword } from '../utils/crypto.js';
import { authService } from './auth.service.js';
import { configService } from './config.service.js';
import { notificationEmitter } from '../events/notification.events.js';

type UserFilters = {
  role?: string;
  status?: string;
};

const ALLOWED_ROLES = ['Recruiter', 'HiringManager', 'Director', 'Admin'];

export class UserService {
  async getUsers(filters: UserFilters) {
    return userRepository.findAll(filters);
  }

  async getUserById(userId: number) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new AppError('User not found', HTTP_STATUS.NOT_FOUND);
    }
    return user;
  }

  async createUser(data: { email: string; fullName: string; role: string; department?: string; status?: string }) {
    if (!ALLOWED_ROLES.includes(data.role)) {
      throw new AppError(`Invalid role. Allowed roles: ${ALLOWED_ROLES.join(', ')}`, HTTP_STATUS.BAD_REQUEST);
    }

    const existingUser = await userRepository.findByEmail(data.email);
    if (existingUser) {
      throw new AppError('Email already in use', HTTP_STATUS.BAD_REQUEST);
    }

    // Generate a secure random password (they will reset it anyway, but it must be strong)
    const randomPassword = crypto.randomBytes(16).toString('hex');
    const hashedPassword = await hashPassword(randomPassword);

    const newUser = await userRepository.create({
      email: data.email,
      password: hashedPassword,
      fullName: data.fullName,
      role: data.role,
      department: data.department || null,
      status: data.status || 'Active',
    });

    // Trigger password reset email so they can set their own password
    await authService.forgotPassword(newUser.email);

    notificationEmitter.emit('user.created', { user: newUser });

    return newUser;
  }

  async updateUser(userId: number, requestUserId: number, data: { fullName?: string; role?: string; department?: string; status?: string }) {
    const user = await this.getUserById(userId);

    if (data.role && !ALLOWED_ROLES.includes(data.role)) {
      throw new AppError(`Invalid role. Allowed roles: ${ALLOWED_ROLES.join(', ')}`, HTTP_STATUS.BAD_REQUEST);
    }

    const newStatus = data.status || user.status;
    const isLocking = newStatus === 'Inactive' && user.status === 'Active';
    const newRole = data.role || user.role;
    const isDemotingAdmin = user.role === 'Admin' && newRole !== 'Admin';

    // Prevent Admin from locking/demoting their own account
    if (user.userId === requestUserId && (isLocking || isDemotingAdmin)) {
      throw new AppError('You cannot lock or demote your own account', HTTP_STATUS.FORBIDDEN);
    }

    // Prevent locking/demoting the last active Admin
    if (user.role === 'Admin' && user.status === 'Active' && (isLocking || isDemotingAdmin)) {
      const activeAdminsCount = await userRepository.countActiveAdmins();
      if (activeAdminsCount <= 1) {
        throw new AppError('Cannot lock or demote the last active Admin', HTTP_STATUS.FORBIDDEN);
      }
    }

    const updatedUser = await userRepository.update(userId, data);

    if (isLocking || (data.status === 'Active' && user.status === 'Inactive')) {
      notificationEmitter.emit('user.status_changed', { user: updatedUser, byAdminId: requestUserId });
    }

    return updatedUser;
  }

  async resetUserPassword(userId: number) {
    const user = await this.getUserById(userId);
    if (user.status !== 'Active') {
      throw new AppError('Cannot reset password for inactive user', HTTP_STATUS.BAD_REQUEST);
    }
    
    // Trigger reset email
    await authService.forgotPassword(user.email);
    return { message: 'Password reset link sent to user email' };
  }

  async getDepartments() {
    const departments = await configService.getConfig('DEPARTMENTS');
    return Array.isArray(departments) ? departments : [];
  }
}

export const userService = new UserService();
