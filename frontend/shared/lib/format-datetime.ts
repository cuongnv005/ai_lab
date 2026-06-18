function pad2(value: number): string {
  return String(value).padStart(2, "0");
}

/** Date + time for audit trails: DD/MM/YYYY HH:mm:ss */
export function formatDateTime(value: string | Date): string {
  const date = typeof value === "string" ? new Date(value) : value;
  return `${pad2(date.getDate())}/${pad2(date.getMonth() + 1)}/${date.getFullYear()} ${pad2(date.getHours())}:${pad2(date.getMinutes())}:${pad2(date.getSeconds())}`;
}
