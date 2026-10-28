import { test, expect } from "./fixtures";
import { seedData } from "../seed-data";
import { getLocalDateKey } from "../../src/lib/dates";

for (const width of [320, 390, 1280]) {
  for (const theme of ["light", "dark"] as const) {
    test(`quick-add layout and draft ${width}px ${theme}`, async ({ page }) => {
      await page.setViewportSize({ width, height: 800 });
      await page.emulateMedia({ colorScheme: theme });
      await page.goto("/");
      await expect(page.getByRole("region", { name: "Khởi động Spark" })).toBeHidden();
      const previousViewTitle = await page.locator(".view-header h1").textContent();
      await page.getByRole("button", { name: "Thêm công việc", exact: true }).click();
      const form = page.locator(".quick-add-dialog");
      await page.locator(".quick-add-backdrop").evaluate(el => Promise.all(el.getAnimations({ subtree: true }).map(a => a.finished)));
      const centered = async (height: number) => {
        const box = (await form.boundingBox())!;
        expect(Math.abs(box.x + box.width / 2 - width / 2)).toBeLessThan(2);
        expect(Math.abs(box.y + box.height / 2 - height / 2)).toBeLessThan(2);
        expect(box.y).toBeGreaterThanOrEqual(0);
        expect(box.y + box.height).toBeLessThanOrEqual(height);
      };
      await centered(800);
      if (width < 700) {
        expect(await form.boundingBox()).toEqual({ x: 0, y: 0, width, height: 800 });
        await expect(form.getByRole("button", { name: "Đóng thêm nhanh" })).toHaveCount(0);
        await expect(page.locator("body")).toHaveCSS("position", "fixed");
        await expect(page.locator(".quick-add-backdrop")).toHaveCSS("opacity", "1");
        await expect(page.locator(".quick-add-backdrop")).toHaveCSS("animation-name", "none");
        expect(await page.locator(".item-main").first().evaluate(el => Boolean(el.closest("[inert]")))).toBe(true);
        await expect(form.getByRole("combobox", { name: "Dự án", exact: true })).toBeHidden();
        const cancel = (await form.getByRole("button", { name: "Hủy", exact: true }).boundingBox())!;
        const add = (await form.getByRole("button", { name: "Thêm", exact: true }).boundingBox())!;
        expect((cancel.x + add.x + add.width) / 2).toBeCloseTo(width / 2, 1);
        await expect(form.getByRole("button", { name: "Hủy", exact: true }).locator("svg")).toBeVisible();
        await expect(form.getByRole("button", { name: "Thêm", exact: true }).locator("svg")).toBeVisible();
        const toggles = await form.locator(".quick-add-entry-actions > *").all();
        const rows = await Promise.all(toggles.map(async el => (await el.boundingBox())!.y));
        expect(new Set(rows).size).toBe(1);
        const boxes = await Promise.all(toggles.map(el => el.boundingBox()));
        expect(boxes[1]!.x - boxes[0]!.x - boxes[0]!.width).toBeCloseTo(10, 1);
        expect(boxes[2]!.x - boxes[1]!.x - boxes[1]!.width).toBeCloseTo(10, 1);
        for (const toggle of toggles) {
          await expect(toggle).toHaveCSS("font-size", "12px");
          await expect(toggle).toHaveCSS("background-color", theme === "light" ? "rgb(255, 255, 255)" : "rgb(27, 32, 48)");
        }

      }
      const title = form.getByRole("textbox", { name: "Tên mục", exact: true });
      await expect(title).toBeFocused();
      await title.fill("Mục thử toàn màn hình");
      if (theme === "dark") await form.getByRole("checkbox", { name: "Ghi chú", exact: true }).check();
      if (width < 700) {
        const classification = form.getByRole("button", { name: "Phân loại", exact: true });
        await classification.click();
        await expect(classification).toHaveAttribute("aria-expanded", "true");
        const dates = await form.locator('.quick-add-controls input[type="date"]').all();
        expect((await dates[0].boundingBox())!.y).toBe((await dates[1].boundingBox())!.y);
        await dates[0].fill("2026-11-01");
        await dates[1].fill("2026-10-31");
        await expect(form.getByRole("button", { name: "Thêm", exact: true })).toBeDisabled();
        await dates[1].fill("2026-11-02");
        await form.getByRole("combobox", { name: "Dự án", exact: true }).selectOption({ label: "Công việc" });
        const panel = (await form.locator(".quick-classification").boundingBox())!;
        await expect(form.locator(".quick-classification")).toHaveCSS("border-radius", "0px");
        await expect(form.locator(".quick-classification")).toHaveCSS("background-color", theme === "light" ? "rgb(233, 235, 239)" : "rgb(36, 43, 61)");
        await expect(form.locator(".quick-classification")).toHaveCSS("box-shadow", "none");
        await expect(form.locator(".quick-classification")).toHaveCSS("border-top-width", "1px");
        const cancel = (await form.getByRole("button", { name: "Hủy", exact: true }).boundingBox())!;
        const add = (await form.getByRole("button", { name: "Thêm", exact: true }).boundingBox())!;
        expect(panel.y).toBeLessThan(cancel.y);
        expect(panel.y + panel.height).toBeCloseTo(800, 1);
        expect(await page.evaluate(([x, y]) => document.elementFromPoint(x, y)?.closest(".quick-classification") !== null, [cancel.x + cancel.width / 2, cancel.y + cancel.height / 2])).toBe(true);
        expect((cancel.x + add.x + add.width) / 2).toBeCloseTo(width / 2, 1);
        expect(add.y + add.height).toBeGreaterThan(750);
        await page.screenshot({ path: `/tmp/spark-classification-${width}-${theme}.png` });
        await page.evaluate(() => {
          Object.defineProperty(window.visualViewport!, "height", { configurable: true, value: 360 });
          window.visualViewport!.dispatchEvent(new Event("resize"));
        });
        await expect(form.getByRole("combobox", { name: "Dự án", exact: true })).toBeInViewport();
        await page.screenshot({ path: `/tmp/spark-classification-keyboard-${width}-${theme}.png`, clip: { x: 0, y: 0, width, height: 360 } });
        await page.evaluate(() => {
          Reflect.deleteProperty(window.visualViewport!, "height");
          window.visualViewport!.dispatchEvent(new Event("resize"));
        });
        await form.getByRole("button", { name: "Ẩn Phân loại", exact: true }).click();
        await expect(classification).toBeFocused();
        await classification.click();
        await expect(dates[0]).toHaveValue("2026-11-01");
        await expect(dates[1]).toHaveValue("2026-11-02");
        await page.keyboard.press("Escape");
        await expect(form).toBeVisible();
        await expect(classification).toHaveAttribute("aria-expanded", "false");
      } else {
        await expect(form.getByRole("button", { name: "Phân loại", exact: true })).toBeHidden();
        await expect(form.getByRole("button", { name: "Thêm", exact: true }).locator("svg")).toBeHidden();
      }
      await page.screenshot({ path: `/tmp/spark-quick-main-${width}-${theme}.png` });
      await form.getByRole("button", { name: "Thêm Nội dung", exact: true }).click();
      const editor = form.getByRole("textbox", { name: "Nội dung (nếu cần)", exact: true });
      await editor.fill("Nội dung nháp cần giữ");
      await editor.press("Meta+a");
      await form.getByRole("button", { name: "In đậm", exact: true }).click();
      await expect(editor.locator("strong")).toHaveText("Nội dung nháp cần giữ");
      if (width < 700) {
        await expect(form.locator(".quick-add-entry")).toBeHidden();
        await expect(form.locator(".quick-add-controls")).toBeHidden();
        expect((await editor.boundingBox())!.height).toBeGreaterThan(600);
        await page.evaluate(() => {
          Object.defineProperty(window.visualViewport!, "height", { configurable: true, value: 360 });
          window.visualViewport!.dispatchEvent(new Event("resize"));
        });
        await centered(360);
        expect((await page.locator(".quick-add-backdrop").boundingBox())!.height).toBe(800);
        await page.evaluate(() => {
          Object.defineProperty(window.visualViewport!, "offsetTop", { configurable: true, value: 20 });
          window.visualViewport!.dispatchEvent(new Event("scroll"));
        });
        expect((await form.boundingBox())!.y).toBe(20);
        expect(await page.evaluate(() => Boolean(document.elementFromPoint(5, 5)?.closest(".quick-add-backdrop")))).toBe(true);
        await page.evaluate(() => {
          Reflect.deleteProperty(window.visualViewport!, "offsetTop");
          window.visualViewport!.dispatchEvent(new Event("scroll"));
        });
        const bounds = (await editor.boundingBox())!;
        expect(bounds.height).toBeGreaterThan(180);
        expect(bounds.y + bounds.height).toBeLessThanOrEqual(360);
        await expect(form.getByRole("button", { name: "Xong", exact: true })).toBeInViewport();
        await page.screenshot({ path: `/tmp/spark-quick-focus-${width}-${theme}.png`, clip: { x: 0, y: 0, width, height: 360 } });
        await form.getByRole("button", { name: "Xong", exact: true }).click();
        await expect(title).toHaveValue("Mục thử toàn màn hình");
        await expect(form.locator(".quick-description-preview")).toContainText("Nội dung nháp cần giữ");
        await form.getByRole("button", { name: "Sửa Nội dung", exact: true }).click();
        await expect(editor).toBeFocused();
        await expect(editor.locator("strong")).toHaveText("Nội dung nháp cần giữ");
        await editor.press("Escape");
        await expect(form).toBeVisible();
        await expect(form.locator(".quick-add-controls")).toBeVisible();
        await page.evaluate(() => {
          Reflect.deleteProperty(window.visualViewport!, "height");
          window.visualViewport!.dispatchEvent(new Event("resize"));
        });
      } else {
        await expect(editor).toHaveCSS("height", "300px");
        await centered(800);
      }
      await form.getByRole("button", { name: "Thêm", exact: true }).click();
      await expect(form).toBeHidden();
      await expect(page.locator(".view-header h1")).toHaveText(previousViewTitle!);
      await expect(page.locator("body")).not.toHaveCSS("position", "fixed");
      expect(await page.locator(".item-main").first().evaluate(el => Boolean(el.closest("[inert]")))).toBe(false);
      await page.keyboard.press("a");
      await page.locator(".item-main").filter({ hasText: "Mục thử toàn màn hình" }).click();
      await expect(page.locator(".formatted-content strong")).toHaveText("Nội dung nháp cần giữ");
      if (width < 700) {
        await expect(page.getByLabel("Ngày bắt đầu", { exact: true })).toHaveValue("2026-11-01");
        await expect(page.getByLabel("Ngày đến hạn", { exact: true })).toHaveValue("2026-11-02");
        await expect(page.locator(".detail-meta-control.project option:checked")).toHaveText("Công việc");
      }
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    });
  }
}

