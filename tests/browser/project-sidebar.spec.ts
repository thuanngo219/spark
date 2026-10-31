import { test, expect } from "./fixtures";
for (const width of [320, 390, 1280]) {
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
    const colorBox = (await dialog.locator(".color-picker-options").boundingBox())!;
    const managementBox = (await dialog.locator(".project-management-actions").boundingBox())!;
    expect(managementBox.y - colorBox.y - colorBox.height).toBeCloseTo(10, 0);
    await expect(dialog.locator(".project-editor-actions")).toHaveCSS("padding-top", "15px");
    await expect(dialog.locator(".project-editor-actions")).toHaveCSS("border-top-width", "1px");
    if (width < 700) {
      const footerBox = (await dialog.locator(".project-editor-actions").boundingBox())!;
      expect(844 - footerBox.y - footerBox.height).toBeCloseTo(25, 0);
    }
    const actions = dialog.locator(".project-editor-actions button");
    await expect(actions).toHaveCount(2);
    const boxes = await actions.evaluateAll(elements => elements.map(el => { const b = el.getBoundingClientRect(); return { y: b.y, right: b.right }; }));
    expect(new Set(boxes.map(box => box.y)).size).toBe(1);
    expect(Math.max(...boxes.map(box => box.right))).toBeLessThanOrEqual(width);
    await expect(dialog.locator(".project-editor-action-group svg")).toHaveCount(5);
    await dialog.evaluate(el => Promise.all(el.getAnimations({ subtree: true }).filter(a => a.effect?.getTiming().iterations !== Infinity).map(a => a.finished)));
    await page.screenshot({ path: `/tmp/spark-project-actions-${width}.png` });
    if (width < 700) {
      await page.evaluate(() => { Object.defineProperty(visualViewport!, "height", { configurable: true, get: () => 420 }); visualViewport!.dispatchEvent(new Event("resize")); });
      await expect(dialog).toHaveCSS("height", "844px");
      await expect(dialog.locator("form")).toHaveCSS("height", "420px");
      await page.evaluate(() => { Object.defineProperty(visualViewport!, "height", { configurable: true, get: () => 844 }); visualViewport!.dispatchEvent(new Event("resize")); });
    }
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
