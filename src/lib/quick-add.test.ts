import { expect, it } from "vitest";
import { defaultStartDate } from "./quick-add";
import type { View } from "./types";

it("only defaults a start date for a task created in Today", () => {
  const today = "2026-09-14";
  const views: View[] = [{ type: "today" }, { type: "upcoming" }, { type: "calendar", date: "2026-09-20" }, { type: "all" }, { type: "important" }, { type: "urgent" }, { type: "project", projectId: "p1" }];
  for (const view of views) {
    expect(defaultStartDate(view, "task", today)).toBe(view.type === "today" ? today : "");
    expect(defaultStartDate(view, "note", today)).toBe("");
  }
});
