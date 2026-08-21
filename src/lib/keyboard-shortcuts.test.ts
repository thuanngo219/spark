import { describe, expect, it } from "vitest";
import { resolveProjectShortcut, resolveStandaloneShortcut } from "./keyboard-shortcuts";

describe("standalone keyboard shortcuts", () => {
  it.each(["n", "N"])("opens a new task for %s", (key) => {
    expect(resolveStandaloneShortcut(key)).toBe("new-task");
  });

  it("keeps the existing sidebar and help shortcuts", () => {
    expect(resolveStandaloneShortcut("[")).toBe("toggle-sidebar");
    expect(resolveStandaloneShortcut("?")).toBe("help");
  });

  it.each([
    ["t", "today"],
    ["S", "upcoming"],
    ["d", "calendar"],
    ["A", "all"],
    ["i", "important"],
    ["U", "urgent"],
  ] as const)("maps %s directly to %s", (key, expected) => {
    expect(resolveStandaloneShortcut(key)).toBe(expected);
  });

  it("maps number keys directly to projects", () => {
    expect(resolveProjectShortcut("1")).toBe(0);
    expect(resolveProjectShortcut("9")).toBe(8);
    expect(resolveProjectShortcut("0")).toBeNull();
  });

  it("ignores unrelated keys", () => {
    expect(resolveStandaloneShortcut("x")).toBeNull();
  });
});
