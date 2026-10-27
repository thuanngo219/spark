import { test, expect } from "./fixtures";

const cases = [
  { width: 1280, theme: "light", type: "task", expanded: false },
  { width: 1280, theme: "dark", type: "task", expanded: false },
  { width: 1280, theme: "light", type: "note", expanded: false },
  { width: 1280, theme: "dark", type: "note", expanded: false },
  { width: 700, theme: "light", type: "task", expanded: false },
  { width: 1440, theme: "dark", type: "note", expanded: true },
] as const;
for (const { width, theme, type, expanded } of cases) {
  test(`desktop detail ${width} ${theme} ${type} expanded=${expanded}`, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 });
    await page.emulateMedia({ colorScheme: theme });
    await page.goto("/");
    await expect(page.getByRole("region", { name: "Khởi động Spark" })).toBeHidden();
    await page.keyboard.press("a");
    if (expanded) await page.getByRole("button", { name: "Mở rộng sidebar" }).click();
    await page.locator(".app-shell").evaluate(el => Promise.all(el.getAnimations().map(a => a.finished)));
    const listWidth = (await page.locator(".canvas").boundingBox())!.width;
    const title = type === "task" ? "Chốt ba việc quan trọng cho hôm nay" : "Ý tưởng: dành 20 phút cuối ngày để thu gọn danh sách";
    await page.locator(".item-main").filter({ hasText: title }).click();
    const sheet = page.locator(".item-detail-sheet");
    await page.locator(".item-detail-backdrop").evaluate(el => Promise.all(el.getAnimations().map(a => a.finished)));
    expect(await sheet.boundingBox()).toEqual({ x: 0, y: 0, width, height: 800 });
    expect((await sheet.locator(".detail-main-inner").boundingBox())!.width).toBeCloseTo(listWidth, 1);
    await expect(sheet).toHaveCSS("background-color", theme === "dark" ? "rgb(18, 22, 34)" : "rgb(247, 248, 250)");
    await expect(page.locator("body")).toHaveCSS("position", "fixed");
    await expect(sheet.locator(".editor-header h2, .editor-header > div")).toHaveCount(0);
    await expect(sheet).toHaveAttribute("aria-label", title);
    const close = sheet.getByRole("button", { name: "Đóng", exact: true });
    const closeBox = (await close.boundingBox())!;
    expect(closeBox.x + closeBox.width).toBe(width - 20);
    expect(closeBox.y).toBe(20);
    const metadata = sheet.locator(".detail-metadata");
    const metaBox = (await metadata.boundingBox())!;
    expect(metaBox.y + metaBox.height).toBe(800);
    const main = (await sheet.locator(".detail-main").boundingBox())!;
    const group = (await sheet.locator(".detail-main-inner").boundingBox())!;
    expect(Math.abs(group.y + group.height / 2 - main.y - main.height / 2 - 20)).toBeLessThan(2);
    await page.screenshot({ path: `/tmp/spark-desktop-detail-${width}-${theme}-${type}.png` });
    await sheet.getByRole("button", { name: "Sửa Nội dung" }).click();
    const input = sheet.getByRole("textbox", { name: type === "task" ? "Nội dung task" : "Nội dung ghi chú", exact: true });
    await expect(input).toBeFocused();
    const text = "Một dòng nội dung dài để kiểm tra vùng cuộn.\n".repeat(80);
    await input.fill(text);
    await sheet.getByRole("button", { name: "Lưu Nội dung" }).click();
    const read = sheet.locator(".detail-description .detail-read-row");
    const editBefore = (await sheet.getByRole("button", { name: "Sửa Nội dung" }).boundingBox())!;
    expect(await read.evaluate(el => { el.scrollTop = el.scrollHeight; return el.scrollTop; })).toBeGreaterThan(0);
    expect(await metadata.boundingBox()).toEqual(metaBox);
    expect(await close.boundingBox()).toEqual(closeBox);
    expect(await sheet.getByRole("button", { name: "Sửa Nội dung" }).boundingBox()).toEqual(editBefore);
    await expect(sheet.getByRole("button", { name: "Xóa mục" })).toBeInViewport();
    await sheet.getByRole("button", { name: "Sửa Nội dung" }).click();
    expect((await input.innerText()).replace(/\s+/g, " ").trim()).toBe(text.replace(/\s+/g, " ").trim());
    expect((await input.boundingBox())!.height).toBeGreaterThan(150);
    await sheet.getByRole("button", { name: "Quan Trọng", exact: true }).click();
    await close.click();
    await expect(sheet).toBeHidden();
    await expect(page.locator("body")).not.toHaveCSS("position", "fixed");
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
}
