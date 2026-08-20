import { describe, expect, it } from "vitest";
import { resolveStandaloneShortcut } from "./keyboard-shortcuts";

describe("standalone keyboard shortcuts", () => {
  it.each(["n", "N"])("opens a new task for %s", (key) => {
    expect(resolveStandaloneShortcut(key)).toBe("new-task");
  });

  it("keeps the existing sidebar and help shortcuts", () => {
    expect(resolveStandaloneShortcut("[")).toBe("toggle-sidebar");
    expect(resolveStandaloneShortcut("?")).toBe("help");
  });

  it("ignores unrelated keys", () => {
    expect(resolveStandaloneShortcut("x")).toBeNull();
  });
});
