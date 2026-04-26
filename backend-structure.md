# Cấu trúc Backend chuẩn Production

```
ThucTapCoSo-backend/
│
├── prisma/
│   ├── schema.prisma              # Định nghĩa toàn bộ models
│   ├── seed.ts                    # Seed data cho dev/staging
│   └── migrations/                # Auto-generated bởi prisma migrate
│
├── src/
│   │
│   ├── app.ts                     # Khởi tạo Express, đăng ký middlewares & routes
│   ├── server.ts                  # Chỉ gọi app.listen() – tách để dễ test
│   │
│   ├── config/
│   │   ├── prisma.ts              # Prisma client singleton
│   │   ├── env.ts                 # Parse & validate process.env bằng Zod khi start
│   │   ├── cors.ts                # Cấu hình CORS theo môi trường
│   │   └── swagger.ts             # Swagger/OpenAPI setup
│   │
│   ├── routes/
│   │   ├── index.ts               # Barrel – mount tất cả router vào app
│   │   └── v1/                    # Versioning API
│   │       ├── auth.routes.ts
│   │       ├── user.routes.ts
│   │       └── ...
│   │
│   ├── middleware/
│   │   ├── auth.ts                # Xác thực JWT, gắn req.user
│   │   ├── validate.ts            # Chạy Zod schema, trả lỗi 400 nếu sai
│   │   ├── errorHandler.ts        # Global error handler – bắt mọi lỗi chưa xử lý
│   │   └── rateLimiter.ts         # Giới hạn request/IP
│   │
│   ├── controllers/
│   │   ├── auth.controller.ts     # Nhận req → gọi service → trả res
│   │   ├── user.controller.ts     # Không chứa business logic
│   │   └── ...
│   │
│   ├── services/
│   │   ├── auth.service.ts        # Business logic thuần – không biết req/res
│   │   ├── user.service.ts        # Gọi repository để lấy/ghi dữ liệu
│   │   └── ...
│   │
│   ├── repositories/              # ⭐ Lớp truy cập DB – chỉ làm việc với Prisma
│   │   ├── user.repository.ts     # Đổi ORM chỉ cần sửa lớp này
│   │   └── ...
│   │
│   ├── validators/
│   │   ├── auth.validator.ts      # Zod schemas cho auth (login, register...)
│   │   ├── user.validator.ts      # Zod schemas cho user
│   │   └── ...
│   │
│   ├── types/
│   │   ├── express.d.ts           # Extend Request: thêm user, role, ...
│   │   ├── env.d.ts               # Type cho process.env
│   │   └── dto/                   # Data Transfer Objects (shape API input/output)
│   │       ├── auth.dto.ts
│   │       └── user.dto.ts
│   │
│   ├── constants/
│   │   ├── httpStatus.ts          # HTTP_STATUS.OK = 200, ...
│   │   └── messages.ts            # ERROR.USER_NOT_FOUND, SUCCESS.CREATED, ...
│   │
│   └── utils/
│       ├── apiResponse.ts         # Format response chuẩn { success, data, message }
│       ├── logger.ts              # Winston/Pino logger
│       └── crypto.ts              # Hash, token helpers
│
├── tests/
│   ├── unit/                      # Test service/utils – không cần DB
│   │   └── auth.service.test.ts
│   ├── integration/               # Test controller + DB thật (DB test riêng)
│   │   └── auth.routes.test.ts
│   ├── e2e/                       # Test full HTTP request
│   │   └── auth.e2e.test.ts
│   └── helpers/
│       └── testDb.ts              # Setup/teardown DB cho test
│
├── .github/
│   └── workflows/
│       ├── ci.yml                 # Chạy lint + test khi push/PR
│       └── deploy.yml             # Deploy lên server khi merge main
│
├── .env                           # ❌ KHÔNG commit – chứa secrets thật
├── .env.example                   # ✅ Commit – template cho người mới clone
├── .env.test                      # Biến môi trường riêng cho test
│
├── Dockerfile
├── docker-compose.yml             # Production / CI
├── docker-compose.dev.yml         # Dev local (hot-reload, expose DB port)
│
├── package.json
├── tsconfig.json
├── .eslintrc.js
├── .prettierrc
└── .gitignore
```

---

## Request Flow

```
HTTP Request
    │
    ▼
Route (routes/v1/)
    │
    ▼
Middleware (auth.ts → validate.ts)
    │
    ▼
Controller          ← chỉ xử lý req/res
    │
    ▼
Service             ← business logic thuần
    │
    ▼
Repository          ← truy vấn DB qua Prisma
    │
    ▼
Database (PostgreSQL / MySQL / ...)
```

---

## Phân chia trách nhiệm

| Lớp | Trách nhiệm | KHÔNG làm |
|---|---|---|
| **Route** | Khai báo path, method, middleware | Logic gì cả |
| **Middleware** | Auth, validate input, rate limit | Business logic |
| **Controller** | Nhận req, gọi service, trả res | Truy vấn DB trực tiếp |
| **Service** | Business logic, orchestration | Biết về req/res/Prisma |
| **Repository** | CRUD qua Prisma | Business logic |
| **Validator** | Định nghĩa schema Zod | Xử lý request |

---

## Những file quan trọng nhất

### `src/app.ts` – Express setup
```typescript
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { corsConfig } from './config/cors';
import { errorHandler } from './middleware/errorHandler';
import routes from './routes';

const app = express();

app.use(helmet());
app.use(cors(corsConfig));
app.use(express.json());

app.use('/api', routes);
app.use(errorHandler);   // Luôn đặt cuối cùng

export default app;
```

### `src/server.ts` – Entry point
```typescript
import app from './app';
import { env } from './config/env';

app.listen(env.PORT, () => {
  console.log(`Server running on port ${env.PORT}`);
});
```

### `src/config/env.ts` – Validate env khi start
```typescript
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']),
  PORT: z.coerce.number().default(3000),
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default('7d'),
});

export const env = envSchema.parse(process.env);
// App sẽ crash ngay khi start nếu thiếu biến – fail fast, fail loud
```

### `src/middleware/validate.ts` – Validate middleware
```typescript
import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';

export const validate = (schema: AnyZodObject) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (e) {
      if (e instanceof ZodError) {
        res.status(400).json({ success: false, errors: e.errors });
      } else {
        next(e);
      }
    }
  };
```

### `src/middleware/errorHandler.ts` – Global error handler
```typescript
import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';
import logger from '../utils/logger';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  logger.error(err);

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  res.status(500).json({
    success: false,
    message: 'Internal server error',
  });
};
```

### `src/utils/apiResponse.ts` – Chuẩn hóa response
```typescript
import { Response } from 'express';

export const sendSuccess = <T>(
  res: Response,
  data: T,
  message = 'Success',
  statusCode = 200
) => res.status(statusCode).json({ success: true, message, data });

export const sendError = (
  res: Response,
  message: string,
  statusCode = 400
) => res.status(statusCode).json({ success: false, message });
```

---

## `.env.example`

```env
# App
NODE_ENV=development
PORT=3000

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/dbname

# JWT
JWT_SECRET=your-super-secret-key-min-32-chars
JWT_EXPIRES_IN=7d

# Redis (nếu dùng)
REDIS_URL=redis://localhost:6379
```

---

## Scripts trong `package.json`

```json
{
  "scripts": {
    "dev": "ts-node-dev --respawn src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "lint": "eslint src --ext .ts",
    "format": "prettier --write src",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "db:migrate": "prisma migrate dev",
    "db:seed": "ts-node prisma/seed.ts",
    "db:studio": "prisma studio"
  }
}
```
