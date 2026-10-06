import { expect, test } from "./fixtures";
import type { Page } from "@playwright/test";
import { THEME_STORAGE_KEY } from "../../src/lib/theme";

async function preferences(page: Page) {
  await expect(page.getByRole("region", { name: "Khởi động Spark" })).toBeHidden();
  await page.keyboard.press("Escape");
  await page.keyboard.press("?");
  await expect(page.getByRole("dialog", { name: "Phím tắt & hiển thị" })).toBeVisible();
}
async function ready(page: Page) {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Hôm nay", exact: true })).toBeVisible();
}

test("system changes, explicit override, persistence, keyboard and cross-tab preference", async ({ page, context }) => {
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.emulateMedia({ colorScheme: "dark" });
  await ready(page);
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await preferences(page);
  await expect(page.getByRole("radio", { name: "Theo hệ thống" })).toBeChecked();
  await page.emulateMedia({ colorScheme: "light" });
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await page.getByText("Tối", { exact: true }).click();
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute("content", "#121622");
  await preferences(page);
  const darkRadio = page.getByRole("radio", { name: "Tối", exact: true });
  await darkRadio.focus();
  await darkRadio.press("ArrowLeft");
  await expect(page.getByRole("radio", { name: "Sáng", exact: true })).toBeChecked();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await page.emulateMedia({ colorScheme: "dark" });
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  const other = await context.newPage();
  await ready(other);
  await preferences(other);
  await other.getByText("Tối", { exact: true }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(darkRadio).toBeChecked();
  await other.evaluate(key => localStorage.removeItem(key), THEME_STORAGE_KEY);
  await expect(page.getByRole("radio", { name: "Theo hệ thống" })).toBeChecked();
  await page.emulateMedia({ colorScheme: "light" });
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  expect(errors).toEqual([]);
});

test("stored dark theme paints before app hydration, even with framework scripts blocked", async ({ page }) => {
  await page.addInitScript(key => localStorage.setItem(key, "dark"), THEME_STORAGE_KEY);
  await page.route("**/_next/**/*.js", route => route.abort());
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(page.locator("body")).toHaveCSS("background-color", "rgb(18, 22, 34)");
  await expect(page.locator("html")).toHaveCSS("color-scheme", "dark");
});

test("invalid storage falls back to system; blocked storage still allows a session override", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await page.addInitScript(key => localStorage.setItem(key, "unexpected"), THEME_STORAGE_KEY);
  await ready(page);
  await expect(page.locator("html")).toHaveAttribute("data-theme-preference", "system");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.addInitScript(key => {
    const get = Storage.prototype.getItem;
    const set = Storage.prototype.setItem;
    Storage.prototype.getItem = function (name) {
      if (name === key) throw new DOMException("Blocked", "SecurityError");
      return get.call(this, name);
    };
    Storage.prototype.setItem = function (name, value) {
      if (name === key) throw new DOMException("Blocked", "QuotaExceededError");
      return set.call(this, name, value);
    };
  }, THEME_STORAGE_KEY);
  await page.reload();
  await preferences(page);
  await page.getByText("Sáng", { exact: true }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await page.emulateMedia({ colorScheme: "light" });
  await page.emulateMedia({ colorScheme: "dark" });
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
});

for (const width of [1280, 390]) {
  test(`dark ${width}px: quick-add, content editing, metadata and contrast`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.emulateMedia({ colorScheme: "dark" });
    await ready(page);
    await expect(page.locator(".view-header")).toHaveCSS("backdrop-filter", "blur(8px)");
    await page.screenshot({ path: `/tmp/spark-dark-today-${width}.png` });
    await page.getByRole("button", { name: "Thêm công việc", exact: true }).click();
    await page.getByRole("textbox", { name: "Tên mục" }).fill("Kiểm tra giao diện tối");
    await page.getByRole("button", { name: "Thêm Nội dung", exact: true }).click();
    const content = page.getByRole("textbox", { name: "Nội dung (nếu cần)", exact: true });
    await content.fill("Ghi lại ý tưởng cho ngày mai.\nNội dung dễ đọc, thao tác gọn gàng.");
    await content.press("Meta+a");
    await content.press("Meta+b");
    await expect(content.locator("strong").first()).toHaveText("Ghi lại ý tưởng cho ngày mai.");
    await expect(page.locator(".quick-add")).toHaveCSS("background-color", "rgb(27, 32, 48)");
    await expect(page.locator(".content-toolbar")).toHaveCSS("background-color", "rgb(36, 43, 61)");
    await expect(content).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
    await page.screenshot({ path: `/tmp/spark-dark-quick-${width}.png` });
    await page.getByRole("button", { name: "Thêm", exact: true }).click();
    await page.getByRole("button", { name: "Hủy", exact: true }).click();
    await page.locator(".item-main").filter({ hasText: "Kiểm tra giao diện tối" }).click();
    await page.getByRole("button", { name: "Sửa tên", exact: true }).click();
    const title = page.getByRole("textbox", { name: "Tên task", exact: true });
    await expect(title).toHaveCSS("border-top-width", "0px");
    await expect(title).toHaveCSS("border-bottom-width", "1px");
    await page.getByRole("button", { name: "Sửa Nội dung", exact: true }).click();
    const editor = page.getByRole("textbox", { name: "Nội dung task", exact: true });
    await expect(editor).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
    await expect(editor).toHaveCSS("color", "rgb(233, 236, 245)");
    await editor.fill("Nội dung đã sửa trong giao diện tối.");
    await page.getByRole("dialog").getByRole("button", { name: "Quan Trọng", exact: true }).click();
    await expect(page.getByRole("dialog").getByRole("button", { name: "Quan Trọng", exact: true })).toHaveClass(/selected/);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({ path: `/tmp/spark-dark-editor-${width}.png` });
    // Verify actual computed colors, not just token spelling.
    const ratios = await page.evaluate(() => {
      const luminance = (color: string) => {
        const rgb = color.match(/[\d.]+/g)!.slice(0, 3).map(Number).map(v => { v /= 255; return v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4; });
        return rgb[0] * .2126 + rgb[1] * .7152 + rgb[2] * .0722;
      };
      const bg = luminance(getComputedStyle(document.querySelector(".item-detail-sheet")!).backgroundColor);
      return [".content-editor-input", ".content-counter", ".detail-label"].map(selector => {
        const fg = luminance(getComputedStyle(document.querySelector(selector)!).color);
        return (Math.max(fg, bg) + .05) / (Math.min(fg, bg) + .05);
      });
    });
    for (const ratio of ratios) expect(ratio).toBeGreaterThanOrEqual(4.5);
    await page.getByRole("button", { name: "Đóng", exact: true }).click();
    await page.reload();
    await page.locator(".item-main").filter({ hasText: "Kiểm tra giao diện tối" }).click();
    await expect(page.locator(".formatted-content")).toHaveText("Nội dung đã sửa trong giao diện tối.");
  });
}

