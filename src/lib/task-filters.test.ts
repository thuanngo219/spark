import { describe, expect, it } from "vitest";
import { addCalendarDays, getLocalDateKey } from "@/lib/dates";
import { filterItems, filterItemsByDisplayMode, getSidebarCounts, groupItemsByTime, inactiveForView, sortItemsForDisplay } from "@/lib/task-filters";
import type { Project, SparkItem, View } from "@/lib/types";

const item = (overrides: Partial<SparkItem>): SparkItem => ({
  id: crypto.randomUUID(),
  type: "task",
  title: "Test",
  description: null,
  dueDate: null,
  projectId: null,
  completedAt: null,
  archivedAt: null,
  isImportant: false,
  isUrgent: false,
  createdAt: "2026-08-19T00:00:00.000Z",
  ...overrides,
});

describe("date helpers", () => {
  it("moves through month, year and leap-year boundaries", () => {
    expect(addCalendarDays("2026-01-31", 1)).toBe("2026-02-01");
    expect(addCalendarDays("2026-12-31", 1)).toBe("2027-01-01");
    expect(addCalendarDays("2028-02-28", 1)).toBe("2028-02-29");
  });

  it("uses the configured calendar day around midnight", () => {
    expect(
      getLocalDateKey(new Date("2026-08-18T17:30:00.000Z"), "Asia/Ho_Chi_Minh"),
    ).toBe("2026-08-19");
  });
});

describe("master filters", () => {
  const today = "2026-08-19";
  const items = [
    item({ id: "overdue", dueDate: "2026-08-18" }),
    item({ id: "today", dueDate: today }),
    item({ id: "tomorrow", dueDate: "2026-08-20" }),
    item({ id: "day-three", dueDate: "2026-08-22" }),
    item({ id: "day-four", dueDate: "2026-08-23" }),
    item({ id: "undated" }),
    item({ id: "undated-note", type: "note" }),
    item({ id: "done", dueDate: today, completedAt: "2026-08-19T04:00:00Z" }),
    item({ id: "note", type: "note", dueDate: today, completedAt: null }),
    item({ id: "archived-note", type: "note", archivedAt: "2026-08-19T05:00:00Z" }),
  ];

  it("includes overdue, today and notes in Today, but not completed tasks", () => {
    expect(filterItems(items, { type: "today" }, today).map((entry) => entry.id)).toEqual([
      "overdue",
      "today",
      "note",
      "undated-note",
    ]);
  });

  it("Upcoming includes exactly the next three calendar dates", () => {
    expect(filterItems(items, { type: "upcoming" }, today).map((entry) => entry.id)).toEqual([
      "tomorrow",
      "day-three",
    ]);
  });

  it("computes sidebar counts in one pass with the same visibility rules", () => {
    expect(getSidebarCounts(items, today)).toEqual({
      today: 4,
      upcoming: 2,
      all: 8,
    });
  });

  it("project keeps undated tasks before the note section", () => {
    const projectItems = items.map((entry) => ({ ...entry, projectId: "p1" }));
    const result = filterItems(projectItems, { type: "project", projectId: "p1" }, today);
    expect(result.map((entry) => entry.id).slice(-3)).toEqual(["undated", "note", "undated-note"]);
  });

  it("always lists tasks before notes while preserving date order within each type", () => {
    const mixedItems = [
      item({ id: "note-early", type: "note", dueDate: "2026-08-18", createdAt: "2026-08-18T01:00:00Z" }),
      item({ id: "task-late", dueDate: "2026-08-20", createdAt: "2026-08-18T03:00:00Z" }),
      item({ id: "task-early", dueDate: "2026-08-19", createdAt: "2026-08-18T02:00:00Z" }),
      item({ id: "note-late", type: "note", dueDate: "2026-08-21", createdAt: "2026-08-18T04:00:00Z" }),
    ];

    expect(sortItemsForDisplay(mixedItems).map((entry) => entry.id)).toEqual([
      "task-early",
      "task-late",
      "note-early",
      "note-late",
    ]);
  });

  it("ranks items with both flags before urgent, important and normal items", () => {
    const rankedItems = [
      item({ id: "normal", dueDate: "2026-08-18" }),
      item({ id: "important", dueDate: "2026-08-20", isImportant: true }),
      item({ id: "urgent", dueDate: "2026-08-21", isUrgent: true }),
      item({ id: "urgent-and-important", dueDate: "2026-08-22", isImportant: true, isUrgent: true }),
    ];

    expect(sortItemsForDisplay(rankedItems).map((entry) => entry.id)).toEqual([
      "urgent-and-important",
      "urgent",
      "important",
      "normal",
    ]);
  });

  it("returns to the normal type and date order after attention flags are disabled", () => {
    const rankedItems = [
      item({ id: "normal", dueDate: "2026-08-18" }),
      item({ id: "important", dueDate: "2026-08-20", isImportant: true }),
      item({ id: "urgent", dueDate: "2026-08-21", isUrgent: true }),
    ];
    const flagsDisabled = rankedItems.map((entry) => ({
      ...entry,
      isImportant: false,
      isUrgent: false,
    }));

    expect(sortItemsForDisplay(flagsDisabled).map((entry) => entry.id)).toEqual([
      "normal",
      "important",
      "urgent",
    ]);
  });

  it("All includes every active item and groups it by time", () => {
    const allItems = filterItems(items, { type: "all" }, today);
    expect(allItems.map((entry) => entry.id)).toEqual([
      "overdue",
      "today",
      "tomorrow",
      "day-three",
      "day-four",
      "undated",
      "note",
      "undated-note",
    ]);
    expect(groupItemsByTime(allItems, today).map((group) => [group.key, group.items.map((entry) => entry.id)])).toEqual([
      ["overdue", ["overdue"]],
      ["today", ["today", "note"]],
      ["upcoming", ["tomorrow", "day-three"]],
      ["later", ["day-four"]],
      ["undated", ["undated", "undated-note"]],
    ]);
  });

  it("keeps archived notes out of active views and returns them with completed tasks", () => {
    expect(filterItems(items, { type: "all" }, today).some((entry) => entry.id === "archived-note")).toBe(false);
    expect(inactiveForView(items, { type: "today" }, today).map((entry) => entry.id)).toEqual([
      "done",
      "archived-note",
    ]);
  });
});

