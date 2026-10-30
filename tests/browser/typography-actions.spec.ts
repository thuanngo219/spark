import { test, expect } from "./fixtures";

for (const width of [320, 390, 1280]) {
  for (const theme of ["light", "dark"] as const) {
    test(`shared typography and action states ${width}px ${theme}`, async ({ page }) => {
      await page.setViewportSize({ width, height: 844 });
      await page.emulateMedia({ colorScheme: theme });
      await page.goto("/");
      await expect(page.getByRole("region", { name: "Khởi động Spark" })).toBeHidden();
      await page.evaluate(() => document.fonts.ready);
      await expect(page.locator("html")).toHaveCSS("font-size", "16px");
      await expect(page.locator(".item-title").first()).toHaveCSS("font-size", "16px");
      await expect(page.locator(".item-title").first()).toHaveCSS("font-weight", "400");
      await expect(page.locator(".item-title").first()).toHaveCSS("line-height", "22.4px");
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      if (width >= 700) await expect(page.locator(".nav-text").first()).toHaveCSS("font-size", "16px");
      await page.getByRole("button", { name: "Thêm công việc", exact: true }).click();
      const form = page.locator(".quick-add-dialog");
      const add = form.getByRole("button", { name: "Thêm", exact: true });
      const title = form.getByRole("textbox", { name: "Tên mục", exact: true });
      await expect(form.locator(".quick-title-field > span")).toHaveCSS("font-size", width < 700 ? "10px" : "12px");
      await expect(title).toHaveCSS("font-size", "16px");
      await expect(add).toBeDisabled();
      const disabledColor = await add.evaluate(el => getComputedStyle(el).backgroundColor);
      await add.hover({ force: true });
      await expect(add).toHaveCSS("background-color", disabledColor);
      await title.fill("Tiếng Việt: Ắ Ằ Ẳ Ẵ Ặ Ấ Ầ Ẩ Ẫ Ậ Ế Ề Ể Ễ Ệ Ố Ồ Ổ Ỗ Ộ Ớ Ờ Ở Ỡ Ợ Ứ Ừ Ử Ữ Ự đ");
      await page.mouse.move(0, 0);
      await expect(add).toHaveCSS("background-color", width < 700 ? "rgb(17, 23, 66)" : "rgb(68, 212, 205)");
      await add.hover();
      await expect(add).toHaveCSS("background-color", width < 700 ? "rgb(68, 212, 205)" : "rgb(17, 23, 66)");
      await expect(add).toHaveCSS("color", width < 700 ? "rgb(17, 23, 66)" : "rgb(255, 255, 255)");
      await expect(title).toHaveValue(/Tiếng Việt/);
      await form.getByRole("button", { name: "Hủy", exact: true }).click();
      await page.locator(".item-main").first().click();
      const close = page.locator(".detail-close-button");
      await page.mouse.move(0, 0);
      await expect(close).toHaveCSS("background-color", "rgb(17, 23, 66)");
      await close.hover();
      await expect(close).toHaveCSS("background-color", "rgb(68, 212, 205)");
      await expect(close).toHaveCSS("color", "rgb(17, 23, 66)");
      await expect(page.locator(".detail-read-row > p").first()).toHaveCSS("font-size", "18px");
      await page.getByRole("button", { name: "Sửa Nội dung", exact: true }).click();
      const editor = page.locator(".content-editor-input");
      await editor.fill("Nội dung tiếng Việt có dấu: Ắ Ằ Ẳ Ẵ Ặ Ấ Ầ Ẩ Ẫ Ậ Ế Ề Ể Ễ Ệ Ố Ồ Ổ Ỗ Ộ Ớ Ờ Ở Ỡ Ợ Ứ Ừ Ử Ữ Ự đ");
      await expect(editor).toHaveCSS("font-size", "16px");
      await expect(editor).toHaveCSS("line-height", "25.6px");
      const client = await page.context().newCDPSession(page);
      await client.send("DOM.enable");
      await client.send("CSS.enable");
      const { root } = await client.send("DOM.getDocument");
      const { nodeId } = await client.send("DOM.querySelector", { nodeId: root.nodeId, selector: ".content-editor-input p" });
      for (const style of ["normal", "italic"]) {
        await editor.evaluate((el, style) => { el.style.fontStyle = style; }, style);
        await page.evaluate(() => document.fonts.ready);
        const { fonts } = await client.send("CSS.getPlatformFontsForNode", { nodeId });
        expect(fonts.length).toBeGreaterThan(0);
        expect(fonts.every(font => font.isCustomFont && font.familyName === "Inter Variable")).toBe(true);
      }
      await editor.evaluate(el => { el.style.fontStyle = ""; });
      const save = page.locator(".detail-edit-actions .save");
      await page.mouse.move(0, 0);
      await expect(save).toHaveCSS("background-color", "rgb(17, 23, 66)");
      await save.hover();
      await expect(save).toHaveCSS("background-color", "rgb(68, 212, 205)");
      await expect(save).toHaveCSS("color", "rgb(17, 23, 66)");
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    });
  }
}
