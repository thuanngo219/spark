import { test, expect } from "./fixtures";

for (const theme of ["light", "dark"] as const) {
  test(`mobile ${theme}: browser colors follow theme and sidebar without changing preference`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.emulateMedia({ colorScheme: theme === "dark" ? "light" : "dark" });
    await page.addInitScript(theme => localStorage.setItem("spark:theme:v1", theme), theme);
    await page.goto("/");
    await page.getByRole("region", { name: "Khởi động Spark" }).waitFor({ state: "hidden" });
    const root = page.locator("html");
    const canvas = theme === "dark" ? "rgb(18, 22, 34)" : "rgb(247, 248, 250)";
    const hex = theme === "dark" ? "#121622" : "#f7f8fa";
    await expect(page.locator('meta[name="apple-mobile-web-app-status-bar-style"]')).toHaveCount(0);
    await expect(page.locator('meta[name="mobile-web-app-capable"]')).toHaveAttribute("content", "yes");
    await expect(page.locator('meta[name="apple-mobile-web-app-title"]')).toHaveAttribute("content", "Spark");
    await expect(root).toHaveCSS("background-color", canvas);
    await expect(page.locator("body")).toHaveCSS("background-color", canvas);
    await expect(page.locator('meta[name="theme-color"]')).toHaveCount(1);
    await expect(page.locator('meta[name="color-scheme"]')).toHaveCount(1);
    await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute("content", hex);
    await expect(page.locator('meta[name="color-scheme"]')).toHaveAttribute("content", theme);
    await expect(page.locator(".view-header")).toHaveCSS("padding-top", "12px");

    const cdp = await page.context().newCDPSession(page);
    await cdp.send("Emulation.setSafeAreaInsetsOverride", { insets: { top: 59, bottom: 34, left: 0, right: 0 } });
    await expect(page.locator(".view-header")).toHaveCSS("padding-top", "67px");
    await page.getByRole("button", { name: "Mở sidebar", exact: true }).click();
    const menu = page.locator(".sidebar-mobile");
    await expect(menu).toBeVisible();
    await expect(page.locator(".mobile-nav-backdrop")).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
    await expect(page.locator(".mobile-nav-backdrop")).toHaveCSS("backdrop-filter", "blur(5px)");
    if (await page.evaluate(() => CSS.supports("-webkit-backdrop-filter", "blur(5px)"))) {
      await expect(page.locator(".mobile-nav-backdrop")).toHaveCSS("-webkit-backdrop-filter", "blur(5px)");
    }
    await expect(menu).toHaveCSS("padding-top", "67px");
    await expect(menu).toHaveCSS("background-color", "rgb(17, 23, 66)");
    await expect(root).toHaveCSS("background-color", "rgb(17, 23, 66)");
    await expect(page.locator("body")).toHaveCSS("background-color", "rgb(17, 23, 66)");
    await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute("content", "#111742");
    await expect(page.locator('meta[name="color-scheme"]')).toHaveAttribute("content", "dark");
    // Browser chrome can be Navy without repainting the content below the scrim
    // or switching native controls to dark in an otherwise light app.
    await expect(page.locator(".app-shell")).toHaveCSS("background-color", canvas);
    await expect(page.locator("main")).toHaveCSS("color-scheme", theme);
    await expect(page.locator("main select").first()).toHaveCSS("color-scheme", theme);
    await expect(menu).toHaveCSS("color-scheme", "dark");
    expect(await page.evaluate(() => localStorage.getItem("spark:theme:v1"))).toBe(theme);
    await expect(root).toHaveAttribute("data-theme", theme);
    await page.locator(".mobile-nav-backdrop").evaluate(el => Promise.all(el.getAnimations({ subtree: true }).map(a => a.finished)));
    expect((await menu.getByRole("button", { name: "Đóng điều hướng" }).boundingBox())!.y).toBeGreaterThanOrEqual(59);
    await page.screenshot({ path: `/tmp/spark-status-sidebar-${theme}.png` });

    // An open mobile menu must not tint desktop after crossing the breakpoint.
    await page.setViewportSize({ width: 1280, height: 844 });
    await expect(root).toHaveCSS("background-color", canvas);
    await expect(root).toHaveCSS("color-scheme", theme);
    await expect(page.locator(".app-shell")).toHaveCSS("background-color", canvas);
    await expect(page.locator("main")).toHaveCSS("color-scheme", theme);
    await page.setViewportSize({ width: 390, height: 844 });
    await expect(root).toHaveCSS("background-color", "rgb(17, 23, 66)");
    await menu.getByRole("button", { name: "Đóng điều hướng" }).click();
    await expect(root).toHaveCSS("background-color", canvas);
    await expect(root).toHaveCSS("color-scheme", theme);
    await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute("content", hex);

    // Native touch edge-open takes the same path as the menu button.
    await cdp.send("Emulation.setTouchEmulationEnabled", { enabled: true, maxTouchPoints: 1 });
    const row = (await page.locator(".item-row").first().boundingBox())!;
    const y = row.y + 15;
    await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: 8, y }] });
    for (let x = 20; x <= 150; x += 20) await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x, y }] });
    await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
    await expect(menu).toBeVisible();
    await expect(root).toHaveCSS("background-color", "rgb(17, 23, 66)");
    await menu.getByRole("button", { name: "Công việc", exact: true }).click();
    await expect(menu).toBeHidden();
    await expect(root).toHaveCSS("background-color", canvas);
    await cdp.send("Emulation.setSafeAreaInsetsOverride", { insets: { top: 0, bottom: 0, left: 0, right: 0 } });
    await page.screenshot({ path: `/tmp/spark-status-header-${theme}.png` });
    await cdp.detach();
  });

  test(`${theme} browser background is set before CSS and React load`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.emulateMedia({ colorScheme: theme === "dark" ? "light" : "dark" });
    await page.addInitScript(theme => localStorage.setItem("spark:theme:v1", theme), theme);
    await page.route("**/_next/**", route => route.abort());
    await page.goto("/");
    await expect(page.locator("html")).toHaveCSS("background-color", theme === "dark" ? "rgb(18, 22, 34)" : "rgb(247, 248, 250)");
    await expect(page.locator("html")).toHaveCSS("color-scheme", theme);
    await expect(page.locator('meta[name="color-scheme"]')).toHaveAttribute("content", theme);
  });
}
