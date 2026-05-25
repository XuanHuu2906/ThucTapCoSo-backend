import { notificationEmitter } from "./notification.events.js";
import { notificationService } from "../services/notification.service.js";

// ==========================================
// ADMIN EVENTS (Broadcast to Admin)
// ==========================================

notificationEmitter.on("user.created", async (data: { user: any }) => {
  if (["Recruiter", "HiringManager"].includes(data.user.role)) {
    await notificationService.broadcastToRole(["Admin"], {
      title: "Tài khoản mới được tạo",
      message: `Tài khoản ${data.user.role} mới (${data.user.fullName}) đã được tạo.`,
      type: "INFO",
      actionUrl: "/admin/users",
      entityType: "User",
      entityId: data.user.userId
    });
  }
});

notificationEmitter.on("user.status_changed", async (data: { user: any; byAdminId: number }) => {
  if (data.user.role === "Admin") {
    await notificationService.broadcastToRole(["Admin"], {
      title: "Trạng thái Admin thay đổi",
      message: `Tài khoản Admin ${data.user.fullName} đã bị ${data.user.status === "Active" ? "mở khoá" : "khoá"}.`,
      type: "WARNING",
      actionUrl: "/admin/users",
      entityType: "User",
      entityId: data.user.userId
    });
  }
});

notificationEmitter.on("config.updated", async (data: { key: string }) => {
  await notificationService.broadcastToRole(["Admin"], {
    title: "Cấu hình hệ thống thay đổi",
    message: `Cấu hình ${data.key} vừa được cập nhật.`,
    type: "INFO",
    actionUrl: "/admin/config",
    entityType: "Config"
  });
});

// ==========================================
// RECRUITER EVENTS (Targeted)
// ==========================================

notificationEmitter.on("application.created", async (data: { app: any; job: any }) => {
  await notificationService.createNotification({
    userId: data.job.postedBy,
    title: "Ứng viên mới nộp hồ sơ",
    message: `Ứng viên vừa nộp hồ sơ cho vị trí ${data.job.title}.`,
    type: "INFO",
    actionUrl: `/recruiter/candidates`,
    entityType: "Application",
    entityId: data.app.appId
  });
});

notificationEmitter.on("interview.candidate_responded", async (data: { interview: any; application: any; job: any }) => {
  await notificationService.createNotification({
    userId: data.job.postedBy,
    title: `Ứng viên ${data.interview.confirmStatus === "Confirmed" ? "xác nhận" : "từ chối"} lịch PV`,
    message: `Ứng viên đã ${data.interview.confirmStatus === "Confirmed" ? "xác nhận tham gia" : "từ chối"} lịch phỏng vấn.`,
    type: data.interview.confirmStatus === "Confirmed" ? "SUCCESS" : "ERROR",
    actionUrl: `/recruiter/candidates`,
    entityType: "Interview",
    entityId: data.interview.interviewId
  });
});

notificationEmitter.on("interview.evaluated", async (data: { interview: any; job: any; hmName: string }) => {
  await notificationService.createNotification({
    userId: data.job.postedBy,
    title: "HM đã chấm phỏng vấn",
    message: `HM ${data.hmName} đã gửi kết quả phỏng vấn.`,
    type: "INFO",
    actionUrl: `/recruiter/candidates`,
    entityType: "Interview",
    entityId: data.interview.interviewId
  });
});

notificationEmitter.on("offer.director_responded", async (data: { offer: any; recruiterId: number }) => {
  const isApproved = data.offer.status === "Approved";
  await notificationService.createNotification({
    userId: data.recruiterId,
    title: isApproved ? "Offer được duyệt" : "Offer bị từ chối",
    message: `Offer của ứng viên ${isApproved ? "đã được Director phê duyệt" : "đã bị Director từ chối"}.`,
    type: isApproved ? "SUCCESS" : "ERROR",
    actionUrl: `/recruiter/offers`,
    entityType: "Offer",
    entityId: data.offer.offerId
  });
});

notificationEmitter.on("offer.candidate_responded", async (data: { offer: any; recruiterId: number }) => {
  const isAccepted = data.offer.status === "Accepted";
  await notificationService.createNotification({
    userId: data.recruiterId,
    title: isAccepted ? "Ứng viên chấp nhận Offer" : "Ứng viên từ chối Offer",
    message: `Ứng viên đã ${isAccepted ? "chấp nhận" : "từ chối"} Offer.`,
    type: isAccepted ? "SUCCESS" : "ERROR",
    actionUrl: `/recruiter/offers`,
    entityType: "Offer",
    entityId: data.offer.offerId
  });
});

notificationEmitter.on("probation.director_responded", async (data: { probation: any; recruiterId: number }) => {
  const isPassed = data.probation.status === "Pass";
  await notificationService.createNotification({
    userId: data.recruiterId,
    title: isPassed ? "Director duyệt kết quả thử việc" : "Director từ chối kết quả thử việc",
    message: `Kết quả đánh giá thử việc đã được Director ${isPassed ? "duyệt (Pass)" : "từ chối (Fail)"}.`,
    type: isPassed ? "SUCCESS" : "ERROR",
    actionUrl: `/recruiter/probation`,
    entityType: "Probation",
    entityId: data.probation.probationId
  });
});

