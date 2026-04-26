# THIẾT KẾ CƠ SỞ DỮ LIỆU
## Hệ thống Quản lý Tuyển dụng & Thử việc

> Căn cứ: `Project_Introduction.docx`, `User.docx`, `Use_case_modeling.docx`, `functional_requirement.docx`

---

## I. TỔNG QUAN

| # | Bảng | Căn cứ |
|---|---|---|
| 1 | **User** | User.docx — 5 vai trò nội bộ |
| 2 | **Candidate** | UC-03, REQ-006 — ứng viên bên ngoài |
| 3 | **JobPosting** | UC-02, REQ-004/005 — tin tuyển dụng |
| 4 | **Application** | UC-03/04, REQ-006→010 — hồ sơ ứng tuyển |
| 5 | **Interview** | UC-05/06/07, REQ-011→014 — lịch phỏng vấn |
| 6 | **Offer** | UC-08/09/10, REQ-015→019 — đề xuất việc làm |
| 7 | **Probation** | UC-11/12/13/14, REQ-020→025 — giai đoạn thử việc |
| 8 | **ProbationEvaluation** | UC-13/14, REQ-023/024 — phiếu đánh giá thử việc |

> **Không có bảng Department** — Không có UC/REQ nào quản lý phòng ban như entity độc lập. "Phòng ban" chỉ là nhãn lọc (REQ-020, REQ-028) → lưu dạng chuỗi `DeptName` trong `JobPosting`.

---

## II. CHI TIẾT CÁC BẢNG

### 1. Bảng `User`
> Căn cứ: User.docx, REQ-002, REQ-019

| Cột | Kiểu | Ràng buộc | Khóa | Mô tả |
|---|---|---|---|---|
| UserID | INT | AUTO_INCREMENT | PK | Khóa chính |
| FullName | NVARCHAR(100) | NOT NULL | | Họ và tên |
| Email | VARCHAR(150) | NOT NULL, UNIQUE | | Email đăng nhập |
| Password | VARCHAR(255) | NOT NULL | | Mật khẩu đã hash |
| Role | ENUM | NOT NULL | | `Admin` / `Recruiter` / `HiringManager` / `Director` / `Probationer` |
| Status | ENUM | DEFAULT `Active` | | `Active` / `Inactive` |
| CreatedAt | DATETIME | DEFAULT NOW() | | Ngày tạo tài khoản |

> Tài khoản `Probationer` được tạo **tự động** khi ứng viên accept Offer (REQ-019): lấy Email từ Candidate, sinh password ngẫu nhiên, Role = `Probationer`.

---

### 2. Bảng `Candidate`
> Căn cứ: UC-03, REQ-006

| Cột | Kiểu | Ràng buộc | Khóa | Mô tả |
|---|---|---|---|---|
| CandidateID | INT | AUTO_INCREMENT | PK | Khóa chính |
| FullName | NVARCHAR(100) | NOT NULL | | Họ và tên ứng viên |
| Email | VARCHAR(150) | NOT NULL, UNIQUE | | Email liên hệ — dùng làm username khi được tuyển |
| Phone | VARCHAR(20) | NULL | | Số điện thoại |
| CreatedAt | DATETIME | DEFAULT NOW() | | Ngày ghi nhận |

---

### 3. Bảng `JobPosting`
> Căn cứ: UC-02, REQ-004/005

| Cột | Kiểu | Ràng buộc | Khóa | Mô tả |
|---|---|---|---|---|
| JobID | INT | AUTO_INCREMENT | PK | Khóa chính |
| PostedBy | INT | NOT NULL | FK → User | Recruiter tạo tin |
| DeptName | NVARCHAR(100) | NOT NULL | | Tên phòng ban (lưu chuỗi) |
| Title | NVARCHAR(200) | NOT NULL | | Tên vị trí tuyển dụng |
| Description | NTEXT | NULL | | Mô tả công việc |
| Requirements | NTEXT | NULL | | Yêu cầu ứng viên (REQ-004) |
| SalaryRange | VARCHAR(100) | NULL | | Mức lương |
| StartDate | DATE | NOT NULL | | Ngày mở nhận hồ sơ |
| EndDate | DATE | NOT NULL | | Hạn nộp hồ sơ |
| Status | ENUM | DEFAULT `Draft` | | `Draft` / `Open` / `Closed` |
| CreatedAt | DATETIME | DEFAULT NOW() | | Ngày tạo |

---

### 4. Bảng `Application`
> Căn cứ: UC-03/04, REQ-006→010

