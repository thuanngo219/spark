import { test, expect } from "./fixtures";

for (const width of [320, 390, 600]) {
  for (const theme of ["light", "dark"] as const) {
    test(`mobile dock is flush and labelled at ${width}px in ${theme}`, async ({ page }) => {
      const height = width === 600 ? 390 : 844;
      await page.setViewportSize({ width, height });
      await page.emulateMedia({ colorScheme: theme });
      await page.goto("/");
      await page.getByRole("region", { name: "Khởi động Spark" }).waitFor({ state: "hidden" });
      const dock = page.getByRole("navigation", { name: "Điều hướng mobile" });
      expect(await dock.boundingBox()).toEqual({ x: 0, y: height - 58, width, height: 58 });
      await expect(dock).toHaveCSS("border-radius", "0px");
      await expect(dock).toHaveCSS("background-color", theme === "light" ? "rgb(255, 255, 255)" : "rgb(27, 32, 48)");
      for (const name of ["Hôm nay", "Sắp tới", "Theo ngày", "Tất cả"]) {
        const button = dock.getByRole("button", { name, exact: true });
        const label = button.locator(".mobile-dock-label");
        await expect(label).toHaveText(name);
        const iconBox = (await button.locator("svg").boundingBox())!;
        const labelBox = (await label.boundingBox())!;
        const buttonBox = (await button.boundingBox())!;
        expect(labelBox.y).toBeGreaterThanOrEqual(iconBox.y + iconBox.height);
        expect(labelBox.x).toBeGreaterThanOrEqual(buttonBox.x);
        expect(labelBox.x + labelBox.width).toBeLessThanOrEqual(buttonBox.x + buttonBox.width);
        expect(buttonBox.width).toBeGreaterThanOrEqual(44);
        expect(buttonBox.height).toBeGreaterThanOrEqual(44);
        await button.click();
        await expect(button).toHaveAttribute("aria-current", "page");
        await expect(button).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
        await expect(button.locator(".mobile-dock-icon")).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
        await expect(label).toHaveCSS("font-weight", "700");
        const contrast = await button.evaluate(el => {
          const luminance = (color: string) => {
            const rgb = color.match(/[\d.]+/g)!.slice(0, 3).map(Number).map(c => {
              const value = c / 255;
              return value <= .04045 ? value / 12.92 : ((value + .055) / 1.055) ** 2.4;
            });
            return rgb[0] * .2126 + rgb[1] * .7152 + rgb[2] * .0722;
          };
          const ink = luminance(getComputedStyle(el.querySelector("svg")!).color);
          const background = luminance(getComputedStyle(el.closest("nav")!).backgroundColor);
          return (Math.max(ink, background) + .05) / (Math.min(ink, background) + .05);
        });
        expect(contrast).toBeGreaterThanOrEqual(4.5);
      }
      const add = dock.getByRole("button", { name: "Thêm công việc", exact: true });
      await expect(add).toHaveText("");
      const addBox = (await add.locator("span").boundingBox())!;
      expect(addBox.width).toBe(64);
      expect((await add.locator("svg").boundingBox())!.width).toBe(36);
      expect(addBox.y).toBeLessThan(height - 58);
      expect(addBox.y + addBox.height).toBeLessThan(height);
      await add.click();
      await expect(page.getByRole("textbox", { name: "Tên mục", exact: true })).toBeVisible();
      await page.getByRole("button", { name: "Hủy", exact: true }).click();
      await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
      const controlsBox = (await page.locator(".mobile-floating-controls").boundingBox())!;
      expect(controlsBox.y + controlsBox.height).toBeLessThan(height - 58);
      const lastItem = (await page.locator(".item-main").last().boundingBox())!;
      expect(lastItem.y + lastItem.height).toBeLessThanOrEqual(controlsBox.y);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      await page.screenshot({ path: `/tmp/spark-dock-${width}-${theme}.png` });
      if (width === 390 && theme === "light") {
        const cdp = await page.context().newCDPSession(page);
        await cdp.send("Emulation.setSafeAreaInsetsOverride", { insets: { top: 0, left: 20, right: 20, bottom: 34 } });
        await expect.poll(async () => (await dock.boundingBox())!.height).toBe(92);
        const safeDock = (await dock.boundingBox())!;
        expect(safeDock.x).toBe(0);
        expect(safeDock.width).toBe(width);
        expect(safeDock.y + safeDock.height).toBe(height);
        const firstButton = (await dock.getByRole("button").first().boundingBox())!;
        const lastButton = (await dock.getByRole("button").last().boundingBox())!;
        expect(firstButton.x).toBe(20);
        expect(lastButton.x + lastButton.width).toBe(width - 20);
        expect(lastButton.y + lastButton.height).toBe(height - 34);
        await cdp.send("Emulation.setSafeAreaInsetsOverride", { insets: { top: 0, left: 0, right: 0, bottom: 0 } });
        await cdp.detach();
      }
      if (width === 390) {
        await page.setViewportSize({ width: 1280, height: 844 });
        await expect(dock).toBeHidden();
        await expect(page.locator(".app-shell > .sidebar")).toBeVisible();
      }
    });
  }
}
