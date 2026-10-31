import { test, expect } from "./fixtures";
for (const width of [390, 1280]) {
  test(`project sidebar and editor ${width}`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.goto("/");
    await expect(page.getByRole("region", { name: "Khởi động Spark" })).toBeHidden();
    if (width < 700) await page.getByRole("button", { name: "Mở sidebar", exact: true }).click();
    if (width >= 700) await page.getByRole("button", { name: "Mở rộng sidebar" }).click();
    const sidebar = page.locator(width < 700 ? ".sidebar-mobile" : ".app-shell > .sidebar");
    await expect(sidebar.locator(".project-more")).toHaveCount(0);
    await expect(sidebar.locator(".project-star").first()).toBeVisible();
    await sidebar.getByRole("button", { name: "Công việc", exact: true }).click();
    await page.getByRole("button", { name: "Chỉnh sửa dự án Công việc", exact: true }).click();
    const dialog = page.locator(".project-editor-backdrop");
    await expect(dialog).toBeVisible();
    await expect(dialog).not.toContainText("Lưu trữ để thu gọn sidebar.");
    if (width < 700) {
      await expect(page.locator("body")).toHaveCSS("position", "fixed");
      const box = (await dialog.locator("form").boundingBox())!;
      expect(box.x).toBe(0); expect(box.y).toBe(0); expect(box.width).toBe(width); expect(box.height).toBe(844);
    }
    await dialog.getByRole("button", { name: "Hủy", exact: true }).click();
    await expect(dialog).toBeHidden();
    await expect(page.locator("body")).not.toHaveCSS("position", "fixed");
  });
}
