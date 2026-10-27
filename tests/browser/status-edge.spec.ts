import { test, expect } from "./fixtures";
import type { Page } from "@playwright/test";
import sharp from "sharp";

// Keep the top edge in theme throughout loading so WebKit never has to switch
// back from a sampled Navy splash. The progress bar starts at the Navy boundary.
async function expectPaintedEdge(page: Page, rgb: number[]) {
  const image = await sharp(await page.screenshot({ clip: { x: 0, y: 0, width: 390, height: 12 } })).removeAlpha().raw().toBuffer();
  for (const x of [5, 195, 384]) {
    for (const y of [4, 5]) {
      const offset = (y * 390 + x) * 3;
      expect([...image.subarray(offset, offset + 3)]).toEqual(rgb);
    }
  }
}

for (const initial of ["light", "dark"] as const) {
  test(`painted status edge survives loading, theme changes and menu in ${initial}`, async ({ page, request }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.emulateMedia({ colorScheme: initial });
    await page.addInitScript(() => {
      localStorage.setItem("spark:theme:v1", "system");
      const observer = new MutationObserver(() => {
        const splash = document.querySelector(".startup-screen.is-ready");
        if (!splash) return;
        observer.disconnect();
        // Hold the real loading overlay while inspecting its painted top edge.
        splash.getAnimations({ subtree: true }).forEach(animation => animation.pause());
      });
      observer.observe(document, { subtree: true, childList: true, attributes: true, attributeFilter: ["class"] });
    });
    await page.goto("/");
    const splash = page.getByRole("region", { name: "Khởi động Spark" });
    await expect(splash).toHaveClass(/is-ready/);
    const colors = { light: [247, 248, 250], dark: [18, 22, 34] };
    await expectPaintedEdge(page, colors[initial]);
    const bar = await page.locator(".startup-progress").boundingBox();
    expect(bar).toEqual({ x: 0, y: 12, width: 390, height: 3 });
    const underBar = await sharp(await page.screenshot({ clip: { x: 0, y: 15, width: 390, height: 1 } })).removeAlpha().raw().toBuffer();
    for (const x of [5, 195, 384]) expect([...underBar.subarray(x * 3, x * 3 + 3)]).toEqual([17, 23, 66]);
    // Real safe-area insets move both Navy and progress together, not the logo.
    const cdp = await page.context().newCDPSession(page);
    await cdp.send("Emulation.setSafeAreaInsetsOverride", { insets: { top: 59, bottom: 34, left: 0, right: 0 } });
    await expect(page.locator(".browser-top-surface")).toHaveCSS("height", "59px");
    expect((await page.locator(".startup-progress").boundingBox())!.y).toBe(59);
    await expectPaintedEdge(page, colors[initial]);
    await cdp.send("Emulation.setSafeAreaInsetsOverride", { insets: { top: 0, bottom: 0, left: 0, right: 0 } });
    await cdp.detach();
    const next = initial === "light" ? "dark" : "light";
    await page.emulateMedia({ colorScheme: next });
    await expect(page.locator("html")).toHaveAttribute("data-theme", next);
    await expectPaintedEdge(page, colors[next]);
    await page.emulateMedia({ colorScheme: initial });
    await expect(page.locator("html")).toHaveAttribute("data-theme", initial);
    await expectPaintedEdge(page, colors[initial]);
    await page.screenshot({ path: `/tmp/spark-status-loading-${initial}.png` });
    await splash.evaluate(el => el.getAnimations({ subtree: true }).forEach(animation => animation.play()));
    await expect(splash).toBeHidden();
    await expectPaintedEdge(page, colors[initial]);

    await page.emulateMedia({ colorScheme: next });
    await expect(page.locator("html")).toHaveAttribute("data-theme", next);
    await expectPaintedEdge(page, colors[next]);
    await page.getByRole("button", { name: "Mở sidebar", exact: true }).click();
    await expectPaintedEdge(page, [17, 23, 66]);
    await page.emulateMedia({ colorScheme: initial });
    await expectPaintedEdge(page, [17, 23, 66]);
    await page.getByRole("button", { name: "Đóng điều hướng" }).click();
    await expectPaintedEdge(page, colors[initial]);
    // Explicit app preference wins over the OS and updates the same painted edge.
    await page.evaluate(theme => window.dispatchEvent(new CustomEvent("spark:theme-select", { detail: theme })), next);
    await expectPaintedEdge(page, colors[next]);
    await page.locator(".view-header").evaluate(el => Promise.all(el.getAnimations({ subtree: true }).map(animation => animation.finished)));
    await page.screenshot({ path: `/tmp/spark-status-edge-${initial}.png` });
    await page.setViewportSize({ width: 1280, height: 844 });
    await expect(page.locator(".browser-top-surface")).toBeHidden();
    const manifest = await (await request.get("/manifest.webmanifest")).json();
    expect(manifest.color_scheme_dark).toEqual({ background_color: "#121622", theme_color: "#121622" });
  });
}