| Cột | Kiểu | Ràng buộc | Khóa | Mô tả |
|---|---|---|---|---|
| AppID | INT | AUTO_INCREMENT | PK | Khóa chính |
| JobID | INT | NOT NULL | FK → JobPosting | Vị trí ứng tuyển |
| CandidateID | INT | NOT NULL | FK → Candidate | Ứng viên nộp đơn |
| ManagedBy | INT | NULL | FK → User | Recruiter phụ trách |
| AppliedDate | DATETIME | DEFAULT NOW() | | Ngày nộp |
| CV_File | VARCHAR(500) | NULL | | Đường dẫn file CV |
| Status | ENUM | DEFAULT `New` | | Xem bên dưới |

**UNIQUE (JobID, CandidateID)** — 1 ứng viên không nộp 2 lần vào cùng 1 tin (REQ-006 AC-3)

**Vòng đời Status:**

| Status | Khi nào |
|---|---|
| `New` | Vừa nộp hồ sơ |
| `Screening` | Recruiter đang xem xét |
| `Shortlisted` | Recruiter duyệt (REQ-009) |
| `Interviewing` | Đã tạo lịch phỏng vấn |
| `Offered` | Đã tạo Offer |
| `Hired` | Ứng viên accept Offer (REQ-018) |
| `Rejected` | Recruiter loại (REQ-010) |
| `Withdrawn` | Ứng viên tự rút |

---

### 5. Bảng `Interview`
> Căn cứ: UC-05/06/07, REQ-011/012/013/014

| Cột | Kiểu | Ràng buộc | Khóa | Mô tả |
|---|---|---|---|---|
| InterviewID | INT | AUTO_INCREMENT | PK | Khóa chính |
| AppID | INT | NOT NULL | FK → Application | Hồ sơ được phỏng vấn |
| InterviewerID | INT | NOT NULL | FK → User | Hiring Manager phỏng vấn |
| InterviewDate | DATETIME | NOT NULL | | Ngày giờ phỏng vấn |
| Location | VARCHAR(200) | NULL | | Địa điểm / link online |
| Type | ENUM | NOT NULL | | `HR` / `Technical` / `Final` |
| ConfirmStatus | ENUM | DEFAULT `Pending` | | `Pending` / `Confirmed` / `Declined` |
| TechnicalScore | TINYINT | NULL | CHECK 0–10 | Điểm kỹ năng chuyên môn (REQ-014) |
| SoftScore | TINYINT | NULL | CHECK 0–10 | Điểm kỹ năng mềm (REQ-014) |
| AttitudeScore | TINYINT | NULL | CHECK 0–10 | Điểm thái độ (REQ-014) |
| Result | ENUM | DEFAULT `Pending` | | `Pass` / `Fail` / `Pending` |
| Feedback | NTEXT | NULL | | Nhận xét của HM |
| CreatedAt | DATETIME | DEFAULT NOW() | | Ngày tạo lịch |

> REQ-011: Khi tạo lịch → kiểm tra xung đột `(InterviewerID, InterviewDate)`.
> UC-06: Ứng viên click link email → cập nhật `ConfirmStatus`.
> REQ-014: HM nhập 3 điểm thành phần + Result sau buổi phỏng vấn.

---

### 6. Bảng `Offer`
> Căn cứ: UC-08/09/10, REQ-015→019

| Cột | Kiểu | Ràng buộc | Khóa | Mô tả |
|---|---|---|---|---|
| OfferID | INT | AUTO_INCREMENT | PK | Khóa chính |
| AppID | INT | NOT NULL, UNIQUE | FK → Application | Quan hệ **1-1** với Application |
| CreatedBy | INT | NOT NULL | FK → User | Recruiter tạo |
| ApprovedBy | INT | NULL | FK → User | Director phê duyệt |
| BaseSalary | DECIMAL(15,2) | NOT NULL | | Lương cơ bản |
| Allowance | DECIMAL(15,2) | DEFAULT 0 | | Phụ cấp |
| StartDate | DATE | NOT NULL | | Ngày bắt đầu làm việc |
| Status | ENUM | DEFAULT `Pending` | | Xem bên dưới |
| DirectorNote | NTEXT | NULL | | Lý do từ chối của Director (REQ-016) |
| CreatedAt | DATETIME | DEFAULT NOW() | | Ngày tạo |

**Vòng đời Status:**

| Status | Khi nào |
|---|---|
| `Pending` | Recruiter vừa tạo, chờ Director (REQ-015) |
| `Approved` | Director duyệt (REQ-016) |
| `Sent` | Hệ thống gửi email ứng viên (REQ-017) |
| `Accepted` | Ứng viên đồng ý (REQ-018) |
| `Rejected` | Director từ chối, trả về Recruiter |
| `Declined` | Ứng viên từ chối |

