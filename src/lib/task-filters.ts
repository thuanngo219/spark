import { addCalendarDays, getLocalDateKey } from "@/lib/dates";
import type { Project, SparkItem, View } from "@/lib/types";

export type TimeGroup = "overdue" | "today" | "ongoing" | "upcoming" | "later" | "undated";
export type ItemDisplayMode = "all" | "task" | "note";
export type ItemSortField =
  | "attention"
  | "title"
  | "startDate"
  | "dueDate"
  | "statusDate";
export type SortDirection = "asc" | "desc";
export type ItemSortPreference = {
  field: ItemSortField;
  direction: SortDirection;
};

const timeGroupOrder: TimeGroup[] = ["overdue", "today", "ongoing", "upcoming", "later", "undated"];
const titleCollator = new Intl.Collator("vi", { sensitivity: "base", numeric: true });

export const DEFAULT_ITEM_SORT: ItemSortPreference = {
  field: "attention",
  direction: "asc",
};

export function isActive(item: SparkItem): boolean {
  return item.type === "note" ? !item.archivedAt : !item.completedAt;
}

export function filterItemsByDisplayMode(
  items: SparkItem[],
  mode: ItemDisplayMode,
): SparkItem[] {
  return mode === "all" ? items : items.filter((item) => item.type === mode);
}

type DateBounds = { upcomingStart: string; upcomingEnd: string };

function getDateBounds(todayKey: string): DateBounds {
  return {
    upcomingStart: addCalendarDays(todayKey, 1),
    upcomingEnd: addCalendarDays(todayKey, 3),
  };
}

function dateFallsWithin(
  date: string | null,
  start: string,
  end: string,
) {
  return Boolean(date && date >= start && date <= end);
}

function isToday(item: SparkItem, todayKey: string) {
  return item.startDate === todayKey || item.dueDate === todayKey;
}

function isOngoing(item: SparkItem, todayKey: string) {
  return Boolean(
    item.startDate &&
      item.startDate < todayKey &&
      (!item.dueDate || item.dueDate > todayKey),
  );
}

function matchesView(item: SparkItem, view: View, todayKey: string, bounds: DateBounds): boolean {
  switch (view.type) {
    case "today": {
      const inactiveAt = item.type === "task" ? item.completedAt : item.archivedAt;
      if (inactiveAt) {
        const inactiveDate = new Date(inactiveAt);
        return !Number.isNaN(inactiveDate.getTime()) && getLocalDateKey(inactiveDate) === todayKey;
      }
      if (item.dueDate && item.dueDate < todayKey) return true;
      if (!item.startDate && !item.dueDate) return item.type === "task";
      return isToday(item, todayKey) || isOngoing(item, todayKey);
    }
    case "upcoming":
      return dateFallsWithin(item.startDate, bounds.upcomingStart, bounds.upcomingEnd) ||
        dateFallsWithin(item.dueDate, bounds.upcomingStart, bounds.upcomingEnd);
    case "calendar":
      return item.startDate === view.date || item.dueDate === view.date;
    case "all":
      return true;
    case "important":
      return item.isImportant;
    case "urgent":
      return item.isUrgent;
    case "project":
      return item.projectId === view.projectId;
  }
}

function filterByProjectVisibility(items: SparkItem[], view: View, projects: Project[]): SparkItem[] {
  if (view.type === "project" || view.type === "important" || view.type === "urgent") return items;
  const archivedIds = new Set(projects.filter((project) => project.archivedAt).map((project) => project.id));
  return items.filter((item) => !item.projectId || !archivedIds.has(item.projectId));
}

function getAttentionRank(item: SparkItem): number {
  if (item.isImportant && item.isUrgent) return 0;
  if (item.isImportant) return 1;
  if (item.isUrgent) return 2;
  return 3;
}

function getSortValue(item: SparkItem, field: Exclude<ItemSortField, "attention">): string | null {
  if (field === "title") return item.title;
  if (field === "startDate") return item.startDate;
  if (field === "dueDate") return item.dueDate;
  return item.type === "task" ? item.completedAt : item.archivedAt;
}

function compareItemType(a: SparkItem, b: SparkItem): number {
  const aTypeRank = a.type === "task" ? 0 : 1;
  const bTypeRank = b.type === "task" ? 0 : 1;
  return aTypeRank - bTypeRank;
}

