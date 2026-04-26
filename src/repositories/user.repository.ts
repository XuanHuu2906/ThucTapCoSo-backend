// src/repositories/user.repository.ts
import { prisma } from "../config/prisma.js";

// Type Role (Dùng cho request payload hoặc nghiệp vụ logic)
export type Role = "Admin" | "Director" | "HiringManager" | "Recruiter";

// Cập nhật cấu trúc SafeUser khớp 100% với Schema Prisma thực tế
export type SafeUser = {
  userId: number; // Sửa từ id (string) thành userId (number)
  email: string;
  fullName: string;
  role: string; // Prisma trả về string, ta định nghĩa là string để không bị lỗi Type
  status: string; // Sửa từ isActive (boolean) thành status (string)
  createdAt: Date;
};

// Cập nhật các trường cần lấy (bỏ id, isActive, updatedAt)
const safeUserSelect = {
  userId: true,
  email: true,
  fullName: true,
  role: true,
  status: true,
  createdAt: true,
};

/**
 * Tìm user theo email
 */
export const findByEmail = async (email: string) => {
  return prisma.user.findUnique({
    where: { email },
  });
};

/**
 * Tìm user theo ID (Đổi tham số id thành userId kiểu number)
 */
export const findById = async (userId: number): Promise<SafeUser | null> => {
  return prisma.user.findUnique({
    where: { userId }, // Khóa chính là userId
    select: safeUserSelect,
  });
};

/**
 * Tạo user mới
 */
export const create = async (data: {
  email: string;
  password: string;
  fullName: string;
  role: Role; // Nhận Role Enum từ lúc tạo
  status?: string;
}): Promise<SafeUser> => {
  return prisma.user.create({
    data,
    select: safeUserSelect,
  });
};

/**
 * Lấy tất cả user
 */
export const findAll = async (): Promise<SafeUser[]> => {
  return prisma.user.findMany({
    select: safeUserSelect,
    orderBy: {
      createdAt: "desc",
    },
  });
};