---

### 7. Bảng `Probation`
> Căn cứ: UC-11/12/13/14, REQ-020→025

| Cột | Kiểu | Ràng buộc | Khóa | Mô tả |
|---|---|---|---|---|
| ProbationID | INT | AUTO_INCREMENT | PK | Khóa chính |
| OfferID | INT | NOT NULL, UNIQUE | FK → Offer | Quan hệ **1-1** với Offer |
| ProbationerID | INT | NOT NULL | FK → User | Tài khoản Probationer |
| SupervisorID | INT | NULL | FK → User | HM giám sát |
| StartDate | DATE | NOT NULL | | Ngày bắt đầu thử việc |
| EndDate | DATE | NOT NULL | | Ngày kết thúc thử việc |
| Status | ENUM | DEFAULT `Ongoing` | | `Ongoing` / `PendingEvaluation` / `PendingApproval` / `Pass` / `Fail` |
| CreatedAt | DATETIME | DEFAULT NOW() | | Ngày tạo |

> Tạo **tự động** khi `Offer.Status = Accepted`.
> REQ-022: Scheduled job → còn 7 ngày đến `EndDate` → gửi email nhắc HM + CC Recruiter.

---

### 8. Bảng `ProbationEvaluation`
> Căn cứ: UC-13/14, REQ-023/024 — tách riêng vì có vòng đời phê duyệt độc lập

| Cột | Kiểu | Ràng buộc | Khóa | Mô tả |
|---|---|---|---|---|
| EvalID | INT | AUTO_INCREMENT | PK | Khóa chính |
| ProbationID | INT | NOT NULL, UNIQUE | FK → Probation | Quan hệ **1-1** với Probation |
| SubmittedBy | INT | NOT NULL | FK → User | HM nộp phiếu |
| ApprovedBy | INT | NULL | FK → User | Director phê duyệt |
| KPIScore | TINYINT | NULL | CHECK 0–100 | Điểm KPI tổng hợp (REQ-023) |
| Comment | NTEXT | NULL | | Nhận xét chi tiết của HM |
| Recommendation | ENUM | NULL | | `Pass` / `Fail` — đề xuất của HM |
| DirectorNote | NTEXT | NULL | | Lý do nếu Director từ chối (REQ-024) |
| Status | ENUM | DEFAULT `Draft` | | `Draft` / `Submitted` / `PendingApproval` / `Approved` / `Rejected` |
| SubmittedAt | DATETIME | NULL | | Thời điểm HM gửi duyệt |
| ApprovedAt | DATETIME | NULL | | Thời điểm Director phê duyệt |

---

## III. QUAN HỆ GIỮA CÁC BẢNG

| Bảng con | Cột FK | Bảng cha | Kiểu | Ghi chú |
|---|---|---|---|---|
| JobPosting | PostedBy | User | N : 1 | Recruiter đăng tin |
| Application | JobID | JobPosting | N : 1 | Hồ sơ thuộc vị trí nào |
| Application | CandidateID | Candidate | N : 1 | Ai nộp |
| Application | ManagedBy | User | N : 1 | Recruiter phụ trách |
| Interview | AppID | Application | N : 1 | 1 hồ sơ nhiều vòng PV |
| Interview | InterviewerID | User | N : 1 | HM phỏng vấn |
| Offer | AppID | Application | **1 : 1** | UNIQUE |
| Offer | CreatedBy | User | N : 1 | Recruiter tạo |
| Offer | ApprovedBy | User | N : 1 | Director duyệt |
| Probation | OfferID | Offer | **1 : 1** | UNIQUE |
| Probation | ProbationerID | User | N : 1 | Tài khoản thử việc |
| Probation | SupervisorID | User | N : 1 | HM giám sát |
| ProbationEvaluation | ProbationID | Probation | **1 : 1** | UNIQUE |
| ProbationEvaluation | SubmittedBy | User | N : 1 | HM nộp phiếu |
| ProbationEvaluation | ApprovedBy | User | N : 1 | Director phê duyệt |

---

## IV. SQL DDL