notificationEmitter.on("probation.reminder_due", async (data: { probation: any; recruiterId: number; daysLeft: number }) => {
  await notificationService.createNotification({
    userId: data.recruiterId,
    title: "Sắp hết hạn thử việc",
    message: `Nhân viên thử việc còn ${data.daysLeft} ngày là hết hạn.`,
    type: "WARNING",
    actionUrl: `/recruiter/probation`,
    entityType: "Probation",
    entityId: data.probation.probationId
  });
});


// ==========================================
// HIRING MANAGER EVENTS (Targeted)
// ==========================================

notificationEmitter.on("interview.assigned", async (data: { interview: any; application: any }) => {
  await notificationService.createNotification({
    userId: data.interview.interviewerId,
    title: "Được gán lịch phỏng vấn",
    message: `Bạn được phân công phỏng vấn ứng viên vào ${new Date(data.interview.interviewDate).toLocaleString("vi-VN")}.`,
    type: "INFO",
    actionUrl: `/manager/interviews`,
    entityType: "Interview",
    entityId: data.interview.interviewId
  });
});

notificationEmitter.on("interview.updated", async (data: { interview: any }) => {
  await notificationService.createNotification({
    userId: data.interview.interviewerId,
    title: "Lịch phỏng vấn bị thay đổi",
    message: `Lịch phỏng vấn đã được cập nhật sang ${new Date(data.interview.interviewDate).toLocaleString("vi-VN")}.`,
    type: "WARNING",
    actionUrl: `/manager/interviews`,
    entityType: "Interview",
    entityId: data.interview.interviewId
  });
});

notificationEmitter.on("interview.candidate_responded_hm", async (data: { interview: any }) => {
  const isConfirmed = data.interview.confirmStatus === "Confirmed";
  await notificationService.createNotification({
    userId: data.interview.interviewerId,
    title: `Ứng viên ${isConfirmed ? "xác nhận" : "từ chối"} tham gia`,
    message: `Ứng viên đã ${isConfirmed ? "xác nhận tham gia" : "từ chối"} phỏng vấn.`,
    type: isConfirmed ? "SUCCESS" : "ERROR",
    actionUrl: `/manager/interviews`,
    entityType: "Interview",
    entityId: data.interview.interviewId
  });
});

notificationEmitter.on("interview.evaluation_reminder", async (data: { interview: any }) => {
  await notificationService.createNotification({
    userId: data.interview.interviewerId,
    title: "Đến giờ cần chấm phỏng vấn",
    message: `Vui lòng nhập kết quả phỏng vấn cho ứng viên.`,
    type: "WARNING",
    actionUrl: `/manager/interviews`,
    entityType: "Interview",
    entityId: data.interview.interviewId
  });
});

notificationEmitter.on("probation.evaluation_reminder", async (data: { probation: any; hmId: number; daysLeft: number }) => {
  await notificationService.createNotification({
    userId: data.hmId,
    title: data.daysLeft > 0 ? "Sắp đến hạn đánh giá thử việc" : "Quá hạn đánh giá thử việc",
    message: `Nhân viên còn ${data.daysLeft} ngày hết hạn thử việc. Vui lòng gửi đánh giá.`,
    type: "WARNING",
    actionUrl: `/manager/probation-reviews`,
    entityType: "Probation",
    entityId: data.probation.probationId
  });
});

// ==========================================
// DIRECTOR EVENTS (Broadcast to Director)
// ==========================================

notificationEmitter.on("offer.pending_approval", async (data: { offer: any }) => {
  await notificationService.broadcastToRole(["Director"], {
    title: "Có Offer chờ duyệt",
    message: `Một Offer mới đang chờ phê duyệt.`,
    type: "WARNING",
    actionUrl: `/director/offers`,
    entityType: "Offer",
    entityId: data.offer.offerId
  });
});

notificationEmitter.on("probation.pending_approval", async (data: { probation: any }) => {
  await notificationService.broadcastToRole(["Director"], {
    title: "Có kết quả thử việc chờ duyệt",
    message: `Kết quả đánh giá thử việc đang chờ phê duyệt.`,
    type: "WARNING",
    actionUrl: `/director/probation`,
    entityType: "Probation",
    entityId: data.probation.probationId
  });
});

// ==========================================
// PROBATIONER EVENTS (Targeted - Future Phase)
// ==========================================

notificationEmitter.on("probation.result_approved", async (data: { probation: any; probationerId: number }) => {
  const isPassed = data.probation.status === "Pass";
  await notificationService.createNotification({
    userId: data.probationerId,
    title: isPassed ? "Chúc mừng, bạn đã đạt thử việc" : "Kết quả thử việc của bạn đã được thông báo",
    message: isPassed ? "Bạn đã được duyệt trở thành nhân viên chính thức." : "Rất tiếc bạn không vượt qua kỳ thử việc.",
    type: isPassed ? "SUCCESS" : "ERROR",
    actionUrl: `/probationer/result`,
    entityType: "Probation",
    entityId: data.probation.probationId
  });
});

console.log("Notification listeners registered!");
