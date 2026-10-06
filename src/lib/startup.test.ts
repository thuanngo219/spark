import { afterEach, describe, expect, it, vi } from "vitest";
import { removePristineDemoSeed, withStartupTimeout } from "./startup";
import { seedData } from "../../tests/seed-data";
import { getLocalDateKey } from "./dates";
import { normalizeProjectColor } from "./project-colors";

afterEach(() => vi.useRealTimers());
describe("safe local demo cleanup", () => {
  it("removes only the complete untouched seed", () => {
    expect(removePristineDemoSeed(seedData(getLocalDateKey()))).toEqual({ items: [], projects: [] });
  });
  it("preserves real entries and projects referenced by them", () => {
    const data = seedData(getLocalDateKey());
    const real = { ...data.items[0], id: "real", title: "Việc thật" };
    data.items.push(real);
    const result = removePristineDemoSeed(data);
    expect(result.items).toEqual([real]);
    expect(result.projects).toEqual([data.projects[0]]);
  });
  it.each(["partial", "edited", "completed", "renamed-project", "different-times"])("keeps ambiguous %s data", scenario => {
    const data = seedData(getLocalDateKey());
    if (scenario === "partial") data.items.pop();
    if (scenario === "edited") data.items[0].description = "Nội dung thật";
    if (scenario === "completed") data.items[0].completedAt = new Date().toISOString();
    if (scenario === "renamed-project") data.projects[0].name = "Dự án thật";
    if (scenario === "different-times") data.items[0].createdAt = new Date(Date.now() - 1000).toISOString();
    expect(removePristineDemoSeed(data)).toBe(data);
  });
});
describe("startup timeout", () => {
  it("returns successful work and rejects stalled work", async () => {
    expect(await withStartupTimeout(Promise.resolve("ready"))).toBe("ready");
    vi.useFakeTimers();
    const pending = withStartupTimeout(new Promise(() => {}), 100);
    const assertion = expect(pending).rejects.toThrow("Startup timed out");
    await vi.advanceTimersByTimeAsync(100);
    await assertion;
  });
});
it("retires only Violet and preserves Deep Purple and custom colors", () => {
  expect(normalizeProjectColor("#8951C7")).toBe("#D6A84F");
  expect(normalizeProjectColor("#8951c7")).toBe("#D6A84F");
  expect(normalizeProjectColor("#65458A")).toBe("#65458A");
  expect(normalizeProjectColor("#123456")).toBe("#123456");
});