for (const width of [390, 1280]) {
  test(`quick-add returns to the All view after saving at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 });
    await page.goto("/");
    await expect(page.getByRole("region", { name: "Khởi động Spark" })).toBeHidden();
    await page.keyboard.press("a");
    await expect(page.locator(".view-header h1")).toHaveText("Tất cả");
    await page.getByRole("button", { name: "Thêm công việc", exact: true }).click();
    const form = page.locator(".quick-add-dialog");
    await form.getByRole("textbox", { name: "Tên mục", exact: true }).fill(`Mục mới ở Tất cả ${width}`);
    await form.getByRole("button", { name: "Thêm", exact: true }).click();
    await expect(form).toBeHidden();
    await expect(page.locator(".view-header h1")).toHaveText("Tất cả");
    await expect(page.locator(".item-main").filter({ hasText: `Mục mới ở Tất cả ${width}` })).toBeVisible();
  });
}

test("mobile quick-add shows a long content draft without clipping or a filled preview", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await expect(page.getByRole("region", { name: "Khởi động Spark" })).toBeHidden();
  await page.getByRole("button", { name: "Thêm công việc", exact: true }).click();
  await page.getByRole("button", { name: "Thêm Nội dung", exact: true }).click();
  const editor = page.getByRole("textbox", { name: "Nội dung (nếu cần)", exact: true });
  const content = Array.from({ length: 20 }, (_, index) => `Dòng nội dung ${index + 1} cần hiển thị đầy đủ trong quick-add.`).join("\n");
  await editor.fill(content);
  await page.getByRole("button", { name: "Xong", exact: true }).click();
  const preview = page.locator(".quick-description-preview");
  await expect(preview).toBeVisible();
  expect(await preview.locator("span").textContent()).toBe(content);
  await expect(preview).toHaveCSS("font-weight", "400");
  await expect(preview).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
  await expect(preview).toHaveCSS("padding", "0px");
  expect((await preview.boundingBox())!.height).toBeGreaterThan(112);
  expect(await preview.evaluate(el => el.scrollHeight - el.clientHeight)).toBe(0);
  await page.screenshot({ path: "/tmp/spark-quick-long-preview-390.png" });
  const body = page.locator(".quick-add-body");
  await body.evaluate(el => { el.scrollTop = el.scrollHeight; });
  const lastLine = await preview.locator("span").evaluate(el => {
    const text = el.firstChild!;
    const range = document.createRange();
    range.setStart(text, text.textContent!.length - 8);
    range.setEnd(text, text.textContent!.length);
    return range.getBoundingClientRect().toJSON();
  });
  const bodyBox = (await body.boundingBox())!;
  expect(lastLine.top).toBeGreaterThanOrEqual(bodyBox.y);
  expect(lastLine.bottom).toBeLessThanOrEqual(bodyBox.y + bodyBox.height);
  await preview.click();
  await expect(editor).toBeFocused();
  await expect(editor).toContainText("Dòng nội dung 20 cần hiển thị đầy đủ trong quick-add.");
});

test("mobile quick-add blocks background gestures and restores the scrolled list", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const fixture = seedData(getLocalDateKey());
  const item = fixture.items.find(entry => entry.type === "task")!;
  fixture.items = Array.from({ length: 40 }, (_, index) => ({ ...item, id: `scroll-test-${index}`, title: `Mục kiểm tra cuộn ${index}` }));
  await page.addInitScript(data => localStorage.setItem("spark:data:v1", JSON.stringify(data)), fixture);
  await page.goto("/");
  await expect(page.getByRole("region", { name: "Khởi động Spark" })).toBeHidden();
  await page.keyboard.press("a");
  await page.evaluate(() => window.scrollTo(0, 400));
  await expect.poll(() => page.evaluate(() => scrollY)).toBe(400);
  await expect(page.locator(".view-header")).toHaveClass(/is-compact/);
  await page.locator(".view-header").evaluate(el => Promise.all(el.getAnimations({ subtree: true }).map(animation => animation.finished)));
  await page.getByRole("button", { name: "Thêm công việc", exact: true }).click();
  const background = page.locator(".item-main").first();
  const before = await background.boundingBox();
  const form = page.locator(".quick-add-dialog");
  const cdp = await page.context().newCDPSession(page);
  const swipe = async () => {
    await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: 190, y: 240 }] });
    for (const y of [220, 195, 170, 145]) {
      await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: 190, y }] });
    }
    await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
  };
  await swipe();
  expect(await background.boundingBox()).toEqual(before);
  await form.getByRole("button", { name: "Thêm Nội dung", exact: true }).click();
  await page.evaluate(() => {
    Object.defineProperty(window.visualViewport!, "height", { configurable: true, value: 360 });
    window.visualViewport!.dispatchEvent(new Event("resize"));
  });
  await swipe();
  expect(await background.boundingBox()).toEqual(before);
  await expect(form.getByRole("button", { name: "Xong", exact: true })).toBeInViewport();
  await form.getByRole("button", { name: "Xong", exact: true }).click();
  await form.getByRole("button", { name: "Hủy", exact: true }).click();
  await expect.poll(() => page.evaluate(() => scrollY)).toBe(400);
  expect(await background.evaluate(el => Boolean(el.closest("[inert]")))).toBe(false);
  await cdp.detach();
});
