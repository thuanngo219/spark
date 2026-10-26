import { expect, test } from "./fixtures";

for (const theme of ["light", "dark"] as const) {
  test(`mobile content reclaims keyboard gap and restores safe area in ${theme}`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.emulateMedia({ colorScheme: theme });
    const cdp = await page.context().newCDPSession(page);
    await cdp.send("Emulation.setSafeAreaInsetsOverride", { insets: { top: 59, bottom: 34, left: 0, right: 0 } });
    await page.goto("/");
    await page.getByRole("region", { name: "Khởi động Spark" }).waitFor({ state: "hidden" });
    await page.keyboard.press("a");
    await page.locator(".item-main").filter({ hasText: "Chốt ba việc quan trọng cho hôm nay" }).click();
    await page.getByRole("button", { name: "Sửa Nội dung", exact: true }).click();
    const content = page.locator(".item-detail-sheet .detail-content");
    const editor = page.getByRole("textbox", { name: "Nội dung task", exact: true });
    const draft = "Nội dung vẫn giữ khi bàn phím đóng/mở.\n".repeat(50);
    await editor.fill(draft);
    const originalText = await editor.innerText();
    await expect(content).toHaveCSS("padding-bottom", "46px");
    const resize = async (height: number, scale = 1) => page.evaluate(({ height, scale }) => {
      Object.defineProperty(visualViewport!, "height", { configurable: true, get: () => height });
      Object.defineProperty(visualViewport!, "scale", { configurable: true, get: () => scale });
      visualViewport!.dispatchEvent(new Event("resize"));
    }, { height, scale });
    // Browser chrome and pinch zoom must not remove the home-indicator inset.
    await resize(764);
    await expect(content).toHaveCSS("padding-bottom", "46px");
    await resize(420, 2);
    await expect(content).toHaveCSS("padding-bottom", "46px");
    await resize(420);
    await expect(content).toHaveCSS("padding-bottom", "0px");
    const sheetBox = (await page.locator(".item-detail-sheet").boundingBox())!;
    const editorBox = (await editor.boundingBox())!;
    expect(Math.abs(editorBox.y + editorBox.height - sheetBox.y - sheetBox.height)).toBeLessThanOrEqual(1);
    await editor.evaluate(el => { el.scrollTop = el.scrollHeight; });
    await expect.poll(() => editor.evaluate(el => el.scrollTop)).toBeGreaterThan(0);
    await expect(page.getByRole("button", { name: "Lưu Nội dung", exact: true })).toBeInViewport();
    await page.screenshot({ path: `/tmp/spark-keyboard-gap-${theme}.png`, clip: { x: 0, y: 0, width: 390, height: 420 } });
    // Done can dismiss the keyboard while the contenteditable retains focus.
    await resize(844);
    await expect(content).toHaveCSS("padding-bottom", "46px");
    await expect(editor).toBeFocused();
    expect(await editor.innerText()).toBe(originalText);
    await resize(420);
    await expect(content).toHaveCSS("padding-bottom", "0px");
    await page.getByRole("button", { name: "Lưu Nội dung", exact: true }).click();
    await expect(page.locator(".detail-description .formatted-content")).toHaveText(draft);
    await page.getByRole("button", { name: "Đóng", exact: true }).click();
    await expect(page.locator("body")).not.toHaveCSS("position", "fixed");
    await cdp.detach();
  });
}
