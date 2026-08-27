import { describe, expect, it } from "vitest";
import { reorderProjectsForDrop } from "@/lib/project-order";
import type { Project } from "@/lib/types";

const projects: Project[] = [
  { id: "a", name: "A", color: "#44D4CD", isStarred: false, archivedAt: null, position: 0 },
  { id: "b", name: "B", color: "#8951C7", isStarred: false, archivedAt: null, position: 1 },
  { id: "c", name: "C", color: "#D9776A", isStarred: false, archivedAt: null, position: 2 },
  { id: "starred", name: "Starred", color: "#65458A", isStarred: true, archivedAt: null, position: 3 },
];

describe("project drop order", () => {
  it("inserts before the target and normalizes positions", () => {
    const result = reorderProjectsForDrop(projects, "c", "a", "before");
    expect(result?.map((project) => project.id)).toEqual(["c", "a", "b", "starred"]);
    expect(result?.map((project) => project.position)).toEqual([0, 1, 2, 3]);
  });

  it("inserts after the target when moving downward", () => {
    const result = reorderProjectsForDrop(projects, "a", "c", "after");
    expect(result?.map((project) => project.id)).toEqual(["b", "c", "a", "starred"]);
  });

  it("rejects drops across starred and regular groups", () => {
    expect(reorderProjectsForDrop(projects, "a", "starred", "before")).toBeNull();
  });
});
