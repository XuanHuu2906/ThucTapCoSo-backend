import { Request } from "express";

export interface AuthUser {
  id: number;
  email: string;
  role: string;
}

export interface AuthRequest extends Request {
  user?: AuthUser;
}