describe("smart filters", () => {
  it("allows independent important and urgent flags", () => {
    const both = item({ id: "both", isImportant: true, isUrgent: true });
    expect(filterItems([both], { type: "important" }, "2026-08-19")).toHaveLength(1);
    expect(filterItems([both], { type: "urgent" }, "2026-08-19")).toHaveLength(1);
  });
});

describe("archived project visibility", () => {
  const today = "2026-08-26";
  const project: Project = { id: "archived-project", name: "Archived", color: "#44D4CD", isStarred: true, archivedAt: "2026-08-25T00:00:00Z" };
  const masterViews: View[] = [{ type: "today" }, { type: "upcoming" }, { type: "calendar", date: "2026-08-27" }, { type: "all" }];

  it.each(masterViews)("excludes every archived-project item from $type, including inactive items", (view) => {
    const dueDate = view.type === "upcoming" || view.type === "calendar" ? "2026-08-27" : today;
    const visible = [
      item({ id: "task", dueDate, projectId: "active-project" }),
      item({ id: "note", dueDate, type: "note" }),
      item({ id: "done", dueDate, completedAt: "2026-08-26T01:00:00Z" }),
      item({ id: "archived-note", dueDate, type: "note", archivedAt: "2026-08-25T01:00:00Z" }),
    ];
    const hidden = visible.map((entry) => ({ ...entry, id: `hidden-${entry.id}`, projectId: project.id }));
    const items = [...visible, ...hidden];
    const before = structuredClone(items);
    const active = filterItems(items, view, today, [project]);
    const inactive = inactiveForView(items, view, today, [project]);
    expect(active.map((entry) => entry.id)).toEqual(["task", "note"]);
    expect(inactive.map((entry) => entry.id)).toEqual(["done", "archived-note"]);
    expect(filterItemsByDisplayMode(active, "task")).toHaveLength(1);
    expect(filterItemsByDisplayMode(active, "note")).toHaveLength(1);
    const restored = [{ ...project, archivedAt: null }];
    expect(filterItems(items, view, today, restored)).toHaveLength(4);
    expect(inactiveForView(items, view, today, restored)).toHaveLength(4);
    expect(items).toEqual(before);
  });

  it.each<View>([{ type: "project", projectId: project.id }, { type: "important" }, { type: "urgent" }])("keeps archived-project items accessible in $type", (view) => {
    const items = [
      item({ id: "task", projectId: project.id, isImportant: true, isUrgent: true }),
      item({ id: "note", type: "note", projectId: project.id, isImportant: true, isUrgent: true, archivedAt: "2026-08-25T01:00:00Z" }),
    ];
    expect(filterItems(items, view, today, [project]).map((entry) => entry.id)).toEqual(["task"]);
    expect(inactiveForView(items, view, today, [project]).map((entry) => entry.id)).toEqual(["note"]);
  });
});

