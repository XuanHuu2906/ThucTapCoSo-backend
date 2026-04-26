import { z } from "zod";

export const jobStatusEnum = z.enum(["Draft", "Open", "Closed"]);

// Schema tạo tin tuyển dụng
export const createJobSchema = z
  .object({
    deptName: z.string().trim().min(1, "Tên phòng ban là bắt buộc"),
    title: z.string().trim().min(1, "Tiêu đề là bắt buộc"),
    startDate: z.coerce.date({
      error: "Ngày bắt đầu không hợp lệ",
    }),
    endDate: z.coerce.date({
      error: "Ngày kết thúc không hợp lệ",
    }),
    description: z.string().trim().optional(),
    requirements: z.string().trim().optional(),
    salaryRange: z.string().trim().optional(),
    status: jobStatusEnum.default("Draft").optional(),
  })
  .refine((data) => data.endDate >= data.startDate, {
    message: "Ngày kết thúc phải lớn hơn hoặc bằng ngày bắt đầu",
    path: ["endDate"],
  });

// Schema cập nhật tin tuyển dụng
export const updateJobSchema = z
  .object({
    deptName: z.string().trim().min(1).optional(),
    title: z.string().trim().min(1).optional(),
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional(),
    description: z.string().trim().optional(),
    requirements: z.string().trim().optional(),
    salaryRange: z.string().trim().optional(),
    status: jobStatusEnum.optional(),
  })
  .refine(
    (data) => {
      if (data.startDate && data.endDate) {
        return data.endDate >= data.startDate;
      }
      return true;
    },
    {
      message: "Ngày kết thúc phải lớn hơn hoặc bằng ngày bắt đầu",
      path: ["endDate"],
    }
  );

// Schema chỉ cập nhật trạng thái
export const updateJobStatusSchema = z.object({
  status: jobStatusEnum,
});

export type CreateJobInput = z.infer<typeof createJobSchema>;
export type UpdateJobInput = z.infer<typeof updateJobSchema>;
export type UpdateJobStatusInput = z.infer<typeof updateJobStatusSchema>;