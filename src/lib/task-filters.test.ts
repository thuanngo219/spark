import { describe, expect, it } from "vitest";
import { addCalendarDays, getLocalDateKey } from "@/lib/dates";
import { filterItems, groupItemsByTime, sortItemsForDisplay } from "@/lib/task-filters";
import type { SparkItem } from "@/lib/types";

const item = (overrides: Partial<SparkItem>): SparkItem => ({
  id: crypto.randomUUID(),
  type: "task",
  title: "Test",
  dueDate: null,
  projectId: null,
  completedAt: null,
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
    item({ id: "done", dueDate: today, completedAt: "2026-08-19T04:00:00Z" }),
    item({ id: "note", type: "note", dueDate: today, completedAt: null }),
  ];

  it("includes overdue, today and notes in Today, but not completed tasks", () => {
    expect(filterItems(items, { type: "today" }, today).map((entry) => entry.id)).toEqual([
      "overdue",
      "today",
      "note",
    ]);
  });

  it("Upcoming includes exactly the next three calendar dates", () => {
    expect(filterItems(items, { type: "upcoming" }, today).map((entry) => entry.id)).toEqual([
      "tomorrow",
      "day-three",
    ]);
  });

  it("project keeps undated tasks before the note section", () => {
    const projectItems = items.map((entry) => ({ ...entry, projectId: "p1" }));
    const result = filterItems(projectItems, { type: "project", projectId: "p1" }, today);
    expect(result.map((entry) => entry.id).slice(-2)).toEqual(["undated", "note"]);
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
    ]);
    expect(groupItemsByTime(allItems, today).map((group) => [group.key, group.items.map((entry) => entry.id)])).toEqual([
      ["overdue", ["overdue"]],
      ["today", ["today", "note"]],
      ["upcoming", ["tomorrow", "day-three"]],
      ["later", ["day-four"]],
      ["undated", ["undated"]],
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
