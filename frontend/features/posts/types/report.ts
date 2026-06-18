export type ReportType = 'post' | 'comment';

export interface ReportInput {
  reportable_type: ReportType;
  reportable_id: number;
  reason: string;
}

export const REPORT_REASONS = [
  { value: 'spam', label: 'Spam / Quảng cáo' },
  { value: 'harassment', label: 'Quấy rối / Đe dọa' },
  { value: 'hate_speech', label: 'Ngôn từ thù địch' },
  { value: 'misinformation', label: 'Thông tin sai lệch' },
  { value: 'inappropriate', label: 'Nội dung không phù hợp' },
  { value: 'other', label: 'Lý do khác' },
] as const;
