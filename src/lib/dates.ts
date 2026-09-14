export const APP_TIMEZONE = "Asia/Ho_Chi_Minh";
export const LEGACY_START_DATE_FALLBACK = "2026-09-03";

export function isValidDateRange(start: string | null | undefined, due: string | null | undefined) {
  return !start || !due || start <= due;
}

const dateKeyFormatters = new Map<string, Intl.DateTimeFormat>();
const longDateFormatter = new Intl.DateTimeFormat("vi-VN", {
  weekday: "long",
  day: "numeric",
  month: "long",
});
const dateRangeFormatter = new Intl.DateTimeFormat("vi-VN", {
  day: "numeric",
  month: "long",
});
const shortDateFormatter = new Intl.DateTimeFormat("vi-VN", {
  day: "numeric",
  month: "short",
});
const shortWeekdayFormatter = new Intl.DateTimeFormat("vi-VN", {
  weekday: "short",
});

let relativeDateKey = "";
let relativeYesterday = "";
let relativeTomorrow = "";

export function getLocalDateKey(
  date = new Date(),
  timeZone = APP_TIMEZONE,
): string {
  let formatter = dateKeyFormatters.get(timeZone);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat("en-US", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    dateKeyFormatters.set(timeZone, formatter);
  }
  const parts = formatter.formatToParts(date);

  const value = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value;

  return `${value("year")}-${value("month")}-${value("day")}`;
}

export function getLegacyStartDate(createdAt: string): string {
  const createdDate = new Date(createdAt);
  return Number.isNaN(createdDate.getTime())
    ? LEGACY_START_DATE_FALLBACK
    : getLocalDateKey(createdDate);
}

export function addCalendarDays(dateKey: string, amount: number): string {
  const date = new Date(`${dateKey}T12:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + amount);
  return date.toISOString().slice(0, 10);
}

export function formatLongDate(dateKey: string): string {
  return longDateFormatter.format(new Date(`${dateKey}T12:00:00.000Z`));
}

export function formatDateRange(startDateKey: string, endDateKey: string): string {
  return `${dateRangeFormatter.format(new Date(`${startDateKey}T12:00:00.000Z`))} – ${dateRangeFormatter.format(new Date(`${endDateKey}T12:00:00.000Z`))}`;
}

export function formatShortDate(dateKey: string, todayKey: string): string {
  if (relativeDateKey !== todayKey) {
    relativeDateKey = todayKey;
    relativeYesterday = addCalendarDays(todayKey, -1);
    relativeTomorrow = addCalendarDays(todayKey, 1);
  }
  if (dateKey === todayKey) return "Hôm nay";
  if (dateKey === relativeYesterday) return "Hôm qua";
  if (dateKey === relativeTomorrow) return "Ngày mai";
  return shortDateFormatter.format(new Date(`${dateKey}T12:00:00.000Z`));
}

export function formatListDate(dateKey: string, todayKey: string): string {
  const yesterday = addCalendarDays(todayKey, -1);
  const tomorrow = addCalendarDays(todayKey, 1);
  if (dateKey === yesterday) return "Hôm qua";
  if (dateKey === todayKey) return "Hôm nay";
  if (dateKey === tomorrow) return "Ngày mai";
  const [year, month, day] = dateKey.split("-");
  const currentYear = todayKey.slice(0, 4);
  return year === currentYear ? `${day}.${month}` : `${day}.${month}.${year.slice(-2)}`;
}

export function formatShortWeekday(dateKey: string): string {
  return shortWeekdayFormatter.format(new Date(`${dateKey}T12:00:00.000Z`));
}
