# Recruitment Management System — Danh sách nhiệm vụ

> Cập nhật: 2026-04-21 | Project: ThucTapCoSo-frontend + Backend

---

## Giai đoạn 1: Backend — Nền tảng API ⚙️

### 1.1 Setup Project Backend
- [ ] Khởi tạo project Express + TypeScript
- [ ] Cấu hình Prisma ORM + SQL Server
- [ ] Cài đặt dependencies: `express`, `prisma`, `@prisma/client`, `jsonwebtoken`, `bcryptjs`, `cors`, `dotenv`, `zod`
- [ ] Cấu hình `tsconfig.json`, `nodemon`, scripts

### 1.2 Database Schema (Prisma)
- [ ] Model `User` — id, email, password, fullName, phone, role, avatar, createdAt, updatedAt
- [ ] Model `Job` — id, title, department, location, type, salaryRange, description, requirements, status, createdBy, createdAt, updatedAt
- [ ] Model `Candidate` — id, fullName, email, phone, resumeUrl, source, createdAt
- [ ] Model `Application` — id, candidateId, jobId, status, appliedAt, updatedAt
- [ ] Model `Interview` — id, applicationId, scheduledAt, location, type, interviewerIds, status, feedback, result
- [ ] Model `Offer` — id, applicationId, proposedSalary, startDate, status, approvedBy, createdAt
- [ ] Model `Probationer` — id, userId, candidateId, offerId, jobId, jobTitle, department, startDate, endDate, supervisorId, status
- [ ] Model `ProbationEvaluation` — id, probationerId, evaluatedBy, kpiScore, comment, recommendation, directorDecision, directorComment
- [ ] Tạo migration và seed data mẫu

### 1.3 Auth Module
- [ ] POST `/api/auth/register` — Đăng ký tài khoản
- [ ] POST `/api/auth/login` — Đăng nhập, trả JWT token
- [ ] GET `/api/auth/me` — Lấy thông tin user hiện tại (verify token)
- [ ] Middleware `authMiddleware` — Xác thực JWT từ header
- [ ] Middleware `roleMiddleware(roles[])` — Kiểm tra quyền role
- [ ] Hash password bằng bcryptjs

### 1.4 Job API (CRUD)
- [ ] GET `/api/jobs` — Danh sách việc làm (public + filter)
- [ ] GET `/api/jobs/:id` — Chi tiết việc làm
- [ ] POST `/api/jobs` — Tạo tin tuyển dụng (recruiter)
- [ ] PUT `/api/jobs/:id` — Cập nhật tin tuyển dụng (recruiter)
- [ ] DELETE `/api/jobs/:id` — Xóa tin tuyển dụng (recruiter)
- [ ] PATCH `/api/jobs/:id/status` — Đổi trạng thái (open/closed/draft)

### 1.5 Candidate & Application API
- [ ] GET `/api/candidates` — Danh sách ứng viên (recruiter)
- [ ] GET `/api/candidates/:id` — Chi tiết ứng viên
- [ ] POST `/api/applications` — Ứng tuyển (candidate)
- [ ] GET `/api/applications` — Danh sách đơn ứng tuyển (filter by job, status)
- [ ] PATCH `/api/applications/:id/status` — Cập nhật trạng thái đơn (screening → interview → offer → hired / rejected)

### 1.6 Interview API
- [ ] POST `/api/interviews` — Lên lịch phỏng vấn (recruiter)
- [ ] GET `/api/interviews` — Danh sách lịch phỏng vấn (filter by manager)
- [ ] GET `/api/interviews/:id` — Chi tiết phỏng vấn
- [ ] PUT `/api/interviews/:id` — Cập nhật thông tin phỏng vấn
- [ ] PATCH `/api/interviews/:id/result` — Ghi kết quả phỏng vấn (manager)

### 1.7 Offer API
- [ ] POST `/api/offers` — Tạo đề xuất offer (recruiter)
- [ ] GET `/api/offers` — Danh sách offer (filter by status)
- [ ] PATCH `/api/offers/:id/approve` — Phê duyệt offer (director)
- [ ] PATCH `/api/offers/:id/reject` — Từ chối offer (director)

### 1.8 Probation API
- [ ] GET `/api/probationers` — Danh sách nhân viên thử việc
- [ ] GET `/api/probationers/:id` — Chi tiết thử việc
- [ ] POST `/api/probation-evaluations` — Nộp đánh giá thử việc (manager)
- [ ] PATCH `/api/probation-evaluations/:id/review` — Phê duyệt đánh giá (director)
- [ ] GET `/api/probationers/me` — Thông tin thử việc của chính mình (probationer)

---

## Giai đoạn 2: Frontend — Kết nối Backend 🔗

