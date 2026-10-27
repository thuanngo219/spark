import { expect, test } from "./fixtures";
import type { Page } from "@playwright/test";

const title = { task: "Chốt ba việc quan trọng cho hôm nay", note: "Ý tưởng: dành 20 phút cuối ngày để thu gọn danh sách" };
const backdrop = (page: Page) => page.locator(".item-detail-backdrop");
const settled = (page: Page) => backdrop(page).evaluate(el => Promise.all(el.getAnimations().map(a => a.finished)));
const offset = (page: Page) => backdrop(page).evaluate(el => new DOMMatrix(getComputedStyle(el).transform).m41);
async function open(page: Page, type: "task" | "note" = "task") {
  await page.locator(".item-main").filter({ hasText: title[type] }).click();
}
async function load(page: Page) {
  await page.goto("/");
  await page.getByRole("region", { name: "Khởi động Spark" }).waitFor({ state: "hidden" });
  await page.keyboard.press("a");
}
async function swipe(page: Page, x: number, dx: number, dy = 0, cancel = false) {
  const cdp = await page.context().newCDPSession(page);
  await cdp.send("Emulation.setTouchEmulationEnabled", { enabled: true, maxTouchPoints: 2 });
  await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x, y: 280 }] });
  for (let i = 1; i <= 6; i++) {
    await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: x + dx * i / 6, y: 280 + dy * i / 6 }] });
  }
  const during = await offset(page);
  await cdp.send("Input.dispatchTouchEvent", { type: cancel ? "touchCancel" : "touchEnd", touchPoints: [] });
  await cdp.detach();
  return during;
}

for (const type of ["task", "note"] as const) {
  for (const theme of ["light", "dark"] as const) {
    test(`${type} ${theme}: Quint entry, edge swipe closes editor with × semantics`, async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      await page.emulateMedia({ colorScheme: theme });
      await load(page);
      await open(page, type);
      await expect(backdrop(page)).toHaveCSS("animation-duration", "0.24s");
      await expect(backdrop(page)).toHaveCSS("animation-timing-function", "cubic-bezier(0.22, 1, 0.36, 1)");
      // Freeze entry at a known point to verify direction without timing flakiness.
      const entry = await backdrop(page).evaluate(el => {
        const a = el.getAnimations()[0];
        a.pause(); a.currentTime = 80;
        const x = new DOMMatrix(getComputedStyle(el).transform).m41;
        a.finish();
        return x;
      });
      expect(entry).toBeGreaterThan(0);
      expect(entry).toBeLessThan(390);
      await settled(page);
      expect(await offset(page)).toBe(0);
      await page.getByRole("button", { name: "Sửa Nội dung", exact: true }).click();
      const editor = page.locator(".content-editor-input");
      const original = await editor.innerText();
      await editor.fill("Bản nháp chưa lưu");
      await editor.press("ArrowRight");
      await page.evaluate(() => {
        Object.defineProperty(visualViewport!, "height", { configurable: true, get: () => 420 });
        visualViewport!.dispatchEvent(new Event("resize"));
      });
      expect(await swipe(page, 8, 150)).toBeGreaterThan(100);
      await expect(backdrop(page)).toBeHidden();
      await expect(page.locator("body")).not.toHaveCSS("position", "fixed");
      await expect(page.locator(".mobile-nav-panel")).toBeHidden();
      await open(page, type);
      await page.getByRole("button", { name: "Sửa Nội dung", exact: true }).click();
      await expect(editor).toHaveText(original);
      await page.getByRole("button", { name: "Hủy", exact: true }).click();
      // × uses the same animated exit, with the list inert until it finishes.
      await page.getByRole("button", { name: "Đóng", exact: true }).click();
      const exit = await backdrop(page).evaluate(el => {
        const a = el.getAnimations()[0];
        a.pause(); a.currentTime = 100;
        const result = { x: new DOMMatrix(getComputedStyle(el).transform).m41, locked: document.body.style.position, easing: a.effect!.getTiming().easing, duration: a.effect!.getTiming().duration };
        a.finish();
        return result;
      });
      expect(exit.x).toBeGreaterThan(0);
      expect(exit.locked).toBe("fixed");
      expect(exit.duration).toBe(240);
      expect(exit.easing).toBe("cubic-bezier(0.22, 1, 0.36, 1)");
      await expect(backdrop(page)).toBeHidden();
    });
  }
}

test("short/cancelled swipe springs back; vertical and interior gestures do not dismiss", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await load(page); await open(page); await settled(page);
  expect(await swipe(page, 8, 50)).toBeGreaterThan(0);
  await settled(page); expect(await offset(page)).toBe(0);
  expect(await swipe(page, 8, 160, 0, true)).toBeGreaterThan(0);
  await settled(page); expect(await offset(page)).toBe(0);
  expect(await swipe(page, 8, 2, 90)).toBe(0);
  expect(await swipe(page, 100, 160)).toBe(0);
  await expect(backdrop(page)).toBeVisible();
  expect(await swipe(page, 8, 150)).toBeGreaterThan(0);
  await expect(backdrop(page)).toBeHidden();
});

test("reduced motion keeps edge-close without sliding", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await load(page); await open(page); await settled(page);
  expect(await swipe(page, 8, 150)).toBe(0);
  await expect(backdrop(page)).toBeHidden();
});

test("desktop keeps its popup and ignores edge swipes", async ({ page }) => {
  await load(page); await open(page); await settled(page);
  await expect(backdrop(page)).toHaveCSS("animation-name", "fade-in");
  expect(await swipe(page, 8, 150)).toBe(0);
  await expect(backdrop(page)).toBeVisible();
  await page.getByRole("button", { name: "Đóng", exact: true }).click();
  await expect(backdrop(page)).toBeHidden();
});
