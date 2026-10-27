import { test, expect } from "./fixtures";

for (const width of [320, 390]) {
  for (const theme of ["light", "dark"] as const) {
    for (const type of ["task", "note"] as const) {
      test(`mobile ${type} detail fills the screen at ${width}px in ${theme}`, async ({ page }) => {
        await page.setViewportSize({ width, height: 844 });
        await page.emulateMedia({ colorScheme: theme });
        await page.goto("/");
        await page.getByRole("region", { name: "Khởi động Spark" }).waitFor({ state: "hidden" });
        await page.keyboard.press("a");
        const title = type === "task" ? "Chốt ba việc quan trọng cho hôm nay" : "Ý tưởng: dành 20 phút cuối ngày để thu gọn danh sách";
        const open = () => page.locator(".item-main").filter({ hasText: title }).click();
        await open();
        const sheet = page.locator(".item-detail-sheet");
        await page.locator(".item-detail-backdrop").evaluate(el => Promise.all(el.getAnimations().map(a => a.finished)));
        expect(await sheet.boundingBox()).toEqual({ x: 0, y: 0, width, height: 844 });
        await expect(sheet).toHaveCSS("background-color", theme === "dark" ? "rgb(18, 22, 34)" : "rgb(247, 248, 250)");
        await expect(sheet.locator(".detail-description")).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
        await expect(sheet.locator(".detail-description")).toHaveCSS("padding-left", "0px");
        await expect(sheet).toHaveCSS("border-radius", "0px");
        await expect(sheet).toHaveCSS("box-shadow", "none");
        await expect(sheet.locator(".editor-header h2, .editor-header > div")).toHaveCount(0);
        await expect(page.locator("body")).toHaveCSS("overflow", "hidden");
        await expect(page.getByRole("button", { name: "Đóng", exact: true })).toBeInViewport();
        const read = sheet.locator(".detail-description .detail-read-row");
        expect((await read.boundingBox())!.height).toBeGreaterThan(844 * .4);
        await page.getByRole("button", { name: "Sửa Nội dung", exact: true }).click();
        const editor = page.getByRole("textbox", { name: type === "task" ? "Nội dung task" : "Nội dung ghi chú", exact: true });
        await expect(editor).toBeFocused();
        const content = "Nội dung dài cần đọc và chỉnh sửa.\n".repeat(90);
        await editor.fill(content);
        await expect(sheet.locator(".editor-header")).toBeHidden();
        await expect(sheet.locator(".detail-title-row")).toBeHidden();
        await expect(sheet.locator(".detail-metadata")).toBeHidden();
        await expect(editor).toHaveCSS("font-size", "16px");
        const heading = sheet.locator(".detail-field-heading");
        const headerBefore = await heading.boundingBox();
        await editor.evaluate(el => { el.scrollTop = el.scrollHeight; });
        expect(await heading.boundingBox()).toEqual(headerBefore);
        await expect(page.getByRole("button", { name: "Lưu Nội dung", exact: true })).toBeInViewport();
        await expect(page.getByRole("button", { name: "Hủy", exact: true })).toBeInViewport();
        expect((await editor.boundingBox())!.height).toBeGreaterThan(844 * .4);
        const draftBeforeViewportChange = await editor.innerText();
        if (width === 390) {
          // Model the visual viewport shrinking/panning when a phone keyboard opens.
          await page.evaluate(() => {
            const viewport = window.visualViewport!;
            Object.defineProperty(viewport, "height", { configurable: true, get: () => 420 });
            Object.defineProperty(viewport, "offsetTop", { configurable: true, get: () => 20 });
            viewport.dispatchEvent(new Event("resize"));
          });
          await expect.poll(async () => (await sheet.boundingBox())!.height).toBe(420);
          expect((await sheet.boundingBox())!.y).toBe(20);
          const inputBox = (await editor.boundingBox())!;
          expect(inputBox.height).toBeGreaterThan(240);
          expect(inputBox.y + inputBox.height).toBeLessThanOrEqual(440);
          await expect(page.getByRole("button", { name: "Lưu Nội dung", exact: true })).toBeInViewport();
          await expect(page.getByRole("button", { name: "Hủy", exact: true })).toBeInViewport();
          await page.screenshot({ path: `/tmp/spark-focused-${theme}-${type}.png`, clip: { x: 0, y: 20, width, height: 420 } });
          if (type === "task" && theme === "light") {
            const cdp = await page.context().newCDPSession(page);
            await cdp.send("Emulation.setSafeAreaInsetsOverride", { insets: { top: 59, bottom: 34, left: 0, right: 0 } });
            expect((await editor.boundingBox())!.height).toBeGreaterThan(150);
            await expect(page.getByRole("button", { name: "Lưu Nội dung", exact: true })).toBeInViewport();
            await editor.press("ArrowLeft");
            await editor.press("ArrowRight");
            await expect(editor).toBeFocused();
            const caret = await editor.evaluate(el => {
              const selection = window.getSelection();
              const range = selection!.getRangeAt(0).getBoundingClientRect();
              const box = el.getBoundingClientRect();
              return { top: range.top, bottom: range.bottom, editorTop: box.top, editorBottom: box.bottom };
            });
            expect(caret.top).toBeGreaterThanOrEqual(caret.editorTop);
            expect(caret.bottom).toBeLessThanOrEqual(caret.editorBottom);
            await cdp.send("Emulation.setSafeAreaInsetsOverride", { insets: { top: 0, bottom: 0, left: 0, right: 0 } });
            await cdp.detach();
          }
          expect(await editor.innerText()).toBe(draftBeforeViewportChange);
          await page.evaluate(() => {
            Reflect.deleteProperty(window.visualViewport!, "height");
            Reflect.deleteProperty(window.visualViewport!, "offsetTop");
            window.visualViewport!.dispatchEvent(new Event("resize"));
          });
          await expect.poll(async () => (await sheet.boundingBox())!.height).toBe(844);
          await page.setViewportSize({ width: 600, height: 390 });
          await expect.poll(async () => (await sheet.boundingBox())!.height).toBe(390);
          await expect(page.getByRole("button", { name: "Lưu Nội dung", exact: true })).toBeInViewport();
          await expect(page.getByRole("button", { name: "Hủy", exact: true })).toBeInViewport();
          await page.setViewportSize({ width, height: 844 });
        }
        await page.getByRole("button", { name: "Lưu Nội dung", exact: true }).click();
        await expect(sheet.locator(".editor-header")).toBeVisible();
        await expect(sheet.locator(".detail-title-row")).toBeVisible();
        await expect(sheet.locator(".detail-metadata")).toBeVisible();
        await page.getByRole("button", { name: "Sửa Nội dung", exact: true }).click();
        await editor.fill("Bản nháp cần hủy");
        await page.getByRole("button", { name: "Hủy", exact: true }).click();
        await expect(read).toHaveText(content);
        await read.evaluate(el => { el.scrollTop = el.scrollHeight; });
        await expect(page.getByRole("button", { name: "Sửa Nội dung", exact: true })).toBeInViewport();
        await page.screenshot({ path: `/tmp/spark-detail-${width}-${theme}-${type}.png` });
        await page.getByRole("button", { name: "Đóng", exact: true }).click();
        await expect(sheet).toBeHidden();
        await expect(page.locator("body")).not.toHaveCSS("overflow", "hidden");
        await page.reload();
        await page.getByRole("region", { name: "Khởi động Spark" }).waitFor({ state: "hidden" });
        await page.keyboard.press("a");
        await open();
        await expect(page.locator(".detail-description .formatted-content")).toHaveText(content);
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      });
    }
  }
}
