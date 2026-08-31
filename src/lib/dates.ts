export const APP_TIMEZONE = "Asia/Ho_Chi_Minh";

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

export function formatShortWeekday(dateKey: string): string {
  return shortWeekdayFormatter.format(new Date(`${dateKey}T12:00:00.000Z`));
}
