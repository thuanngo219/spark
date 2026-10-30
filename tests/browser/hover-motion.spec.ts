import { test, expect } from "./fixtures";

for (const theme of ["light", "dark"] as const) {
  test(`desktop hover interpolates and respects reduced motion: ${theme}`, async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 844 });
    await page.emulateMedia({ colorScheme: theme });
    await page.goto("/");
    await expect(page.getByRole("region", { name: "Khởi động Spark" })).toBeHidden();
    await page.getByRole("button", { name: "Thêm công việc", exact: true }).click();
    const add = page.locator(".quick-add-dialog .primary-button");
    await expect(add).toBeDisabled();
    await add.hover({ force: true });
    await expect(add).toHaveCSS("background-color", "rgb(68, 212, 205)");
    await page.getByRole("textbox", { name: "Tên mục", exact: true }).fill("Kiểm tra chuyển màu");
    await page.mouse.move(0, 0);
    await expect(add).toHaveCSS("background-color", "rgb(68, 212, 205)");
    await add.hover();
    const intermediate = await add.evaluate(el => {
      const transitions = el.getAnimations().filter(a => a instanceof CSSTransition && a.transitionProperty === "background-color");
      for (const animation of transitions) {
        animation.pause();
        animation.currentTime = 110;
      }
      return { count: transitions.length, duration: transitions[0]?.effect?.getTiming().duration, color: getComputedStyle(el).backgroundColor };
    });
    expect(intermediate.count).toBe(1);
    expect(intermediate.duration).toBe(220);
    expect(intermediate.color).not.toBe("rgb(68, 212, 205)");
    expect(intermediate.color).not.toBe("rgb(17, 23, 66)");
    await add.evaluate(el => el.getAnimations().forEach(a => a.finish()));
    await expect(add).toHaveCSS("background-color", "rgb(17, 23, 66)");
    await page.mouse.move(0, 0);
    await expect(add).toHaveCSS("background-color", "rgb(68, 212, 205)");
    await page.emulateMedia({ reducedMotion: "reduce" });
    const durations = await add.evaluate(el => getComputedStyle(el).transitionDuration.split(",").map(parseFloat));
    expect(durations.every(duration => duration <= 0.00001)).toBe(true);
    await add.hover();
    await expect(add).toHaveCSS("background-color", "rgb(17, 23, 66)");
  });
}

test.describe("touch motion", () => {
  test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  test("touch buttons retain immediate feedback and drawer reduced motion", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("region", { name: "Khởi động Spark" })).toBeHidden();
    await page.getByRole("button", { name: "Mở sidebar", exact: true }).tap();
    await expect(page.locator(".mobile-nav-panel")).toHaveCSS("animation-duration", "0.24s");
    await page.emulateMedia({ reducedMotion: "reduce" });
    await expect(page.locator(".mobile-nav-panel")).toHaveCSS("animation-duration", "1e-05s");
    await page.locator(".mobile-nav-backdrop").tap({ position: { x: 388, y: 200 } });
    await page.getByRole("button", { name: "Thêm công việc", exact: true }).tap();
    const add = page.locator(".quick-add-dialog .primary-button");
    await expect(add).toHaveCSS("transition-duration", "0s");
    await expect(add).toHaveCSS("background-color", "rgb(17, 23, 66)");
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
});