test("320px theme options remain usable and calendar uses dark surfaces", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await page.emulateMedia({ colorScheme: "dark" });
  await ready(page);
  await preferences(page);
  for (const label of ["Theo hệ thống", "Sáng", "Tối"]) {
    const option = page.getByText(label, { exact: true });
    expect((await option.boundingBox())!.height).toBeGreaterThanOrEqual(44);
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.keyboard.press("Escape");
  await page.keyboard.press("d");
  await expect(page.locator(".date-strip button.selected")).toHaveCSS("background-color", "rgb(61, 75, 107)");
});

test("offline cold start retains dark preference and can change theme", async ({ page, context }) => {
  test.skip(process.env.SPARK_TEST_OFFLINE !== "1", "Requires production service worker");
  await ready(page);
  await preferences(page);
  await page.getByText("Tối", { exact: true }).click();
  await page.keyboard.press("Escape");
  await page.evaluate(() => navigator.serviceWorker.ready.then(() => true));
  await expect.poll(() => page.evaluate(async () => {
    const scripts = performance.getEntriesByType("resource").map(entry => entry.name).filter(name => name.includes("/_next/static/") && name.endsWith(".js"));
    return scripts.length > 0 && (await Promise.all(scripts.map(name => caches.match(name)))).every(Boolean);
  })).toBe(true);
  await context.setOffline(true);
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await preferences(page);
  await expect(page.getByRole("radio", { name: "Tối", exact: true })).toBeChecked();
  await page.getByText("Sáng", { exact: true }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await context.setOffline(false);
});

test("theme shortcuts select, persist and follow system without intercepting typing", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await ready(page);
  await page.keyboard.press("<");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await expect(page.locator("html")).toHaveAttribute("data-theme-preference", "light");
  await page.keyboard.press(">");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.reload();
  await expect(page.getByRole("region", { name: "Khởi động Spark" })).toBeHidden();
  await expect(page.locator("html")).toHaveAttribute("data-theme-preference", "dark");
  await page.keyboard.press("M");
  await expect(page.locator("html")).toHaveAttribute("data-theme-preference", "system");
  await page.emulateMedia({ colorScheme: "light" });
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await page.keyboard.press("m");
  await expect(page.locator("html")).toHaveAttribute("data-theme-preference", "system");
  await page.keyboard.press("Alt+m");
  await page.evaluate(() => document.dispatchEvent(new KeyboardEvent("keydown", { key: ">", ctrlKey: true, bubbles: true })));
  await page.evaluate(() => document.dispatchEvent(new KeyboardEvent("keydown", { key: ">", isComposing: true, bubbles: true })));
  await expect(page.locator("html")).toHaveAttribute("data-theme-preference", "system");
  await page.keyboard.press("n");
  const title = page.getByRole("textbox", { name: "Tên mục", exact: true });
  await title.pressSequentially("<M>");
  await expect(title).toHaveValue("<M>");
  await expect(page.locator("html")).toHaveAttribute("data-theme-preference", "system");
  await page.getByRole("button", { name: "Thêm Nội dung", exact: true }).click();
  const editor = page.getByRole("textbox", { name: "Nội dung (nếu cần)", exact: true });
  await editor.pressSequentially("<M>");
  await expect(editor).toHaveText("<M>");
  await expect(page.locator("html")).toHaveAttribute("data-theme-preference", "system");
  await page.getByRole("button", { name: "Hủy", exact: true }).click();
  await preferences(page);
  await page.keyboard.press(">");
  await expect(page.getByRole("radio", { name: "Tối", exact: true })).toBeChecked();
  await expect(page.locator(".shortcut-footer")).toContainText("Giao diện sáng");
  await expect(page.locator(".shortcut-footer")).toContainText("Giao diện tối");
});

