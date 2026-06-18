import { toast as sonnerToast } from 'sonner';

/**
 * Simple toast utility wrapper around sonner.
 * Provides a toast object with success/error/info/warning methods.
 */
export const toast = {
  success: (message: string, options?: Parameters<typeof sonnerToast.success>[1]) =>
    sonnerToast.success(message, options),
  error: (message: string, options?: Parameters<typeof sonnerToast.error>[1]) =>
    sonnerToast.error(message, options),
  info: (message: string, options?: Parameters<typeof sonnerToast.info>[1]) =>
    sonnerToast.info(message, options),
  warning: (message: string, options?: Parameters<typeof sonnerToast.warning>[1]) =>
    sonnerToast.warning(message, options),
};

/**
 * Determine whether a backend message should trigger a toast.
 * Filters out generic or unhelpful messages.
 */
export function shouldShowToast(message: string | undefined | null): boolean {
  if (!message) return false;
  const lower = message.toLowerCase();
  const blocked = [
    'success',
    'thành công',
    'operation completed',
    'no data',
    'không có dữ liệu',
  ];
  return !blocked.some((b) => lower.includes(b));
}
