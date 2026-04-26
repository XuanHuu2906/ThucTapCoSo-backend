// src/validators/auth.validator.ts
import { z } from "zod";

// Danh sách role hợp lệ
export const ROLE_OPTIONS = [
  "Admin",
  "Director",
  "HiringManager",
  "Recruiter",
] as const;

/**
 * Schema validate khi Admin tạo tài khoản nhân sự mới
 */
export const registerSchema = z.object({
  email: z
    .string()
    .min(1, "Email là bắt buộc")
    .email("Email không đúng định dạng")
    .transform((val) => val.toLowerCase()),

  password: z
    .string()
    .min(1, "Mật khẩu là bắt buộc")
    .min(8, "Mật khẩu phải có ít nhất 8 ký tự")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Mật khẩu phải chứa chữ hoa, chữ thường và số",
    ),

  fullName: z
    .string()
    .min(1, "Họ tên là bắt buộc")
    .min(2, "Họ tên phải có ít nhất 2 ký tự")
    .max(100, "Họ tên không được quá 100 ký tự")
    .transform((val) => val.trim()),

  role: z.enum(ROLE_OPTIONS, {
    message:
      "Role không hợp lệ. Chỉ chấp nhận: Admin, Director, HiringManager, Recruiter",
  }),
});

/**
 * Schema validate khi đăng nhập
 */
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email là bắt buộc")
    .email("Email không đúng định dạng")
    .transform((val) => val.toLowerCase()),

  password: z.string().min(1, "Mật khẩu là bắt buộc"),
});
// Lấy dữ liệu người dùng gửi lên (req.body) đem so với schema.
// Export type
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
