import { addCalendarDays, getLocalDateKey } from "@/lib/dates";
import type { Project, SparkItem, View } from "@/lib/types";

export type TimeGroup = "overdue" | "today" | "upcoming" | "later" | "undated";
export type ItemDisplayMode = "all" | "task" | "note";

const timeGroupOrder: TimeGroup[] = ["overdue", "today", "upcoming", "later", "undated"];

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

function matchesView(item: SparkItem, view: View, todayKey: string, bounds: DateBounds): boolean {
  switch (view.type) {
    case "today":
      if (item.type === "task" && item.completedAt) {
        const completedDate = new Date(item.completedAt);
        return !Number.isNaN(completedDate.getTime()) && getLocalDateKey(completedDate) === todayKey;
      }
      if (!item.dueDate) return item.type === "task";
      return item.dueDate <= todayKey;
    case "upcoming":
      return Boolean(
        item.dueDate &&
          item.dueDate >= bounds.upcomingStart &&
          item.dueDate <= bounds.upcomingEnd,
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
}

function filterByProjectVisibility(items: SparkItem[], view: View, projects: Project[]): SparkItem[] {
  // Archived projects remain accessible in their own view and the smart filters.
  if (view.type === "project" || view.type === "important" || view.type === "urgent") return items;
  const archivedIds = new Set(projects.filter((project) => project.archivedAt).map((project) => project.id));
  return items.filter((item) => !item.projectId || !archivedIds.has(item.projectId));
}

function getAttentionRank(item: SparkItem): number {
  if (item.isUrgent && item.isImportant) return 0;
  if (item.isUrgent) return 1;
  if (item.isImportant) return 2;
  return 3;
}

export function sortItemsForDisplay(items: SparkItem[]): SparkItem[] {
  return [...items].sort((a, b) => {
    const attentionDifference = getAttentionRank(a) - getAttentionRank(b);
    if (attentionDifference !== 0) return attentionDifference;
    if (a.type !== b.type) return a.type === "task" ? -1 : 1;
    if (!a.dueDate && !b.dueDate) return a.createdAt.localeCompare(b.createdAt);
    if (!a.dueDate) return 1;
    if (!b.dueDate) return -1;
    return a.dueDate.localeCompare(b.dueDate) || a.createdAt.localeCompare(b.createdAt);
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

  const filtered = active.filter((item) => matchesView(item, view, todayKey, bounds));

  return sortItemsForDisplay(filtered);
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
    .map((key) => ({ key, items: sortItemsForDisplay(groups.get(key) ?? []) }))
    .filter((group) => group.items.length > 0);
}
