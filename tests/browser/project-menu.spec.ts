import { test, expect } from "./fixtures";
for (const theme of ["light", "dark"] as const) {
  test(`project menu spacing and keyboard ${theme}`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: theme });
    await page.goto("/");
    await expect(page.getByRole("region", { name: "Khởi động Spark" })).toBeHidden();
    await page.locator(".item-main").first().click();
    const trigger = page.locator(".project-select-trigger");
    await trigger.click();
    const menu = page.getByRole("listbox", { name: "Dự án" });
    await expect(menu).toBeVisible();
    await expect(menu).toHaveCSS("row-gap", "4px");
    const option = menu.getByRole("option").first();
    expect((await option.boundingBox())!.height).toBeGreaterThanOrEqual(44);
    await page.keyboard.press("Home");
    await expect(option).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(menu).toBeHidden();
    await expect(trigger).toContainText("Không có dự án");
    await trigger.click();
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Enter");
    await expect(trigger).toContainText("Công việc");
    await trigger.click();
    await page.keyboard.press("Escape");
    await expect(menu).toBeHidden();
    await expect(trigger).toBeFocused();
  });
}
