import { describe, expect, it } from "vitest";
import { addCalendarDays, getLocalDateKey } from "@/lib/dates";
import { filterItems, groupItemsByTime } from "@/lib/task-filters";
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

  it("project keeps undated items last", () => {
    const projectItems = items.map((entry) => ({ ...entry, projectId: "p1" }));
    const result = filterItems(projectItems, { type: "project", projectId: "p1" }, today);
    expect(result.at(-1)?.id).toBe("undated");
  });

  it("All includes every active item and groups it by time", () => {
    const allItems = filterItems(items, { type: "all" }, today);
    expect(allItems.map((entry) => entry.id)).toEqual([
      "overdue",
      "today",
      "note",
      "tomorrow",
      "day-three",
      "day-four",
      "undated",
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
