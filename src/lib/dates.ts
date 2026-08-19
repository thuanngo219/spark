export const APP_TIMEZONE = "Asia/Ho_Chi_Minh";

export function getLocalDateKey(
  date = new Date(),
  timeZone = APP_TIMEZONE,
): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const value = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value;

  return `${value("year")}-${value("month")}-${value("day")}`;
}

export function addCalendarDays(dateKey: string, amount: number): string {
  const date = new Date(`${dateKey}T12:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + amount);
  return date.toISOString().slice(0, 10);
}

export function formatLongDate(dateKey: string): string {
  return new Intl.DateTimeFormat("vi-VN", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date(`${dateKey}T12:00:00.000Z`));
}

export function formatDateRange(startDateKey: string, endDateKey: string): string {
  const formatter = new Intl.DateTimeFormat("vi-VN", {
    day: "numeric",
    month: "long",
  });
  return `${formatter.format(new Date(`${startDateKey}T12:00:00.000Z`))} – ${formatter.format(new Date(`${endDateKey}T12:00:00.000Z`))}`;
}

export function formatShortDate(dateKey: string, todayKey: string): string {
  if (dateKey === todayKey) return "Hôm nay";
  if (dateKey === addCalendarDays(todayKey, -1)) return "Hôm qua";
  if (dateKey === addCalendarDays(todayKey, 1)) return "Ngày mai";
  return new Intl.DateTimeFormat("vi-VN", {
    day: "numeric",
    month: "short",
  }).format(new Date(`${dateKey}T12:00:00.000Z`));
}
