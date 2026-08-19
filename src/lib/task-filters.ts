import { addCalendarDays } from "@/lib/dates";
import type { SparkItem, View } from "@/lib/types";

export type TimeGroup = "overdue" | "today" | "upcoming" | "later" | "undated";

const timeGroupOrder: TimeGroup[] = ["overdue", "today", "upcoming", "later", "undated"];

export function isActive(item: SparkItem): boolean {
  return item.type === "note" || !item.completedAt;
}

export function filterItems(
  items: SparkItem[],
  view: View,
  todayKey: string,
): SparkItem[] {
  const active = items.filter(isActive);

  const filtered = active.filter((item) => {
    switch (view.type) {
      case "today":
        return Boolean(item.dueDate && item.dueDate <= todayKey);
      case "upcoming":
        return Boolean(
          item.dueDate &&
            item.dueDate >= addCalendarDays(todayKey, 1) &&
            item.dueDate <= addCalendarDays(todayKey, 3),
        );
      case "calendar":
        return item.dueDate === view.date;
      case "all":
        return true;
      case "important":
        return item.isImportant;
      case "urgent":
        return item.isUrgent;
      case "project":
        return item.projectId === view.projectId;
    }
  });

  return filtered.sort((a, b) => {
    if (!a.dueDate && !b.dueDate) return a.createdAt.localeCompare(b.createdAt);
    if (!a.dueDate) return 1;
    if (!b.dueDate) return -1;
    return a.dueDate.localeCompare(b.dueDate) || a.createdAt.localeCompare(b.createdAt);
  });
}

export function completedForView(
  items: SparkItem[],
  view: View,
  todayKey: string,
): SparkItem[] {
  return items.filter((item) => {
    if (item.type !== "task" || !item.completedAt) return false;
    switch (view.type) {
      case "today":
        return Boolean(item.dueDate && item.dueDate <= todayKey);
      case "upcoming":
        return Boolean(
          item.dueDate &&
            item.dueDate >= addCalendarDays(todayKey, 1) &&
            item.dueDate <= addCalendarDays(todayKey, 3),
        );
      case "calendar":
        return item.dueDate === view.date;
      case "all":
        return true;
      case "important":
        return item.isImportant;
      case "urgent":
        return item.isUrgent;
      case "project":
        return item.projectId === view.projectId;
    }
  });
}

export function groupItemsByTime(
  items: SparkItem[],
  todayKey: string,
): { key: TimeGroup; items: SparkItem[] }[] {
  const upcomingEnd = addCalendarDays(todayKey, 3);
  const groups = new Map<TimeGroup, SparkItem[]>(timeGroupOrder.map((key) => [key, []]));

  for (const item of items) {
    const key: TimeGroup = !item.dueDate
      ? "undated"
      : item.dueDate < todayKey
        ? "overdue"
        : item.dueDate === todayKey
          ? "today"
          : item.dueDate <= upcomingEnd
            ? "upcoming"
            : "later";
    groups.get(key)?.push(item);
  }

  return timeGroupOrder
    .map((key) => ({ key, items: groups.get(key) ?? [] }))
    .filter((group) => group.items.length > 0);
}
