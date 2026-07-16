export function toDateInputValue(date: Date | null): string {
  if (!date) return "";
  return date.toISOString().split("T")[0];
}

export function formatDueDate(date: Date | null): string | null {
  if (!date) return null;
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function isOverdue(date: Date | null, completed: boolean): boolean {
  if (!date || completed) return false;
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  return date.getTime() < todayStart.getTime();
}

export function formatDateTime(date: Date): string {
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}