```sql
-- ============================================================
-- Recruitment Management System — Database Schema
-- ============================================================

CREATE DATABASE RecruitmentDB
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE RecruitmentDB;

-- 1. USER
CREATE TABLE User (
  UserID    INT           NOT NULL AUTO_INCREMENT,
  FullName  NVARCHAR(100) NOT NULL,
  Email     VARCHAR(150)  NOT NULL UNIQUE,
  Password  VARCHAR(255)  NOT NULL,
  Role      ENUM('Admin','Recruiter','HiringManager','Director','Probationer') NOT NULL,
  Status    ENUM('Active','Inactive') NOT NULL DEFAULT 'Active',
  CreatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (UserID)
);

-- 2. CANDIDATE
CREATE TABLE Candidate (
  CandidateID INT           NOT NULL AUTO_INCREMENT,
  FullName    NVARCHAR(100) NOT NULL,
  Email       VARCHAR(150)  NOT NULL UNIQUE,
  Phone       VARCHAR(20),
  CreatedAt   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (CandidateID)
);

-- 3. JOB POSTING
CREATE TABLE JobPosting (
  JobID        INT            NOT NULL AUTO_INCREMENT,
  PostedBy     INT            NOT NULL,
  DeptName     NVARCHAR(100)  NOT NULL,
  Title        NVARCHAR(200)  NOT NULL,
  Description  NTEXT,
  Requirements NTEXT,
  SalaryRange  VARCHAR(100),
  StartDate    DATE           NOT NULL,
  EndDate      DATE           NOT NULL,
  Status       ENUM('Draft','Open','Closed') NOT NULL DEFAULT 'Draft',
  CreatedAt    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (JobID),
  CONSTRAINT fk_job_postedby FOREIGN KEY (PostedBy) REFERENCES User(UserID)
);

-- 4. APPLICATION
CREATE TABLE Application (
  AppID       INT      NOT NULL AUTO_INCREMENT,
  JobID       INT      NOT NULL,
  CandidateID INT      NOT NULL,
  ManagedBy   INT,
  AppliedDate DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CV_File     VARCHAR(500),
  Status      ENUM('New','Screening','Shortlisted','Interviewing',
                   'Offered','Hired','Rejected','Withdrawn') NOT NULL DEFAULT 'New',
  PRIMARY KEY (AppID),
  CONSTRAINT uq_application   UNIQUE (JobID, CandidateID),
  CONSTRAINT fk_app_job       FOREIGN KEY (JobID)       REFERENCES JobPosting(JobID),
  CONSTRAINT fk_app_candidate FOREIGN KEY (CandidateID) REFERENCES Candidate(CandidateID),
  CONSTRAINT fk_app_managed   FOREIGN KEY (ManagedBy)   REFERENCES User(UserID)
);

-- 5. INTERVIEW
CREATE TABLE Interview (
  InterviewID    INT      NOT NULL AUTO_INCREMENT,
  AppID          INT      NOT NULL,
  InterviewerID  INT      NOT NULL,
  InterviewDate  DATETIME NOT NULL,
  Location       VARCHAR(200),
  Type           ENUM('HR','Technical','Final') NOT NULL,
  ConfirmStatus  ENUM('Pending','Confirmed','Declined') NOT NULL DEFAULT 'Pending',
  TechnicalScore TINYINT UNSIGNED,
  SoftScore      TINYINT UNSIGNED,
  AttitudeScore  TINYINT UNSIGNED,
  Result         ENUM('Pass','Fail','Pending') NOT NULL DEFAULT 'Pending',
  Feedback       NTEXT,
  CreatedAt      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (InterviewID),
  CONSTRAINT chk_tech  CHECK (TechnicalScore BETWEEN 0 AND 10),
  CONSTRAINT chk_soft  CHECK (SoftScore      BETWEEN 0 AND 10),
  CONSTRAINT chk_att   CHECK (AttitudeScore  BETWEEN 0 AND 10),
  CONSTRAINT fk_iv_app          FOREIGN KEY (AppID)         REFERENCES Application(AppID),
  CONSTRAINT fk_iv_interviewer  FOREIGN KEY (InterviewerID) REFERENCES User(UserID)
);

-- 6. OFFER
CREATE TABLE Offer (
  OfferID      INT           NOT NULL AUTO_INCREMENT,
  AppID        INT           NOT NULL UNIQUE,
  CreatedBy    INT           NOT NULL,
  ApprovedBy   INT,
  BaseSalary   DECIMAL(15,2) NOT NULL,
  Allowance    DECIMAL(15,2) NOT NULL DEFAULT 0,
  StartDate    DATE          NOT NULL,
  Status       ENUM('Pending','Approved','Sent','Accepted','Rejected','Declined')
               NOT NULL DEFAULT 'Pending',
  DirectorNote NTEXT,
  CreatedAt    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (OfferID),
  CONSTRAINT fk_offer_app      FOREIGN KEY (AppID)      REFERENCES Application(AppID),
  CONSTRAINT fk_offer_created  FOREIGN KEY (CreatedBy)  REFERENCES User(UserID),
  CONSTRAINT fk_offer_approved FOREIGN KEY (ApprovedBy) REFERENCES User(UserID)
);

-- 7. PROBATION
CREATE TABLE Probation (
  ProbationID   INT  NOT NULL AUTO_INCREMENT,
  OfferID       INT  NOT NULL UNIQUE,
  ProbationerID INT  NOT NULL,
  SupervisorID  INT,
  StartDate     DATE NOT NULL,
  EndDate       DATE NOT NULL,
  Status        ENUM('Ongoing','PendingEvaluation','PendingApproval','Pass','Fail')
                NOT NULL DEFAULT 'Ongoing',
  CreatedAt     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (ProbationID),
  CONSTRAINT fk_prob_offer       FOREIGN KEY (OfferID)       REFERENCES Offer(OfferID),
  CONSTRAINT fk_prob_probationer FOREIGN KEY (ProbationerID) REFERENCES User(UserID),
  CONSTRAINT fk_prob_supervisor  FOREIGN KEY (SupervisorID)  REFERENCES User(UserID)
);

-- 8. PROBATION EVALUATION
CREATE TABLE ProbationEvaluation (
  EvalID         INT     NOT NULL AUTO_INCREMENT,
  ProbationID    INT     NOT NULL UNIQUE,
  SubmittedBy    INT     NOT NULL,
  ApprovedBy     INT,
  KPIScore       TINYINT UNSIGNED,
  Comment        NTEXT,
  Recommendation ENUM('Pass','Fail'),
  DirectorNote   NTEXT,
  Status         ENUM('Draft','Submitted','PendingApproval','Approved','Rejected')
                 NOT NULL DEFAULT 'Draft',
  SubmittedAt    DATETIME,
  ApprovedAt     DATETIME,
  PRIMARY KEY (EvalID),
  CONSTRAINT chk_kpi         CHECK (KPIScore BETWEEN 0 AND 100),
  CONSTRAINT fk_eval_prob    FOREIGN KEY (ProbationID) REFERENCES Probation(ProbationID),
  CONSTRAINT fk_eval_submit  FOREIGN KEY (SubmittedBy) REFERENCES User(UserID),
  CONSTRAINT fk_eval_approve FOREIGN KEY (ApprovedBy)  REFERENCES User(UserID)
);
```

