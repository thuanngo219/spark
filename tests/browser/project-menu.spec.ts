import { test, expect } from "./fixtures";

for (const width of [390, 1280]) {
  test(`native category selector at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.goto("/");
    await expect(page.getByRole("region", { name: "Khởi động Spark" })).toBeHidden();
    const item = page.locator(".item-main").filter({ hasText: "Chốt ba việc quan trọng cho hôm nay" });
    await item.click();
    const detail = page.locator(".item-detail-sheet");
    const select = detail.locator("select").getByRole("option", { name: "Không có danh mục", exact: true });
    await expect(select).toHaveCount(1);
    const category = detail.getByRole("combobox", { name: "Danh mục", exact: true });
    await expect(category.locator("option:checked")).toHaveText("Công việc");
    await category.selectOption({ label: "Cá nhân" });
    await detail.locator(".detail-close-button").click();
    await item.click();
    await expect(category.locator("option:checked")).toHaveText("Cá nhân");
    await category.selectOption("");
    await expect(category.locator("option:checked")).toHaveText("Không có danh mục");
  });
}
