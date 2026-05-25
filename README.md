# Recruitment Management System - Backend API

Dự án Backend API cho hệ thống quản lý tuyển dụng (Recruitment Management System), được xây dựng với kiến trúc chuẩn, rõ ràng, hỗ trợ đầy đủ các tính năng như quản lý tin tuyển dụng, hồ sơ ứng viên, đặt lịch phỏng vấn và đánh giá.

## 🚀 Công nghệ sử dụng

- **Runtime:** Node.js
- **Framework:** Express.js v5
- **Ngôn ngữ:** TypeScript
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Xác thực:** JSON Web Token (JWT) & bcryptjs
- **Upload file:** Multer & Cloudinary
- **Validation:** Zod

## 📂 Cấu trúc thư mục (Layered Architecture)

Dự án áp dụng kiến trúc Layered Architecture (N-Tier) để dễ dàng bảo trì và mở rộng:

```text
src/
├── config/       # Các file cấu hình (database, cloudinary, multer...)
├── controllers/  # Xử lý request/response HTTP, gọi tới services
├── middlewares/  # Các middleware (auth, error handler, rate limit...)
├── models/       # Định nghĩa các types/interfaces bổ sung ngoài Prisma
├── routes/       # Định nghĩa các endpoint API
├── services/     # Chứa toàn bộ business logic (Xử lý nghiệp vụ)
├── repositories/ # Tương tác trực tiếp với Database (Prisma)
├── utils/        # Các hàm tiện ích dùng chung
└── server.ts     # Điểm khởi chạy của ứng dụng
```

## 🛠 Hướng dẫn cài đặt và chạy dự án

### 1. Cài đặt Dependencies

Mở terminal trong thư mục `ThucTapCoSo-backend` và chạy:

```bash
npm install
```

### 2. Cấu hình biến môi trường (.env)

Tạo file `.env` ở thư mục gốc (ngang hàng với `package.json`) dựa trên `.env.example` (nếu có) hoặc điền các thông tin sau:

```env
PORT=...
DATABASE_URL="sqlserver://<HOST>:<PORT>;database=<DB_NAME>;user=<USER>;password=<PASSWORD>;encrypt=true;trustServerCertificate=true"
JWT_SECRET=...
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

### 3. Khởi tạo Database (Prisma)

Đảm bảo SQL Server đang chạy, sau đó thực hiện các lệnh sau để tạo bảng và nạp dữ liệu mẫu (Seeding):

```bash
# Push schema vào database (hoặc dùng migrate dev)
npm run db:migrate

# Nạp dữ liệu mẫu vào database
npm run db:seed
```

### 4. Chạy dự án

**Môi trường Development (có Hot-Reload):**
```bash
npm run dev
```

**Mở công cụ quản lý Database (Prisma Studio):**
```bash
npm run db:studio
```

**Build và chạy môi trường Production:**
```bash
npm run build
npm start
```

## 📝 Quy trình phát triển (Workflow)

Khi muốn thêm 1 tính năng mới (ví dụ: `Job`), hãy tuân thủ luồng dữ liệu sau:
1. **Route (`routes/job.route.ts`)**: Nhận request từ client, chuyển đến Controller tương ứng.
2. **Controller (`controllers/job.controller.ts`)**: Xử lý `req`, `res`, gọi Service để lấy kết quả và trả về cho client.
3. **Service (`services/job.service.ts`)**: Xử lý toàn bộ logic nghiệp vụ (kiểm tra điều kiện, tính toán...). Không gọi trực tiếp Prisma ở đây mà gọi qua Repository.
4. **Repository (`repositories/job.repository.ts`)**: Chứa các hàm giao tiếp trực tiếp với Database thông qua Prisma Client.

## 📌 Các tính năng chính
- Xác thực và phân quyền (Director, Recruiter, HR, Interviewer, Candidate).
- Quản lý tin tuyển dụng (CRUD, phê duyệt).
- Quản lý hồ sơ ứng viên (Upload CV lên Cloudinary, đánh giá, duyệt/loại).
- Đặt lịch phỏng vấn (Tự động tránh trùng lịch, xử lý múi giờ).
- Quản lý phòng ban và nhân sự.