---

## V. MA TRẬN PHÂN QUYỀN

| Chức năng | Candidate | Recruiter | HiringManager | Director | Admin |
|---|:---:|:---:|:---:|:---:|:---:|
| Đăng / sửa / đóng JobPosting | | ✅ | | | |
| Nộp hồ sơ ứng tuyển | ✅ | | | | |
| Sàng lọc / duyệt Application | | ✅ | | | |
| Tạo lịch Interview | | ✅ | | | |
| Xác nhận / từ chối lịch PV | ✅ | | | | |
| Chấm điểm Interview | | | ✅ | | |
| Tạo Offer | | ✅ | | | |
| Phê duyệt Offer | | | | ✅ | |
| Phản hồi Offer | ✅ | | | | |
| Xem danh sách Probation | | ✅ | ✅ | | |
| Nộp ProbationEvaluation | | | ✅ | | |
| Phê duyệt ProbationEvaluation | | | | ✅ | |
| Xem thông tin thử việc cá nhân | — | | | | |
| *(Probationer xem của mình)* | ✅\* | | | | |
| Xem báo cáo tuyển dụng | | ✅ | | | |
| Xem báo cáo tổng hợp | | | | ✅ | |
| Quản lý tài khoản User | | | | | ✅ |

> \* Probationer chỉ đọc thông tin thử việc của chính mình (UC-17, read-only)

---

## VI. QUY TẮC NGHIỆP VỤ QUAN TRỌNG

| # | Quy tắc | Căn cứ |
|---|---|---|
| 1 | Không tạo được Offer nếu chưa có Interview với Result = `Pass` | REQ-015 |
| 2 | Probation chỉ tạo khi Offer.Status = `Accepted` | REQ-018/019 |
| 3 | Tài khoản Probationer tạo tự động khi accept Offer (email = username, password random) | REQ-019 |
| 4 | Gửi email nhắc HM tự động 7 ngày trước Probation.EndDate | REQ-022 |
| 5 | Kiểm tra xung đột lịch khi tạo Interview (cùng InterviewerID + thời gian trùng) | REQ-011 |
| 6 | 1 ứng viên không nộp 2 lần vào cùng 1 JobPosting — UNIQUE(JobID, CandidateID) | REQ-006 |
| 7 | Quan hệ 1-1 bảo đảm bằng UNIQUE: Offer.AppID, Probation.OfferID, ProbationEvaluation.ProbationID | Thiết kế |