function compareSortValues(
  left: string | null,
  right: string | null,
  direction: SortDirection,
) {
  if (left === null && right === null) return 0;
  if (left === null) return 1;
  if (right === null) return -1;
  const result = titleCollator.compare(left, right);
  return direction === "desc" ? -result : result;
}

export function sortItemsForDisplay(
  items: SparkItem[],
  preference: ItemSortPreference = DEFAULT_ITEM_SORT,
): SparkItem[] {
  return [...items].sort((a, b) => {
    const byType = compareItemType(a, b);
    if (byType !== 0) return byType;
    // Attention tiers stay fixed; direction only changes due dates within a tier.
    if (preference.field === "attention") {
      const byAttention = getAttentionRank(a) - getAttentionRank(b);
      if (byAttention !== 0) return byAttention;
    }
    const field = preference.field === "attention" ? "dueDate" : preference.field;
    const primary = compareSortValues(
      getSortValue(a, field),
      getSortValue(b, field),
      preference.direction,
    );
    if (primary !== 0) return primary;
    const byTitle = titleCollator.compare(a.title, b.title);
    if (byTitle !== 0) return byTitle;
    const byDueDate = compareSortValues(a.dueDate, b.dueDate, "asc");
    if (byDueDate !== 0) return byDueDate;
    return a.createdAt.localeCompare(b.createdAt) || a.id.localeCompare(b.id);
  });
}

export function filterItems(
  items: SparkItem[],
  view: View,
  todayKey: string,
  projects: Project[] = [],
): SparkItem[] {
  const bounds = getDateBounds(todayKey);
  const active = filterByProjectVisibility(items, view, projects).filter(isActive);
  return sortItemsForDisplay(active.filter((item) => matchesView(item, view, todayKey, bounds)));
}

export function inactiveForView(
  items: SparkItem[],
  view: View,
  todayKey: string,
  projects: Project[] = [],
): SparkItem[] {
  const bounds = getDateBounds(todayKey);
  return sortItemsForDisplay(filterByProjectVisibility(items, view, projects).filter((item) => {
    const inactive = item.type === "task" ? Boolean(item.completedAt) : Boolean(item.archivedAt);
    return inactive && matchesView(item, view, todayKey, bounds);
  }));
}

export function getSidebarCounts(
  items: SparkItem[],
  todayKey: string,
  projects: Project[] = [],
) {
  const bounds = getDateBounds(todayKey);
  const archivedIds = new Set(
    projects.filter((project) => project.archivedAt).map((project) => project.id),
  );
  const counts = { today: 0, upcoming: 0, all: 0 };

  for (const item of items) {
    if (!isActive(item) || (item.projectId && archivedIds.has(item.projectId))) continue;
    counts.all += 1;
    if (matchesView(item, { type: "today" }, todayKey, bounds)) counts.today += 1;
    if (matchesView(item, { type: "upcoming" }, todayKey, bounds)) counts.upcoming += 1;
  }

  return counts;
}

export function groupItemsByTime(
  items: SparkItem[],
  todayKey: string,
): { key: TimeGroup; items: SparkItem[] }[] {
  const upcomingEnd = addCalendarDays(todayKey, 3);
  const groups = new Map<TimeGroup, SparkItem[]>(timeGroupOrder.map((key) => [key, []]));

  for (const item of items) {
    let key: TimeGroup;
    if (item.dueDate && item.dueDate < todayKey) {
      key = "overdue";
    } else if (isToday(item, todayKey)) {
      key = "today";
    } else if (isOngoing(item, todayKey)) {
      key = "ongoing";
    } else if (!item.startDate && !item.dueDate) {
      key = "undated";
    } else {
      const nextDate = [item.startDate, item.dueDate]
        .filter((date): date is string => Boolean(date && date > todayKey))
        .sort()[0];
      key = nextDate && nextDate <= upcomingEnd ? "upcoming" : "later";
    }
    groups.get(key)?.push(item);
  }

  return timeGroupOrder
    .map((key) => ({ key, items: groups.get(key) ?? [] }))
    .filter((group) => group.items.length > 0);
}
