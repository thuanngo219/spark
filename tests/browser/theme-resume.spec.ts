import type { Page } from "@playwright/test";
import { test, expect } from "./fixtures";

// Model a suspended page: the OS changes without notifying existing MQL listeners.
// New queries see the current OS value; old query objects retain their snapshot.
async function setSystemThemeSilently(page: Page, dark: boolean) {
  await page.evaluate(dark => {
    const original = window.matchMedia.bind(window);
    window.matchMedia = query => {
      const result = original(query);
      if (query === "(prefers-color-scheme: dark)") {
        Object.defineProperty(result, "matches", { configurable: true, value: dark });
      }
      return result;
    };
  }, dark);
}

async function expectChrome(page: Page, theme: "light" | "dark", sidebar = false) {
  const color = sidebar ? "#111742" : theme === "dark" ? "#121622" : "#f7f8fa";
  const rgb = sidebar ? "rgb(17, 23, 66)" : theme === "dark" ? "rgb(18, 22, 34)" : "rgb(247, 248, 250)";
  await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
  await expect(page.locator("html")).toHaveCSS("background-color", rgb);
  await expect(page.locator("body")).toHaveCSS("background-color", rgb);
  await expect(page.locator("html")).toHaveCSS("color-scheme", sidebar ? "dark" : theme);
  await expect(page.locator('meta[name="theme-color"]')).toHaveCount(1);
  await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute("content", color);
  await expect(page.locator('meta[name="color-scheme"]')).toHaveCount(1);
  await expect(page.locator('meta[name="color-scheme"]')).toHaveAttribute("content", sidebar ? "dark" : theme);
  await expect(page.locator(".app-shell")).toHaveCSS("background-color", theme === "dark" ? "rgb(18, 22, 34)" : "rgb(247, 248, 250)");
  await expect(page.locator("main")).toHaveCSS("color-scheme", theme);
}

for (const event of ["visibilitychange", "pageshow", "focus"] as const) {
  test(`resume ${event}: refreshes system theme and sidebar after a missed OS event`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    await page.getByRole("region", { name: "Khởi động Spark" }).waitFor({ state: "hidden" });
    await expectChrome(page, "light");
    // Keep a draft mounted to prove resuming does not reload/reset the app.
    await page.locator(".item-row").first().click();
    await page.getByRole("button", { name: "Sửa Nội dung", exact: true }).click();
    const editor = page.locator('[contenteditable="true"]');
    await editor.fill("Bản nháp khi mở lại app");
    await setSystemThemeSilently(page, true);
    await expectChrome(page, "light");
    const resume = () => page.evaluate(event => {
      if (event === "visibilitychange") document.dispatchEvent(new Event(event));
      else if (event === "pageshow") window.dispatchEvent(new PageTransitionEvent(event, { persisted: true }));
      else window.dispatchEvent(new Event(event));
    }, event);
    await resume();
    await expectChrome(page, "dark");
    await expect(editor).toHaveText("Bản nháp khi mở lại app");
    await page.getByRole("button", { name: "Lưu Nội dung", exact: true }).click();
    await page.getByRole("button", { name: "Đóng", exact: true }).click();
    await page.getByRole("button", { name: "Mở sidebar", exact: true }).click();
    await setSystemThemeSilently(page, false);
    await resume();
    await expectChrome(page, "light", true);
    await page.getByRole("button", { name: "Đóng điều hướng", exact: true }).click();
    await expectChrome(page, "light");
    await expect(page.locator("html")).toHaveAttribute("data-theme-preference", "system");
  });
}

for (const preference of ["light", "dark"] as const) {
  test(`resume preserves explicit ${preference} even when storage writes fail`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    await page.getByRole("region", { name: "Khởi động Spark" }).waitFor({ state: "hidden" });
    await page.evaluate(preference => {
      Storage.prototype.setItem = () => { throw new DOMException("Blocked", "SecurityError"); };
      window.dispatchEvent(new CustomEvent("spark:theme-select", { detail: preference }));
    }, preference);
    await setSystemThemeSilently(page, preference !== "dark");
    await page.evaluate(() => {
      document.dispatchEvent(new Event("visibilitychange"));
      window.dispatchEvent(new PageTransitionEvent("pageshow", { persisted: true }));
      window.dispatchEvent(new Event("focus"));
    });
    await expectChrome(page, preference);
    await expect(page.locator("html")).toHaveAttribute("data-theme-preference", preference);
  });
}

test("resume rechecks media on the next frame and ignores hidden pages", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.getByRole("region", { name: "Khởi động Spark" }).waitFor({ state: "hidden" });
  await page.evaluate(() => {
    Object.defineProperty(document, "visibilityState", { configurable: true, value: "hidden" });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await setSystemThemeSilently(page, true);
  await page.evaluate(() => window.dispatchEvent(new Event("focus")));
  await expectChrome(page, "light");
  await page.evaluate(() => {
    Reflect.deleteProperty(document, "visibilityState");
    document.dispatchEvent(new Event("visibilitychange"));
    // The browser makes the new media state available after dispatching resume.
    const original = window.matchMedia.bind(window);
    window.matchMedia = query => {
      const result = original(query);
      if (query === "(prefers-color-scheme: dark)") {
        Object.defineProperty(result, "matches", { configurable: true, value: false });
      }
      return result;
    };
  });
  await expectChrome(page, "light");
});