describe("Today completed tasks", () => {
  const today = "2026-08-26";

  it("uses completion day, not due date, including undated and future-due tasks", () => {
    const items = [
      item({ id: "yesterday", dueDate: today, completedAt: "2026-08-25T01:00:00Z" }),
      item({ id: "overdue-done-today", dueDate: "2026-08-20", completedAt: "2026-08-26T01:00:00Z" }),
      item({ id: "future-done-today", dueDate: "2026-08-30", completedAt: "2026-08-26T01:00:00Z" }),
      item({ id: "undated-done-today", completedAt: "2026-08-26T01:00:00Z" }),
      item({ id: "invalid", dueDate: today, completedAt: "invalid" }),
    ];
    expect(inactiveForView(items, { type: "today" }, today).map((entry) => entry.id)).toEqual(["overdue-done-today", "future-done-today", "undated-done-today"]);
    expect(inactiveForView(items, { type: "all" }, today)).toHaveLength(5);
    expect(filterItems(items, { type: "today" }, today)).toEqual([]);
  });

  it("respects both midnight boundaries in Asia/Ho_Chi_Minh", () => {
    const items = [
      item({ id: "before", dueDate: today, completedAt: "2026-08-25T16:59:59.999Z" }),
      item({ id: "start", dueDate: today, completedAt: "2026-08-25T17:00:00.000Z" }),
      item({ id: "end", dueDate: today, completedAt: "2026-08-26T16:59:59.999Z" }),
      item({ id: "after", dueDate: today, completedAt: "2026-08-26T17:00:00.000Z" }),
    ];
    expect(inactiveForView(items, { type: "today" }, today).map((entry) => entry.id)).toEqual(["start", "end"]);
    expect(inactiveForView(items, { type: "today" }, "2026-08-27").map((entry) => entry.id)).toEqual(["after"]);
  });

  it("preserves due-date rules for inactive items in other views and for archived notes", () => {
    const items = [
      item({ id: "older-task", dueDate: today, completedAt: "2026-08-25T01:00:00Z" }),
      item({ id: "older-note", type: "note", archivedAt: "2026-08-25T01:00:00Z" }),
      item({ id: "future-note", type: "note", dueDate: "2026-08-27", archivedAt: "2026-08-25T01:00:00Z" }),
    ];
    expect(inactiveForView(items, { type: "today" }, today).map((entry) => entry.id)).toEqual(["older-note"]);
    expect(inactiveForView(items, { type: "calendar", date: today }, today).map((entry) => entry.id)).toEqual(["older-task"]);
    expect(inactiveForView(items, { type: "upcoming" }, today).map((entry) => entry.id)).toEqual(["future-note"]);
    expect(inactiveForView(items, { type: "all" }, today)).toHaveLength(3);
  });
});

describe("item display mode", () => {
  const items = [
    item({ id: "task" }),
    item({ id: "note", type: "note" }),
  ];

  it("switches between all items, tasks and notes without mutating data", () => {
    expect(filterItemsByDisplayMode(items, "all")).toEqual(items);
    expect(filterItemsByDisplayMode(items, "task").map((entry) => entry.id)).toEqual(["task"]);
    expect(filterItemsByDisplayMode(items, "note").map((entry) => entry.id)).toEqual(["note"]);
    expect(items).toHaveLength(2);
  });
});
