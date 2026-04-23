# Recruitment Management System - Backend

Dự án Backend cho Hệ thống Quản lý Tuyển dụng (Recruitment Management System) sử dụng Node.js, TypeScript và Prisma ORM.

## 🚀 Công nghệ sử dụng

- **Runtime**: Node.js (v18+)
- **Language**: TypeScript
- **Framework**: Express.js
- **ORM**: Prisma
- **Database**: SQL Server
- **Validation**: Zod
- **Authentication**: JWT & Bcryptjs

## 🛠️ Hướng dẫn cài đặt

Làm theo các bước sau để chạy dự án trên môi trường local của bạn:

### 1. Tải dự án và cài đặt thư viện
Mở terminal tại thư mục gốc của dự án và chạy:
```bash
npm install
```
*Lưu ý: Nếu gặp lỗi xung đột peer dependencies, hãy sử dụng:*
```bash
npm install --legacy-peer-deps
```

### 2. Cấu hình biến môi trường
Tạo file `.env` từ file mẫu:
```bash
cp .env.example .env
```
Sau đó, mở file `.env` và cập nhật đường dẫn kết nối Database của bạn:
```env
DATABASE_URL="sqlserver://localhost:1433;database=RecruitmentDB;user=sa;password=YOUR_PASSWORD;encrypt=true;trustServerCertificate=true"
```

### 3. Khởi tạo Database (Migration)
Chạy lệnh sau để tạo các bảng trong SQL Server dựa trên schema đã định nghĩa:
```bash
npm run db:migrate
```

### 4. Chạy dự án
Chế độ phát triển (Development):
```bash
npm run dev
```
Server sẽ mặc định chạy tại: `http://localhost:5000`

## 📜 Các lệnh (Scripts) hữu ích

| Lệnh | Mô tả |
| :--- | :--- |
| `npm run dev` | Chạy server ở chế độ development (tự động reload) |
| `npm run build` | Biên dịch TypeScript sang JavaScript |
| `npm start` | Chạy server từ mã nguồn đã biên dịch (Production) |
| `npm run db:migrate` | Đẩy thay đổi schema vào database |
| `npm run db:studio` | Mở giao diện quản lý database của Prisma |
| `npm run db:seed` | Chạy dữ liệu mẫu (nếu có) |

## 📁 Cấu trúc thư mục

- `src/server.ts`: Điểm khởi đầu của ứng dụng.
- `prisma/`: Chứa schema và các tệp migration.
- `src/controllers/`: Xử lý logic yêu cầu/phản hồi.
- `src/services/`: Xử lý nghiệp vụ (Business logic).
- `src/routes/`: Định nghĩa các endpoint API.
- `src/middlewares/`: Các hàm trung gian (Auth, Validation, Error handling).
- `src/config/`: Cấu hình các thư viện bên thứ ba.
