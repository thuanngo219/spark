import { describe, expect, it } from "vitest";
import { addCalendarDays, formatListDate, getLocalDateKey } from "@/lib/dates";
import { filterItems, filterItemsByDisplayMode, getSidebarCounts, groupItemsByTime, inactiveForView, sortItemsForDisplay } from "@/lib/task-filters";
import type { Project, SparkItem, View } from "@/lib/types";

const item = (overrides: Partial<SparkItem>): SparkItem => ({
  id: crypto.randomUUID(),
  type: "task",
  title: "Test",
  description: null,
  startDate: null,
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

  it("formats list dates compactly and adds the year only when it differs", () => {
    expect(formatListDate("2026-09-03", "2026-09-04")).toBe("Hôm qua");
    expect(formatListDate("2026-09-04", "2026-09-04")).toBe("Hôm nay");
    expect(formatListDate("2026-09-05", "2026-09-04")).toBe("Ngày mai");
    expect(formatListDate("2026-09-06", "2026-09-04")).toBe("06.09");
    expect(formatListDate("2025-12-31", "2026-09-04")).toBe("31.12.25");
    expect(formatListDate("2027-01-01", "2026-09-04")).toBe("01.01.27");
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

  it("includes overdue and today items plus undated tasks in Today, but excludes undated notes", () => {
    expect(filterItems(items, { type: "today" }, today).map((entry) => entry.id)).toEqual([
      "overdue",
      "today",
      "undated",
      "note",
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

  it("returns all active project items without including other projects", () => {
    const projectItems = items.map((entry) => ({ ...entry, projectId: "p1" }));
    const result = filterItems([...projectItems, item({ id: "other-project", projectId: "p2" })], { type: "project", projectId: "p1" }, today);
    expect(result.map((entry) => entry.id).sort()).toEqual([
      "overdue", "today", "tomorrow", "day-three", "day-four", "undated", "undated-note", "note",
    ].sort());
  });

  it("keeps task first then note khi cùng mức ưu tiên và cùng tiêu đề", () => {
    const mixedItems = [
      item({ id: "note", title: "A item", type: "note", dueDate: "2026-08-20" }),
      item({ id: "task-late", title: "A item", type: "task", dueDate: "2026-08-22" }),
      item({ id: "task-early", title: "A item", type: "task", dueDate: "2026-08-21" }),
    ];

    expect(sortItemsForDisplay(mixedItems, { field: "attention", direction: "asc" }).map((entry) => entry.id)).toEqual([
      "task-early",
      "task-late",
      "note",
    ]);
  });

  it("ranks items with both flags before important, urgent and normal items", () => {
    const rankedItems = [
      item({ id: "normal", dueDate: "2026-08-18" }),
      item({ id: "important", dueDate: "2026-08-20", isImportant: true }),
      item({ id: "urgent", dueDate: "2026-08-21", isUrgent: true }),
      item({ id: "urgent-and-important", dueDate: "2026-08-22", isImportant: true, isUrgent: true }),
    ];

    expect(sortItemsForDisplay(rankedItems).map((entry) => entry.id)).toEqual([
      "urgent-and-important",
      "important",
      "urgent",
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
    expect(allItems.map((entry) => entry.id).sort()).toEqual([
      "overdue",
      "today",
      "tomorrow",
      "day-three",
      "day-four",
      "undated",
      "undated-note",
      "note",
    ].sort());
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

describe("start and due date behavior", () => {
  const today = "2026-09-03";

  it("shows overdue, in-progress, due-today and fully undated tasks in Today", () => {
    const items = [
      item({ id: "overdue", startDate: "2026-09-01", dueDate: "2026-09-02" }),
      item({ id: "in-progress", startDate: "2026-09-01", dueDate: "2026-09-10" }),
      item({ id: "open-ended", startDate: "2026-09-01" }),
      item({ id: "due-today", dueDate: today }),
      item({ id: "future", startDate: "2026-09-04", dueDate: "2026-09-10" }),
      item({ id: "undated-task" }),
      item({ id: "undated-note", type: "note" }),
    ];

    expect(filterItems(items, { type: "today" }, today).map((entry) => entry.id).sort()).toEqual([
      "overdue",
      "in-progress",
      "open-ended",
      "due-today",
      "undated-task",
    ].sort());
  });

  it("matches Upcoming and Theo ngày by either start or due date without duplicates", () => {
    const items = [
      item({ id: "starts-tomorrow", startDate: "2026-09-04", dueDate: "2026-09-20" }),
      item({ id: "due-day-three", startDate: "2026-09-01", dueDate: "2026-09-06" }),
      item({ id: "both", startDate: "2026-09-05", dueDate: "2026-09-05" }),
      item({ id: "later", startDate: "2026-09-07" }),
    ];

    expect(filterItems(items, { type: "upcoming" }, today).map((entry) => entry.id).sort()).toEqual([
      "starts-tomorrow",
      "due-day-three",
      "both",
    ].sort());
    expect(filterItems(items, { type: "calendar", date: "2026-09-05" }, today).map((entry) => entry.id)).toEqual(["both"]);
  });

  it("groups All by overdue, today, ongoing, future and fully undated lifecycle", () => {
    const groups = groupItemsByTime([
      item({ id: "overdue", startDate: "2026-09-01", dueDate: "2026-09-02" }),
      item({ id: "today", startDate: today, dueDate: "2026-09-20" }),
      item({ id: "active", startDate: "2026-09-01", dueDate: "2026-09-20" }),
      item({ id: "upcoming", startDate: "2026-09-04", dueDate: "2026-09-20" }),
      item({ id: "later", startDate: "2026-09-10" }),
      item({ id: "undated" }),
    ], today);

    expect(groups.map((group) => [group.key, group.items.map((entry) => entry.id)])).toEqual([
      ["overdue", ["overdue"]],
      ["today", ["today"]],
      ["ongoing", ["active"]],
      ["upcoming", ["upcoming"]],
      ["later", ["later"]],
      ["undated", ["undated"]],
    ]);
  });

  it("sorts A-Z/Z-A and keeps blank dates last in both directions", () => {
    const items = [
      item({ id: "blank", title: "Không ngày" }),
      item({ id: "later", title: "Banana", startDate: "2026-09-05" }),
      item({ id: "earlier", title: "Áo", startDate: "2026-09-04" }),
    ];

    expect(sortItemsForDisplay(items, { field: "title", direction: "asc" }).map((entry) => entry.id)).toEqual(["earlier", "later", "blank"]);
    expect(sortItemsForDisplay(items, { field: "title", direction: "desc" }).map((entry) => entry.id)).toEqual(["blank", "later", "earlier"]);
    expect(sortItemsForDisplay(items, { field: "startDate", direction: "asc" }).map((entry) => entry.id)).toEqual(["earlier", "later", "blank"]);
    expect(sortItemsForDisplay(items, { field: "startDate", direction: "desc" }).map((entry) => entry.id)).toEqual(["later", "earlier", "blank"]);
  });

  it("sorts completed and archived rows by their own status time", () => {
    const items = [
      item({ id: "older-task", completedAt: "2026-09-03T01:00:00Z" }),
      item({ id: "newer-note", type: "note", archivedAt: "2026-09-03T02:00:00Z" }),
    ];

    expect(sortItemsForDisplay(items, { field: "statusDate", direction: "desc" }).map((entry) => entry.id)).toEqual(["older-task", "newer-note"]);
  });
});

describe.each(["asc", "desc"] as const)("section sorting (%s)", (direction) => {
  const ids = (items: SparkItem[]) => items.map((entry) => entry.id);

  it.each(["attention", "title", "startDate", "dueDate", "statusDate"] as const)("keeps every task before every note when sorting by %s", (field) => {
    const task = item({ id: "task", title: "M", startDate: "2026-09-06", dueDate: "2026-09-06", completedAt: "2026-09-06T12:00:00Z" });
    const earlierNote = item({ id: "early-note", type: "note", title: "A", isImportant: true, isUrgent: true, startDate: "2026-09-01", dueDate: "2026-09-01", archivedAt: "2026-09-01T12:00:00Z" });
    const laterNote = item({ id: "late-note", type: "note", title: "Z", startDate: "2026-09-10", dueDate: "2026-09-10", archivedAt: "2026-09-10T12:00:00Z" });
    const result = sortItemsForDisplay([earlierNote, laterNote, task], { field, direction });
    expect(result[0].id).toBe("task");
    expect(result.slice(1).every((entry) => entry.type === "note")).toBe(true);
  });

  it("keeps attention tiers fixed and sorts due dates before titles within each tier", () => {
    const flags = [
      { isImportant: true, isUrgent: true },
      { isImportant: true },
      { isUrgent: true },
      {},
    ];
    const entries = flags.flatMap((flag, tier) => [
      item({ id: `${tier}-late`, title: "A", dueDate: "2026-09-10", ...flag }),
      item({ id: `${tier}-blank`, title: "A", ...flag }),
      item({ id: `${tier}-early-z`, title: "Z", dueDate: "2026-09-01", ...flag }),
      item({ id: `${tier}-early-a`, title: "A", dueDate: "2026-09-01", ...flag }),
    ]).reverse();
    const expected = flags.flatMap((_, tier) => direction === "asc"
      ? [`${tier}-early-a`, `${tier}-early-z`, `${tier}-late`, `${tier}-blank`]
      : [`${tier}-late`, `${tier}-early-a`, `${tier}-early-z`, `${tier}-blank`]);
    expect(ids(sortItemsForDisplay(entries, { field: "attention", direction }))).toEqual(expected);
  });

  it.each(["startDate", "dueDate", "statusDate"] as const)("sorts %s in each type and keeps null last", (field) => {
    const entries = (["task", "note"] as const).flatMap((type) => [
      ["blank", null], ["early", "2026-09-01"], ["late", "2026-09-10"],
    ].map(([label, date]) => item({
      id: `${type}-${label}`, type,
      ...(field === "statusDate"
        ? { [type === "task" ? "completedAt" : "archivedAt"]: date && `${date}T12:00:00Z` }
        : { [field]: date }),
    })));
    const withinType = direction === "asc" ? ["early", "late", "blank"] : ["late", "early", "blank"];
    expect(ids(sortItemsForDisplay(entries.reverse(), { field, direction }))).toEqual(
      ["task", "note"].flatMap((type) => withinType.map((label) => `${type}-${label}`)),
    );
  });

  it.each(["startDate", "dueDate", "statusDate"] as const)("breaks equal %s by name A-Z even when direction is descending", (field) => {
    const entries = ["Z", "A"].map((title) => item({ title, id: title, startDate: "2026-09-06", dueDate: "2026-09-06", completedAt: "2026-09-06T12:00:00Z" }));
    expect(ids(sortItemsForDisplay(entries, { field, direction }))).toEqual(["A", "Z"]);
  });

  it.each(["startDate", "statusDate", "title"] as const)("breaks equal %s and title by due date ascending, null last", (field) => {
    const entries = [
      item({ id: "late", dueDate: "2026-09-10" }),
      item({ id: "blank" }),
      item({ id: "early", dueDate: "2026-09-01" }),
    ];
    expect(ids(sortItemsForDisplay(entries, { field, direction }))).toEqual(["early", "late", "blank"]);
  });

  it("uses creation time then ID for full ties without mutating the input", () => {
    const entries = [
      item({ id: "z", createdAt: "2026-09-02T00:00:00Z" }),
      item({ id: "a", createdAt: "2026-09-02T00:00:00Z" }),
      item({ id: "older", createdAt: "2026-09-01T00:00:00Z" }),
    ];
    const snapshot = structuredClone(entries);
    expect(ids(sortItemsForDisplay(entries, { field: "title", direction }))).toEqual(["older", "a", "z"]);
    expect(entries).toEqual(snapshot);
    expect(ids(sortItemsForDisplay([...entries].reverse(), { field: "title", direction }))).toEqual(["older", "a", "z"]);
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
    expect(inactive.map((entry) => entry.id)).toEqual(view.type === "today" ? ["done"] : ["done", "archived-note"]);
    expect(filterItemsByDisplayMode(active, "task")).toHaveLength(1);
    expect(filterItemsByDisplayMode(active, "note")).toHaveLength(1);
    const restored = [{ ...project, archivedAt: null }];
    expect(filterItems(items, view, today, restored)).toHaveLength(4);
    expect(inactiveForView(items, view, today, restored)).toHaveLength(view.type === "today" ? 2 : 4);
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

describe("Today inactive items", () => {
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
    expect(inactiveForView(items, { type: "today" }, today).map((entry) => entry.id).sort()).toEqual(["end", "start"]);
    expect(inactiveForView(items, { type: "today" }, "2026-08-27").map((entry) => entry.id)).toEqual(["after"]);
  });

  it("uses archive day for notes in Today instead of due date", () => {
    const items = [
      item({ id: "older-task", dueDate: today, completedAt: "2026-08-25T01:00:00Z" }),
      item({ id: "older-note", type: "note", dueDate: today, archivedAt: "2026-08-25T01:00:00Z" }),
      item({ id: "overdue-note", type: "note", dueDate: "2026-08-20", archivedAt: "2026-08-26T01:00:00Z" }),
      item({ id: "future-note", type: "note", dueDate: "2026-08-27", archivedAt: "2026-08-26T01:00:00Z" }),
      item({ id: "undated-note", type: "note", archivedAt: "2026-08-26T01:00:00Z" }),
      item({ id: "invalid-note", type: "note", archivedAt: "invalid" }),
    ];
    expect(inactiveForView(items, { type: "today" }, today).map((entry) => entry.id)).toEqual([
      "overdue-note",
      "future-note",
      "undated-note",
    ]);
    expect(inactiveForView(items, { type: "calendar", date: today }, today).map((entry) => entry.id)).toEqual(["older-task", "older-note"]);
    expect(inactiveForView(items, { type: "upcoming" }, today).map((entry) => entry.id)).toEqual(["future-note"]);
    expect(inactiveForView(items, { type: "all" }, today)).toHaveLength(6);
  });

  it("respects archive-day midnight boundaries in Asia/Ho_Chi_Minh", () => {
    const items = [
      item({ id: "before", type: "note", archivedAt: "2026-08-25T16:59:59.999Z" }),
      item({ id: "start", type: "note", archivedAt: "2026-08-25T17:00:00.000Z" }),
      item({ id: "end", type: "note", archivedAt: "2026-08-26T16:59:59.999Z" }),
      item({ id: "after", type: "note", archivedAt: "2026-08-26T17:00:00.000Z" }),
    ];
    expect(inactiveForView(items, { type: "today" }, today).map((entry) => entry.id).sort()).toEqual(["end", "start"]);
    expect(inactiveForView(items, { type: "today" }, "2026-08-27").map((entry) => entry.id)).toEqual(["after"]);
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
