/**
 * Post status mappings (Frontend string -> Backend integer string)
 */
export const POST_STATUS_API_MAP: Record<string, string> = {
  pending: '1',
  published: '2',
  rejected: '3',
  approved: '4',
  deleted: '5',
}

/**
 * Report status mappings (Frontend string -> Backend integer string)
 */
export const REPORT_STATUS_API_MAP: Record<string, string> = {
  pending: '1',
  resolved: '2',
  dismissed: '3',
}

/**
 * User status mappings (Frontend string -> Backend integer string)
 */
export const USER_STATUS_API_MAP: Record<string, string> = {
  active: '1',
  banned: '2',
}

/**
 * Report status labels mapping
 */
export const REPORT_STATUS_LABELS: Record<number, string> = {
  1: 'Đang chờ',
  2: 'Đã xử lý',
  3: 'Bác bỏ',
}

/**
 * Report status color classes mapping
 */
export const REPORT_STATUS_COLORS: Record<number, string> = {
  1: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  2: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  3: 'bg-muted text-muted-foreground',
}
