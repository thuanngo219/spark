import { test, expect } from "./fixtures";

for (const width of [320, 390, 1280]) {
  for (const theme of ["light", "dark"] as const) {
    test(`${width}px ${theme}: shortcuts and sync fill the viewport and restore navigation`, async ({ page }) => {
      await page.setViewportSize({ width, height: 700 });
      await page.emulateMedia({ colorScheme: theme });
      await page.route("**/auth/v1/**", route => route.abort());
      await page.goto("/");
      await expect(page.getByRole("region", { name: "Khởi động Spark" })).toBeHidden();
      if (width < 700) {
        await page.getByRole("button", { name: "Mở sidebar", exact: true }).click();
        await expect(page.locator(".mobile-nav-backdrop")).toHaveCSS("backdrop-filter", "none");
        await expect(page.locator(".mobile-nav-backdrop")).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
      }
      const helpTrigger = page.locator(width < 700 ? ".sidebar-mobile" : ".app-shell > .sidebar").getByRole("button", { name: "Phím tắt", exact: true });
      await helpTrigger.click();
      const help = page.locator(".shortcut-dialog");
      await expect(help).toBeVisible();
      await page.locator(".utility-screen").evaluate(el => Promise.all(el.getAnimations().map(a => a.finished)));
      expect(await help.boundingBox()).toEqual({ x: 0, y: 0, width, height: 700 });
      await expect(help).toHaveCSS("border-radius", "0px");
      await expect(page.locator(".utility-screen")).toHaveCSS("background-color", theme === "light" ? "rgb(247, 248, 250)" : "rgb(18, 22, 34)");
      await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute("content", theme === "light" ? "#f7f8fa" : "#121622");
      await expect(page.locator("body")).toHaveCSS("position", "fixed");
      const closeHelp = help.getByRole("button", { name: "Đóng bảng phím tắt" });
      await expect(closeHelp).toBeFocused();
      await page.keyboard.press("Shift+Tab");
      await expect(help.getByRole("switch")).toBeFocused();
      await page.keyboard.press("Tab");
      await expect(closeHelp).toBeFocused();
      await help.evaluate(el => { el.scrollTop = el.scrollHeight; });
      expect((await closeHelp.boundingBox())!.y).toBeGreaterThanOrEqual(0);
      expect((await closeHelp.boundingBox())!.y).toBeLessThan(120);
      await page.screenshot({ path: `/tmp/spark-help-full-${width}-${theme}.png` });
      await page.keyboard.press("Escape");
      await expect(help).toBeHidden();
      await expect(helpTrigger).toBeFocused();
      await expect(page.locator("body")).not.toHaveCSS("position", "fixed");
      if (width < 700) {
        await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute("content", "#111742");
        await page.getByRole("button", { name: "Đóng điều hướng" }).click();
      }
      await page.locator(width < 700 ? ".mobile-sync-status" : ".local-mode-card").click();
      const sync = page.locator(".sync-dialog");
      await expect(sync).toBeVisible();
      await page.locator(".utility-screen").evaluate(el => Promise.all(el.getAnimations().map(a => a.finished)));
      expect(await sync.boundingBox()).toEqual({ x: 0, y: 0, width, height: 700 });
      await expect(sync.getByRole("button", { name: "Đóng", exact: true })).toBeFocused();
      const email = sync.locator('input[type="email"]');
      await email.fill("test@example.invalid");
      if (width < 700) {
        await page.evaluate(() => {
          const viewport = window.visualViewport!;
          Object.defineProperty(viewport, "height", { configurable: true, value: 360 });
          viewport.dispatchEvent(new Event("resize"));
        });
        await expect(page.locator(".utility-screen")).toHaveCSS("height", "360px");
        await expect(email).toHaveValue("test@example.invalid");
        const inputBounds = (await email.boundingBox())!;
        const headerBounds = (await sync.locator(".editor-header").boundingBox())!;
        expect(inputBounds.y).toBeGreaterThanOrEqual(headerBounds.y + headerBounds.height);
        expect(inputBounds.y + inputBounds.height).toBeLessThanOrEqual(360);
      }
      await page.screenshot({ path: `/tmp/spark-sync-full-${width}-${theme}.png`, clip: { x: 0, y: 0, width, height: width < 700 ? 360 : 700 } });
      await page.keyboard.press("Escape");
      await expect(sync).toBeHidden();
      await expect(page.locator("body")).not.toHaveCSS("position", "fixed");
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    });
  }
}
