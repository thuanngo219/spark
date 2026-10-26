import { expect, test } from "./fixtures";

for (const theme of ["light", "dark"] as const) {
  test(`mobile editor isolates background scroll and restores position in ${theme}`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.emulateMedia({ colorScheme: theme });
    await page.addInitScript(() => {
      localStorage.setItem("spark:data:v1", JSON.stringify({ projects: [], items: Array.from({ length: 40 }, (_, i) => ({
        id: crypto.randomUUID(), type: "task", title: `Cuộn nền ${i + 1}`, description: "", startDate: null, dueDate: null, projectId: null,
        completedAt: null, archivedAt: null, isImportant: false, isUrgent: false, createdAt: new Date().toISOString(),
      })) }));
    });
    await page.goto("/");
    await page.getByRole("region", { name: "Khởi động Spark" }).waitFor({ state: "hidden" });
    await page.keyboard.press("a");
    await page.evaluate(() => window.scrollTo(0, 400));
    await expect(page.locator(".view-header")).toHaveClass(/is-compact/);
    await expect(page.locator(".view-header h1")).toHaveCSS("font-size", "21px");
    const originalY = await page.evaluate(() => scrollY);
    await page.locator(".item-main").filter({ hasText: "Cuộn nền 10" }).click();
    await page.getByRole("button", { name: "Sửa Nội dung", exact: true }).click();
    const editor = page.getByRole("textbox", { name: "Nội dung task", exact: true });
    await expect(editor).toBeFocused();
    await editor.fill("Nội dung cuộn độc lập.\n".repeat(120));
    await page.evaluate(() => {
      Object.defineProperty(visualViewport!, "height", { configurable: true, get: () => 420 });
      Object.defineProperty(visualViewport!, "offsetTop", { configurable: true, get: () => 20 });
      visualViewport!.dispatchEvent(new Event("resize"));
    });
    const sheet = page.locator(".item-detail-sheet");
    await expect.poll(async () => (await sheet.boundingBox())!.height).toBe(420);
    // Even outside the shrunken visual viewport, the list/dock must remain covered.
    expect(await page.evaluate(() => Boolean(document.elementFromPoint(195, 750)?.closest(".item-detail-backdrop")))).toBe(true);
    await expect(page.locator("body")).toHaveCSS("position", "fixed");
    await expect(page.locator(".content")).toHaveAttribute("inert", "");
    await expect(page.locator(".mobile-dock")).toHaveAttribute("inert", "");
    const backgroundTop = (await page.locator(".content").boundingBox())!.y;
    const lockedY = await page.evaluate(() => scrollY);
    const cdp = await page.context().newCDPSession(page);
    await cdp.send("Emulation.setTouchEmulationEnabled", { enabled: true, maxTouchPoints: 1 });
    const swipe = async (x: number, y: number, dy: number) => {
      await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x, y }] });
      for (let i = 1; i <= 8; i++) await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x, y: y + dy * i / 8 }] });
      await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
    };
    await editor.evaluate(el => { el.scrollTop = 0; });
    await swipe(195, 340, -150);
    await expect.poll(() => editor.evaluate(el => el.scrollTop)).toBeGreaterThan(0);
    await editor.evaluate(el => { el.scrollTop = el.scrollHeight; });
    await swipe(195, 340, -150);
    await editor.evaluate(el => { el.scrollTop = 0; });
    await swipe(195, 180, 150);
    await swipe(195, 55, 150);
    await swipe(195, 730, -150);
    await page.mouse.click(195, 750);
    await expect(sheet).toBeVisible();
    await page.screenshot({ path: `/tmp/spark-scroll-locked-${theme}.png` });
    expect(await page.evaluate(() => scrollY)).toBe(lockedY);
    expect((await page.locator(".content").boundingBox())!.y).toBe(backgroundTop);
    await expect(page.locator(".view-header")).toHaveClass(/is-compact/);
    await page.evaluate(() => {
      Reflect.deleteProperty(visualViewport!, "height");
      Reflect.deleteProperty(visualViewport!, "offsetTop");
      visualViewport!.dispatchEvent(new Event("resize"));
    });
    await page.getByRole("button", { name: "Lưu Nội dung", exact: true }).click();
    await page.getByRole("button", { name: "Đóng", exact: true }).click();
    await expect(sheet).toBeHidden();
    await expect.poll(() => page.evaluate(() => scrollY)).toBe(originalY);
    await expect(page.locator("body")).not.toHaveCSS("position", "fixed");
    await expect(page.locator(".content")).not.toHaveAttribute("inert");
    await page.mouse.move(300, 300);
    await page.mouse.wheel(0, 120);
    await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(originalY);
    // A breakpoint change must release the lock, then reacquire it on mobile.
    await page.locator(".item-main").filter({ hasText: "Cuộn nền 10" }).click();
    await expect(page.locator("body")).toHaveCSS("position", "fixed");
    await page.setViewportSize({ width: 1280, height: 844 });
    await expect(page.locator("body")).not.toHaveCSS("position", "fixed");
    await expect(page.locator(".content")).not.toHaveAttribute("inert");
    await page.setViewportSize({ width: 390, height: 844 });
    await expect(page.locator("body")).toHaveCSS("position", "fixed");
    await page.getByRole("button", { name: "Đóng", exact: true }).click();
    await expect(page.locator("body")).not.toHaveCSS("position", "fixed");
    await expect(page.locator(".mobile-dock")).not.toHaveAttribute("inert");
    await cdp.detach();
  });
}
