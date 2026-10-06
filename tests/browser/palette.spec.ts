import { test, expect } from "./fixtures";
for (const theme of ["light", "dark"] as const) {
  for (const width of [1280, 390]) {
    test(`attention colors are consistent in ${theme} at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 844 });
      await page.emulateMedia({ colorScheme: theme });
      await page.goto("/");
      await expect(page.getByRole("region", { name: "Khởi động Spark" })).toBeHidden();
      const importantRow = page.locator(".item-row").filter({ hasText: "Chốt ba việc quan trọng" });
      const urgentRow = page.locator(".item-row").filter({ hasText: "Gửi bản cập nhật" });
      await expect(importantRow.locator(width < 700 ? ".item-state-important" : ".flag-button.important.selected")).toHaveCSS("color", "rgb(214, 168, 79)");
      await expect(urgentRow.locator(width < 700 ? ".item-state-urgent" : ".flag-button.urgent.selected")).toHaveCSS("color", "rgb(217, 119, 106)");
      await importantRow.locator(".item-main").click();
      await expect(page.locator(".detail-meta-button.important.selected")).toHaveCSS("color", "rgb(214, 168, 79)");
      await page.locator(".detail-meta-button.urgent").click();
      await expect(page.locator(".detail-meta-button.urgent.selected")).toHaveCSS("color", "rgb(217, 119, 106)");
      await expect(page.locator(".editor-header > div > span")).toHaveCSS("color", theme === "dark" ? "rgb(160, 168, 188)" : "rgb(115, 120, 141)");
    });
  }
}
