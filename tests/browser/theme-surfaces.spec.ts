import type { Page } from "@playwright/test";
import { test, expect } from "./fixtures";

async function surfaces(page: Page, theme: "light" | "dark", menu: boolean) {
  const canvas = theme === "light" ? "rgb(247, 248, 250)" : "rgb(18, 22, 34)";
  const surface = theme === "light" ? "rgb(255, 255, 255)" : "rgb(27, 32, 48)";
  await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
  await expect(page.locator(".app-shell")).toHaveCSS("background-color", canvas);
  await expect(page.locator(".app-shell")).toHaveCSS("color-scheme", theme);
  await expect(page.locator("main select").first()).toHaveCSS("color-scheme", theme);
  if (page.viewportSize()!.width < 700) {
    await expect(page.locator(".mobile-dock")).toHaveCSS("background-color", surface);
  } else {
    await expect(page.locator(".mobile-dock")).toBeHidden();
  }
  await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute("content", menu ? "#111742" : theme === "dark" ? "#121622" : "#f7f8fa");
  await expect(page.locator("html")).toHaveCSS("color-scheme", menu ? "dark" : theme);
  if (menu) await expect(page.locator(".sidebar-mobile")).toHaveCSS("color-scheme", "dark");
}

for (const width of [320, 699]) {
  test(`${width}px: theme transitions keep app and dialogs separate from menu chrome`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.goto("/");
    await page.getByRole("region", { name: "Khởi động Spark" }).waitFor({ state: "hidden" });
    await surfaces(page, "light", false);
    await page.getByRole("button", { name: "Mở sidebar", exact: true }).click();
    await surfaces(page, "light", true);
    await page.locator(".sidebar-mobile").getByRole("button", { name: "Phím tắt", exact: true }).click();
    const dialog = page.getByRole("dialog", { name: "Phím tắt & hiển thị" });
    await expect(dialog).toHaveCSS("color-scheme", "light");
    for (const [label, theme] of [["Tối", "dark"], ["Sáng", "light"]] as const) {
      await dialog.getByRole("radio", { name: label, exact: true }).check();
      await surfaces(page, theme, true);
      await expect(dialog).toHaveCSS("color-scheme", theme);
      await expect(dialog.locator('input[type="radio"]').first()).toHaveCSS("color-scheme", theme);
    }
    await page.emulateMedia({ colorScheme: "dark" });
    await surfaces(page, "light", true); // Explicit light ignores OS changes.
    await dialog.getByRole("radio", { name: "Theo hệ thống", exact: true }).check();
    await surfaces(page, "dark", true);
    await page.emulateMedia({ colorScheme: "light" });
    await surfaces(page, "light", true);
    await page.getByRole("button", { name: "Đóng bảng phím tắt" }).click();

    // Retained mobile-menu state must not tint a desktop view.
    await page.setViewportSize({ width: 700, height: 844 });
    await surfaces(page, "light", false);
    await expect(page.locator(".mobile-nav-backdrop")).toBeHidden();
    await page.setViewportSize({ width, height: 844 });
    await surfaces(page, "light", true);
    await page.locator(".mobile-nav-backdrop").click({ position: { x: width - 2, y: 400 } });
    await surfaces(page, "light", false);
    for (let i = 0; i < 2; i++) {
      await page.getByRole("button", { name: "Mở sidebar", exact: true }).click();
      await surfaces(page, "light", true);
      await page.getByRole("button", { name: "Đóng điều hướng" }).click();
      await surfaces(page, "light", false);
    }
  });
}

test("390px: cross-tab preference changes while menu is open preserve app surfaces", async ({ page, context }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.getByRole("region", { name: "Khởi động Spark" }).waitFor({ state: "hidden" });
  await page.getByRole("button", { name: "Mở sidebar", exact: true }).click();
  const other = await context.newPage();
  await other.goto("/");
  await other.evaluate(() => localStorage.setItem("spark:theme:v1", "dark"));
  await surfaces(page, "dark", true);
  await other.evaluate(() => localStorage.removeItem("spark:theme:v1"));
  await surfaces(page, "light", true);
  await expect(page.locator("html")).toHaveAttribute("data-theme-preference", "system");
  await other.close();
  await page.getByRole("button", { name: "Đóng điều hướng" }).click();
  await surfaces(page, "light", false);
});
