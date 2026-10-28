import { expect, test } from "@playwright/test";

test("keyboard focus remains visible on the desktop sidebar without appearing on pointer clicks", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("region", { name: "Khởi động Spark" })).toBeHidden();
  await page.keyboard.press("Tab");
  const firstItem = page.locator(".sidebar .nav-item").first();
  await firstItem.focus();
  await expect(firstItem).toHaveCSS("outline-width", "2px");
  await expect(firstItem).toHaveCSS("outline-color", "rgb(108, 224, 218)");

  const secondItem = page.locator(".sidebar .nav-item").nth(1);
  await secondItem.click();
  await expect(secondItem).toHaveCSS("outline-style", "none");
});

test("mobile dock focus stays inside the screen and outlines the round add button", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 800 });
  await page.goto("/");
  await expect(page.getByRole("region", { name: "Khởi động Spark" })).toBeHidden();
  await page.keyboard.press("Tab");
  const today = page.locator('.mobile-dock button[aria-label="Hôm nay"]');
  await today.focus();
  await expect(today).toHaveCSS("outline-width", "2px");
  await expect(today).toHaveCSS("outline-offset", "-3px");

  const add = page.locator(".mobile-dock .mobile-dock-add");
  await add.focus();
  await expect(add).toHaveCSS("outline-style", "none");
  await expect(add.locator(":scope > span")).toHaveCSS("outline-width", "2px");
});