test("reduced motion keeps all animated controls brief and OTP retains its size", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await ready(page);
  await expect(page.locator(".app-shell")).toHaveCSS("transition-duration", "1e-05s");
  await expect(page.locator(".view-header h1")).toHaveCSS("transition-duration", "1e-05s, 1e-05s");
  await page.keyboard.press("n");
  await expect(page.locator(".quick-add-dialog")).toHaveCSS("animation-duration", "1e-05s");
  await page.getByRole("button", { name: "Hủy", exact: true }).click();
  await preferences(page);
  await expect(page.locator(".preference-switch > span")).toHaveCSS("transition-duration", "1e-05s");
  await page.keyboard.press("Escape");
  await page.route("**/auth/v1/otp*", route => route.fulfill({ status: 200, json: {} }));
  await page.locator(".sync-header-status").click();
  await page.getByRole("textbox", { name: "Email nhận mã đăng nhập" }).fill("test@example.invalid");
  await page.getByRole("button", { name: "Gửi mã và bật đồng bộ" }).click();
  const otp = page.getByRole("textbox", { name: "Mã đăng nhập gồm 6 chữ số" });
  await expect(otp).toBeVisible();
  expect(await otp.evaluate(el => parseFloat(getComputedStyle(el).fontSize) / parseFloat(getComputedStyle(document.documentElement).fontSize))).toBeCloseTo(1.4375, 4);
});
