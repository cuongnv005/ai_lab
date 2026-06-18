/**
 * Format date utilities
 * Formats: DD-MM-YYYY (date) or DD-MM-YYYY HH:mm (datetime)
 */

export function formatDate(date: string | Date | undefined | null): string {
  if (!date) return ''
  const d = typeof date === 'string' ? new Date(date) : date
  if (isNaN(d.getTime())) return ''
  
  const day = d.getDate().toString().padStart(2, '0')
  const month = (d.getMonth() + 1).toString().padStart(2, '0')
  const year = d.getFullYear()
  return `${day}-${month}-${year}`
}

export function formatDateTime(date: string | Date | undefined | null, locale?: string): string {
  if (!date) return ''
  const d = typeof date === 'string' ? new Date(date) : date
  if (isNaN(d.getTime())) return ''
  
  let currentLocale = locale;
  if (!currentLocale && typeof window !== 'undefined') {
    const match = document.cookie.match(/(^| )NEXT_LOCALE=([^;]+)/);
    currentLocale = match ? match[2] : 'vi';
  }
  if (!currentLocale) currentLocale = 'vi';

  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  
  const day = d.getDate().toString().padStart(2, '0')
  const month = (d.getMonth() + 1).toString().padStart(2, '0')
  const year = d.getFullYear()
  const hours = d.getHours().toString().padStart(2, '0')
  const minutes = d.getMinutes().toString().padStart(2, '0')
  const timeStr = `${hours}:${minutes}`
  const defaultFormat = `${day}-${month}-${year} ${timeStr}`

  // If future date, just return default format
  if (diffMs < 0) return defaultFormat

  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHour = Math.floor(diffMin / 60)

  if (diffSec < 60) {
    if (currentLocale === 'en') return 'Just now';
    if (currentLocale === 'ja') return 'たった今';
    return 'Vừa xong';
  }
  if (diffMin < 60) {
    if (currentLocale === 'en') return `${diffMin} mins ago`;
    if (currentLocale === 'ja') return `${diffMin} 分前`;
    return `${diffMin} phút trước`;
  }
  if (diffHour < 12) {
    if (currentLocale === 'en') return `${diffHour} hours ago`;
    if (currentLocale === 'ja') return `${diffHour} 時間前`;
    return `${diffHour} giờ trước`;
  }

  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  const targetDate = new Date(d.getFullYear(), d.getMonth(), d.getDate())

  if (targetDate.getTime() === today.getTime()) {
    if (currentLocale === 'en') return `Today at ${timeStr}`;
    if (currentLocale === 'ja') return `今日 ${timeStr}`;
    return `${timeStr} hôm nay`;
  }
  if (targetDate.getTime() === yesterday.getTime()) {
    if (currentLocale === 'en') return `Yesterday at ${timeStr}`;
    if (currentLocale === 'ja') return `昨日 ${timeStr}`;
    return `${timeStr} hôm qua`;
  }

  return defaultFormat
}
