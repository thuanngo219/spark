import { test, expect } from "./fixtures";

for (const width of [320, 390, 1280]) {
  for (const theme of ["light", "dark"] as const) {
    test(`quick-add centered ${width}px ${theme}`, async ({ page }) => {
      await page.setViewportSize({ width, height: 800 });
      await page.emulateMedia({ colorScheme: theme });
      await page.goto("/");
      await expect(page.getByRole("region", { name: "Khởi động Spark" })).toBeHidden();
      await page.getByRole("button", { name: "Thêm công việc", exact: true }).click();
      const form = page.locator(".quick-add-dialog");
      await form.evaluate(el => Promise.all(el.getAnimations().map(a => a.finished)));
      const centered = async (height: number) => {
        const box = (await form.boundingBox())!;
        expect(Math.abs(box.x + box.width / 2 - width / 2)).toBeLessThan(2);
        expect(Math.abs(box.y + box.height / 2 - height / 2)).toBeLessThan(2);
        expect(box.y).toBeGreaterThanOrEqual(0);
        expect(box.y + box.height).toBeLessThanOrEqual(height);
      };
      await centered(800);
      const title = page.getByRole("textbox", { name: "Tên mục", exact: true });
      await expect(title).toBeFocused();
      await title.fill("Kiểm tra quick-add giữa màn hình");
      await page.getByRole("button", { name: "Thêm Nội dung", exact: true }).click();
      await centered(800);
      if (width < 700) {
        await page.evaluate(() => {
          Object.defineProperty(window.visualViewport!, "height", { configurable: true, value: 360 });
          window.visualViewport!.dispatchEvent(new Event("resize"));
        });
        await expect(page.locator(".quick-add-backdrop")).toHaveCSS("height", "360px");
        await centered(360);
      }
      await page.screenshot({ path: `/tmp/spark-quick-centered-${width}-${theme}.png` });
      await form.getByRole("button", { name: "Thêm", exact: true }).scrollIntoViewIfNeeded();
      await expect(form.getByRole("button", { name: "Thêm", exact: true })).toBeInViewport();
      await page.keyboard.press("Escape");
      await expect(form).toBeHidden();
    });
  }
}
