import { z } from 'zod';

export const ReportReasonSchema = z.object({
  reason: z.string().min(1, 'Vui lòng chọn lý do báo cáo'),
  description: z.string().optional(),
});

export const ReportInputSchema = z.object({
  reportable_type: z.enum(['post', 'comment']),
  reportable_id: z.number(),
  reason: z.string().min(10, 'Lý do báo cáo phải có ít nhất 10 ký tự'),
});
