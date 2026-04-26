import * as userRepository from "../repositories/user.repository.js";
import { hashPassword, comparePassword } from "../utils/crypto.js";
import { generateAccessToken, generateRefreshToken } from "../utils/jwt.js";
import { RegisterInput, LoginInput } from "../validators/auth.validator.js";

// Register
export const register = async (input: RegisterInput) => {
  const { email, password, fullName, role } = input;

  const existingUser = await userRepository.findByEmail(email);

  if (existingUser) {
    throw new Error("Email đã được sử dụng");
  }

  const hashedPassword = await hashPassword(password);

  const newUser = await userRepository.create({
    email,
    password: hashedPassword,
    fullName,
    role,
    status: "Active",
  });

  return newUser;
};

// Login
export const login = async (input: LoginInput) => {
  const { email, password } = input;

  const user = await userRepository.findByEmail(email);

  if (!user) {
    throw new Error("Email hoặc mật khẩu không đúng");
  }

  // Kiểm tra trạng thái tài khoản
  if (user.status !== "Active") {
    throw new Error("Tài khoản đã bị khóa");
  }

  const isPasswordValid = await comparePassword(password, user.password);

  if (!isPasswordValid) {
    throw new Error("Email hoặc mật khẩu không đúng");
  }

  const tokenPayload = {
    id: user.userId,
    email: user.email,
    role: user.role,
  };

  const accessToken = generateAccessToken(tokenPayload);
  const refreshToken = generateRefreshToken(tokenPayload);

  return {
    accessToken,
    refreshToken,
    user: {
      id: user.userId,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      status: user.status,
    },
  };
};

// Get Me
export const getMe = async (userId: number) => {
  const user = await userRepository.findById(userId);

  if (!user) {
    throw new Error("Không tìm thấy người dùng");
  }

  return user;
};
