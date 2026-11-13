import { test, expect } from "./fixtures";

for (const mode of ["\\", "[", "]"]) {
  test(`detail navigation follows visible order in mode ${mode}`, async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("region", { name: "Khởi động Spark" })).toBeHidden();
    await page.keyboard.press("a");
    await page.keyboard.press(mode);
    const items = page.locator(".item-main");
    const titles = await items.locator(".item-title").allTextContents();
    expect(titles.length).toBeGreaterThan(0);
    await items.first().click();
    const detail = page.locator(".item-detail-sheet");
    await expect(detail).toHaveAccessibleName(titles[0]);
    await expect(detail.getByRole("button", { name: "Mục trước" })).toBeDisabled();
    if (titles.length > 1) {
      await page.keyboard.press("ArrowRight");
      await expect(detail).toHaveAccessibleName(titles[1]);
      await detail.getByRole("button", { name: "Mục trước" }).click();
    } else {
      await expect(detail.getByRole("button", { name: "Mục sau" })).toBeDisabled();
      await page.keyboard.press("ArrowRight");
    }
    await expect(detail).toHaveAccessibleName(titles[0]);
    await page.keyboard.press("e");
    await expect(detail.locator(".content-editor-input")).toBeFocused();
    await page.keyboard.press("ArrowRight");
    await expect(detail.locator(".content-editor-input")).toBeFocused();
    await detail.getByRole("button", { name: "Hủy", exact: true }).click();
    await page.keyboard.press("Shift+E");
    await expect(detail.locator(".detail-title-row input")).toBeFocused();
  });
}
