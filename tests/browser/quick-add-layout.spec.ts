import { test, expect } from "./fixtures";

for (const width of [320, 390, 1280]) {
  for (const theme of ["light", "dark"] as const) {
    test(`quick-add layout and draft ${width}px ${theme}`, async ({ page }) => {
      await page.setViewportSize({ width, height: 800 });
      await page.emulateMedia({ colorScheme: theme });
      await page.goto("/");
      await expect(page.getByRole("region", { name: "Khởi động Spark" })).toBeHidden();
      await page.getByRole("button", { name: "Thêm công việc", exact: true }).click();
      const form = page.locator(".quick-add-dialog");
      await page.locator(".quick-add-backdrop").evaluate(el => Promise.all(el.getAnimations({ subtree: true }).map(a => a.finished)));
      const centered = async (height: number) => {
        const box = (await form.boundingBox())!;
        expect(Math.abs(box.x + box.width / 2 - width / 2)).toBeLessThan(2);
        expect(Math.abs(box.y + box.height / 2 - height / 2)).toBeLessThan(2);
        expect(box.y).toBeGreaterThanOrEqual(0);
        expect(box.y + box.height).toBeLessThanOrEqual(height);
      };
      await centered(800);
      if (width < 700) {
        expect(await form.boundingBox()).toEqual({ x: 0, y: 0, width, height: 800 });
        await expect(page.locator("body")).toHaveCSS("position", "fixed");
      }
      const title = form.getByRole("textbox", { name: "Tên mục", exact: true });
      await expect(title).toBeFocused();
      await title.fill("Mục thử toàn màn hình");
      if (theme === "dark") await form.getByRole("checkbox", { name: "Ghi chú", exact: true }).check();
      if (width < 700) {
        const dates = await form.locator('.quick-add-controls input[type="date"]').all();
        expect((await dates[0].boundingBox())!.y).toBe((await dates[1].boundingBox())!.y);
      }
      await page.screenshot({ path: `/tmp/spark-quick-main-${width}-${theme}.png` });
      await form.getByRole("button", { name: "Thêm Nội dung", exact: true }).click();
      const editor = form.getByRole("textbox", { name: "Nội dung (nếu cần)", exact: true });
      await editor.fill("Nội dung nháp cần giữ");
      await editor.press("Meta+a");
      await form.getByRole("button", { name: "In đậm", exact: true }).click();
      await expect(editor.locator("strong")).toHaveText("Nội dung nháp cần giữ");
      if (width < 700) {
        await expect(form.locator(".quick-add-entry")).toBeHidden();
        await expect(form.locator(".quick-add-controls")).toBeHidden();
        expect((await editor.boundingBox())!.height).toBeGreaterThan(600);
        await page.evaluate(() => {
          Object.defineProperty(window.visualViewport!, "height", { configurable: true, value: 360 });
          window.visualViewport!.dispatchEvent(new Event("resize"));
        });
        await centered(360);
        const bounds = (await editor.boundingBox())!;
        expect(bounds.height).toBeGreaterThan(180);
        expect(bounds.y + bounds.height).toBeLessThanOrEqual(360);
        await expect(form.getByRole("button", { name: "Xong", exact: true })).toBeInViewport();
        await page.screenshot({ path: `/tmp/spark-quick-focus-${width}-${theme}.png`, clip: { x: 0, y: 0, width, height: 360 } });
        await form.getByRole("button", { name: "Xong", exact: true }).click();
        await expect(title).toHaveValue("Mục thử toàn màn hình");
        await expect(form.locator(".quick-description-preview")).toContainText("Nội dung nháp cần giữ");
        await form.getByRole("button", { name: "Sửa Nội dung", exact: true }).click();
        await expect(editor).toBeFocused();
        await expect(editor.locator("strong")).toHaveText("Nội dung nháp cần giữ");
        await editor.press("Escape");
        await expect(form).toBeVisible();
        await expect(form.locator(".quick-add-controls")).toBeVisible();
        await page.evaluate(() => {
          Reflect.deleteProperty(window.visualViewport!, "height");
          window.visualViewport!.dispatchEvent(new Event("resize"));
        });
      } else {
        await expect(editor).toHaveCSS("height", "300px");
        await centered(800);
      }
      await form.getByRole("button", { name: "Thêm", exact: true }).click();
      await form.getByRole("button", { name: "Hủy", exact: true }).click();
      await expect(form).toBeHidden();
      await expect(page.locator("body")).not.toHaveCSS("position", "fixed");
      await page.keyboard.press("a");
      await page.locator(".item-main").filter({ hasText: "Mục thử toàn màn hình" }).click();
      await expect(page.locator(".formatted-content strong")).toHaveText("Nội dung nháp cần giữ");
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    });
  }
}
