// src/config/cors.ts – Cấu hình CORS theo môi trường

import type { CorsOptions } from 'cors';

const allowedOrigins: Record<string, string[]> = {
  development: ['http://localhost:5173', 'http://localhost:3000'],
  production: ['https://thuctapcoso-frontend.onrender.com', 'https://huunguyen.xyz'],
  test: ['http://localhost:5173'],
};

export const corsConfig: CorsOptions = {
  origin: (origin, callback) => {
    const env = process.env['NODE_ENV'] ?? 'development';
    const origins = allowedOrigins[env] ?? allowedOrigins['development']!;

    // Cho phép request không có origin (mobile apps, Postman, curl...)
    if (!origin || origins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`Origin ${origin} not allowed by CORS`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