### 2.1 Services Layer (API Client)
- [ ] `services/api.ts` — Axios instance + base URL + interceptor gắn JWT token
- [ ] `services/auth.service.ts` — login(), register(), getMe(), logout()
- [ ] `services/job.service.ts` — getJobs(), getJobById(), createJob(), updateJob(), deleteJob()
- [ ] `services/candidate.service.ts` — getCandidates(), getCandidateById()
- [ ] `services/application.service.ts` — apply(), getApplications(), updateStatus()
- [ ] `services/interview.service.ts` — scheduleInterview(), getInterviews(), submitResult()
- [ ] `services/offer.service.ts` — createOffer(), getOffers(), approveOffer(), rejectOffer()
- [ ] `services/probation.service.ts` — getProbationers(), submitEvaluation(), reviewEvaluation(), getMyProbation()

### 2.2 Auth Context & Protected Route
- [ ] `context/AuthContext.tsx` — Quản lý state: user, token, isAuthenticated, login(), logout()
- [ ] `hooks/useAuth.ts` — Hook tiện ích truy cập AuthContext
- [ ] `routes/ProtectedRoute.tsx` — Auth guard: redirect `/login` nếu chưa đăng nhập, kiểm tra role
- [ ] Cập nhật `App.tsx` — Wrap routes với ProtectedRoute theo role

### 2.3 Routes Configuration
- [ ] `routes/routes.config.ts` — Route path constants (tránh hardcode string)
- [ ] `routes/index.tsx` — Route definitions tập trung (refactor từ App.tsx)

### 2.4 Hooks & Utilities
- [ ] `hooks/useMediaQuery.ts` — Responsive breakpoint hook
- [ ] `lib/constants.ts` — App name, API URL, role labels, status labels

---

## Giai đoạn 3: Kết nối Data thực vào Pages 📊

### 3.1 Public Pages
- [ ] `HomePage` — Hiển thị danh sách jobs từ API
- [ ] `Jobs/JobDetail` — Lấy chi tiết job từ API
- [ ] `Login` — Gọi auth.service.login(), lưu token, redirect theo role

### 3.2 Recruiter Pages
- [ ] `recruiter/Dashboard` — Replace mock data bằng API stats thực
- [ ] `recruiter/Jobs` — CRUD jobs qua job.service
- [ ] `recruiter/Candidates` — Fetch candidates + applications từ API
- [ ] `recruiter/Probation` — Fetch probationers từ API
- [ ] `recruiter/Reports` — Fetch dữ liệu thống kê từ API

### 3.3 Manager Pages
- [ ] `manager/Dashboard` — Stats từ API (interviews, reviews pending)
- [ ] `manager/Interviews` — Fetch + cập nhật kết quả phỏng vấn
- [ ] `manager/Reviews` — Fetch ứng viên cần review

### 3.4 Director Pages
- [ ] `director/Dashboard` — Stats tổng quan từ API
- [ ] `director/Approvals` — Fetch offers + probation evaluations chờ duyệt
- [ ] `director/Reports` — Fetch dữ liệu báo cáo từ API

### 3.5 Probationer Pages
- [ ] `probationer/Dashboard` — Fetch thông tin thử việc cá nhân từ API

---

## Giai đoạn 4: Candidate Pages (Chưa có UI) 🎨

- [ ] `candidate/Dashboard` — Trang chủ ứng viên (đã login): danh sách đơn đã nộp, trạng thái
- [ ] `candidate/Applications` — Lịch sử ứng tuyển, theo dõi tiến trình
- [ ] `candidate/Profile` — Cập nhật thông tin cá nhân, CV

---

## Giai đoạn 5: Polish & Testing ✨

- [ ] Responsive testing trên mobile/tablet
- [ ] Dark mode testing toàn bộ pages
- [ ] Error handling: hiển thị toast khi API lỗi (sonner)
- [ ] Loading states: skeleton/spinner khi fetch data
- [ ] Form validation: react-hook-form + zod
- [ ] Pagination cho danh sách dài (jobs, candidates, applications)
- [ ] Upload CV (file upload API)

---

## Tóm tắt tiến độ

| Giai đoạn | Trạng thái | Ước lượng |
|---|---|---|
| **GĐ1: Backend** | ❌ Chưa bắt đầu | 3-5 ngày |
| **GĐ2: Frontend kết nối** | ❌ Chưa bắt đầu | 2-3 ngày |
| **GĐ3: Kết nối data thực** | ❌ Chưa bắt đầu | 3-4 ngày |
| **GĐ4: Candidate pages** | ❌ Chưa bắt đầu | 1-2 ngày |
| **GĐ5: Polish** | ❌ Chưa bắt đầu | 2-3 ngày |
| **Tổng ước lượng** | | **~11-17 ngày** |

> [!TIP]
> Ưu tiên: GĐ1 → GĐ2 → GĐ3 → GĐ4 → GĐ5. Nếu thiếu thời gian, GĐ4 và GĐ5 có thể làm sau.
