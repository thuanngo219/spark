import { expect, test } from "./fixtures";

for (const type of ["task", "note"] as const) {
  test(`mobile ${type} focuses synchronously at end and contains short-content gestures`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.addInitScript(({ type }) => {
      const data = JSON.parse(localStorage.getItem("spark:data:v1")!);
      const item = data.items.find((entry: { type: string }) => entry.type === type);
      item.title = "Kiểm tra nhập liệu";
      item.description = "Một dòng nội dung ngắn.";
      item.descriptionFormat = null;
      localStorage.setItem("spark:data:v1", JSON.stringify(data));
    }, { type });
    await page.goto("/");
    await page.getByRole("region", { name: "Khởi động Spark" }).waitFor({ state: "hidden" });
    await page.keyboard.press("a");
    await page.locator(".item-main").filter({ hasText: "Kiểm tra nhập liệu" }).click();
    await page.evaluate(() => {
      document.addEventListener("click", event => {
        if (!(event.target as Element).closest('[aria-label="Sửa Nội dung"]')) return;
        const input = document.querySelector(".content-editor-input");
        document.body.dataset.syncEditorFocus = String(input === document.activeElement);
      });
    });
    await page.getByRole("button", { name: "Sửa Nội dung", exact: true }).click();
    const editor = page.getByRole("textbox", { name: type === "task" ? "Nội dung task" : "Nội dung ghi chú", exact: true });
    await expect(page.locator("body")).toHaveAttribute("data-sync-editor-focus", "true");
    await expect(editor).toBeFocused();
    expect(await editor.evaluate(el => {
      const selection = window.getSelection()!;
      const remainder = document.createRange();
      remainder.selectNodeContents(el);
      remainder.setStart(selection.focusNode!, selection.focusOffset);
      return selection.isCollapsed && remainder.toString() === "";
    })).toBe(true);
    await page.keyboard.insertText(" Thêm ở cuối.");
    await expect(editor).toHaveText("Một dòng nội dung ngắn. Thêm ở cuối.");
    await page.evaluate(() => {
      Object.defineProperty(visualViewport!, "height", { configurable: true, get: () => 420 });
      visualViewport!.dispatchEvent(new Event("resize"));
    });
    const move = async (dy: number, count = 1) => editor.evaluate((el, { dy, count }) => {
      const touches = Array.from({ length: count }, (_, i) => new Touch({ identifier: i, target: el, clientX: 100 + i * 30, clientY: 200 }));
      el.dispatchEvent(new TouchEvent("touchstart", { touches, bubbles: true, cancelable: true }));
      const moved = touches.map(t => new Touch({ identifier: t.identifier, target: el, clientX: t.clientX, clientY: 200 + dy }));
      const event = new TouchEvent("touchmove", { touches: moved, bubbles: true, cancelable: true });
      el.dispatchEvent(event);
      el.dispatchEvent(new TouchEvent("touchend", { touches: [], bubbles: true }));
      return event.defaultPrevented;
    }, { dy, count });
    expect(await editor.evaluate(el => el.scrollHeight <= el.clientHeight + 1)).toBe(true);
    expect(await move(-60)).toBe(true);
    expect(await move(60)).toBe(true);
    expect(await move(-60, 2)).toBe(false);
    const sheet = page.locator(".item-detail-sheet");
    await sheet.evaluate(el => Promise.all(el.getAnimations().map(animation => animation.finished)));
    const sheetBeforeSwipe = await sheet.boundingBox();
    const inputBeforeSwipe = await editor.boundingBox();
    const cdp = await page.context().newCDPSession(page);
    await cdp.send("Emulation.setTouchEmulationEnabled", { enabled: true, maxTouchPoints: 1 });
    for (const direction of [-1, 1]) {
      await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: 195, y: 240 }] });
      for (let i = 1; i <= 8; i++) await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: 195, y: 240 + direction * i * 12 }] });
      await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
    }
    expect(await sheet.boundingBox()).toEqual(sheetBeforeSwipe);
    expect(await editor.boundingBox()).toEqual(inputBeforeSwipe);
    expect(await editor.evaluate(el => el.scrollTop)).toBe(0);
    await page.screenshot({ path: `/tmp/spark-short-editor-${type}.png`, clip: { x: 0, y: 0, width: 390, height: 420 } });
    // Use editor key commands rather than Playwright's DOM select-all + Delete,
    // which can race ProseMirror's selection observer after touch gestures.
    await editor.press("Meta+a");
    await editor.press("Backspace");
    await expect(editor).toHaveText("");
    await editor.press("ArrowRight");
    expect(await move(-60)).toBe(true);
    expect(await move(60)).toBe(true);
    await editor.fill("Một dòng nội dung ngắn. Thêm ở cuối.");
    // Selection handles/long-press selection must remain native.
    await editor.evaluate(el => { const range = document.createRange(); range.selectNodeContents(el); const selection = getSelection()!; selection.removeAllRanges(); selection.addRange(range); });
    expect(await move(60)).toBe(false);
    await editor.press("ArrowRight");
    await editor.fill("Nội dung dài cuộn bên trong.\n".repeat(90));
    await editor.evaluate(el => { el.scrollTop = 0; });
    expect(await move(-60)).toBe(false);
    expect(await move(60)).toBe(true);
    await editor.evaluate(el => { el.scrollTop = el.scrollHeight; });
    expect(await move(-60)).toBe(true);
    expect(await move(60)).toBe(false);
    await page.getByRole("button", { name: "Hủy", exact: true }).click();
    await page.getByRole("button", { name: "Sửa Nội dung", exact: true }).click();
    await expect(editor).toHaveText("Một dòng nội dung ngắn.");
    await expect(editor).toBeFocused();
    await page.keyboard.insertText(" Đã lưu.");
    await page.getByRole("button", { name: "Lưu Nội dung", exact: true }).click();
    await expect(page.locator(".detail-description .formatted-content")).toHaveText("Một dòng nội dung ngắn. Đã lưu.");
    await cdp.detach();
  });
}
