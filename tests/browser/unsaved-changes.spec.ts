import { test, expect } from "./fixtures";

for (const width of [390, 1280]) {
  test(`quick-add protects draft and saves without warning ${width}`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.goto("/");
    await expect(page.getByRole("region", { name: "Khởi động Spark" })).toBeHidden();
    await page.getByRole("button", { name: "Thêm công việc", exact: true }).click();
    const form = page.locator(".quick-add-dialog");
    const title = form.getByRole("textbox", { name: "Tên mục", exact: true });
    await title.fill("Bản nháp cần giữ");
    page.on("dialog", async dialog => { await dialog.dismiss(); throw new Error("Unexpected browser dialog inside Spark"); });
    await form.getByRole("button", { name: "Hủy", exact: true }).click();
    const confirmation = page.getByRole("dialog", { name: "Nội dung chưa lưu?", exact: true });
    await expect(confirmation).toBeVisible();
    await expect(confirmation.getByRole("button", { name: "Tiếp tục sửa" })).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(title).toHaveValue("Bản nháp cần giữ");
    await page.keyboard.press("Escape");
    await confirmation.getByRole("button", { name: "Bỏ thay đổi", exact: true }).click();
    await expect(form).toBeHidden();
    await page.getByRole("button", { name: "Thêm công việc", exact: true }).click();
    await expect(title).toHaveValue("");
    await title.fill("Lưu không cần xác nhận bỏ nháp");
    page.on("dialog", async dialog => { await dialog.dismiss(); throw new Error("Unexpected discard warning on save"); });
    await form.getByRole("button", { name: "Thêm", exact: true }).click();
    await expect(form).toBeHidden();
  });

  for (const mode of ["[", "]"]) {
    test(`detail protects title and content ${width} ${mode}`, async ({ page }) => {
      await page.setViewportSize({ width, height: 844 });
      await page.goto("/");
      await expect(page.getByRole("region", { name: "Khởi động Spark" })).toBeHidden();
      await page.keyboard.press("a");
      await page.keyboard.press(mode);
      await page.locator(".item-main").first().click();
      const detail = page.locator(".item-detail-sheet");
      await detail.getByRole("button", { name: "Sửa tên", exact: true }).click();
      const title = detail.locator(".detail-title-row input, .detail-title-row textarea");
      await title.fill("Tên chưa lưu");
      await title.press("Escape");
      await page.getByRole("dialog", { name: "Nội dung chưa lưu?", exact: true }).getByRole("button", { name: "Tiếp tục sửa", exact: true }).click();
      await expect(title).toHaveValue("Tên chưa lưu");
      await title.press("Escape");
      await page.getByRole("dialog", { name: "Nội dung chưa lưu?", exact: true }).getByRole("button", { name: "Bỏ thay đổi", exact: true }).click();
      await expect(title).toBeHidden();
      await detail.getByRole("button", { name: "Sửa Nội dung", exact: true }).click();
      const content = detail.locator(".content-editor-input");
      await content.fill("Nội dung chưa lưu");
      await detail.getByRole("button", { name: "Hủy", exact: true }).click();
      await page.getByRole("dialog", { name: "Nội dung chưa lưu?", exact: true }).getByRole("button", { name: "Tiếp tục sửa", exact: true }).click();
      await expect(content).toHaveText("Nội dung chưa lưu");
      if (width >= 700) {
        await detail.getByRole("button", { name: /^(Đóng|QUAY LẠI)$/ }).click();
        await page.getByRole("dialog", { name: "Nội dung chưa lưu?", exact: true }).getByRole("button", { name: "Tiếp tục sửa", exact: true }).click();
        await expect(content).toHaveText("Nội dung chưa lưu");
      }
      await detail.getByRole("button", { name: "Hủy", exact: true }).click();
      await page.getByRole("dialog", { name: "Nội dung chưa lưu?", exact: true }).getByRole("button", { name: "Bỏ thay đổi", exact: true }).click();
      await expect(content).toBeHidden();
      await detail.getByRole("button", { name: /^(Đóng|QUAY LẠI)$/ }).click();
      await expect(detail).toBeHidden();
    });
  }
}

test("reload protects quick-add draft and formatting-only edits", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("region", { name: "Khởi động Spark" })).toBeHidden();
  await page.getByRole("button", { name: "Thêm công việc", exact: true }).click();
  const title = page.getByRole("textbox", { name: "Tên mục", exact: true });
  await title.fill("Nháp khi tải lại");
  const pendingDialog = page.waitForEvent("dialog");
  await page.evaluate(() => { setTimeout(() => window.location.reload(), 0); });
  const dialog = await pendingDialog;
  expect(dialog.type()).toBe("beforeunload");
  await dialog.dismiss();
  await expect(title).toHaveValue("Nháp khi tải lại");
  await page.locator(".quick-add-dialog").getByRole("button", { name: "Hủy", exact: true }).click();
  await page.getByRole("dialog", { name: "Nội dung chưa lưu?", exact: true }).getByRole("button", { name: "Bỏ thay đổi", exact: true }).click();
  await page.keyboard.press("a");
  await page.locator(".item-main").first().click();
  await page.keyboard.press("e");
  const detail = page.locator(".item-detail-sheet");
  const content = detail.locator(".content-editor-input");
  await content.fill("Định dạng cần lưu");
  await detail.getByRole("button", { name: "Lưu Nội dung", exact: true }).click();
  await page.keyboard.press("e");
  await content.press("ControlOrMeta+a");
  await content.press("ControlOrMeta+b");
  await expect(content.locator("strong")).toHaveText("Định dạng cần lưu");
  await detail.getByRole("button", { name: "Hủy", exact: true }).click();
  await page.getByRole("dialog", { name: "Nội dung chưa lưu?", exact: true }).getByRole("button", { name: "Tiếp tục sửa" }).click();
  await expect(content.locator("strong")).toHaveText("Định dạng cần lưu");
  await detail.getByRole("button", { name: "Lưu Nội dung", exact: true }).click();
  await page.reload();
  await expect(page.getByRole("region", { name: "Khởi động Spark" })).toBeHidden();
});

for (const width of [390, 1280]) {
  test(`Spark confirmation fits dark theme and traps focus ${width}`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.emulateMedia({ colorScheme: "dark" });
    await page.goto("/");
    await expect(page.getByRole("region", { name: "Khởi động Spark" })).toBeHidden();
    await page.getByRole("button", { name: "Thêm công việc", exact: true }).click();
    const input = page.getByRole("textbox", { name: "Tên mục", exact: true });
    await input.fill("Nháp giao diện tối");
    await page.keyboard.press("Escape");
    const dialog = page.getByRole("dialog", { name: "Nội dung chưa lưu?", exact: true });
    const keep = dialog.getByRole("button", { name: "Tiếp tục sửa" });
    const discard = dialog.getByRole("button", { name: "Bỏ thay đổi", exact: true });
    await expect(dialog).toBeVisible();
    await expect(dialog.locator("p")).toHaveText("Bạn có thay đổi chưa được lưu. Bạn có thật sự muốn thoát?");
    await expect(keep.locator("svg:first-child")).toBeVisible();
    await expect(discard.locator("svg:first-child")).toBeVisible();
    await expect(dialog).toHaveCSS("background-color", "rgb(27, 32, 48)");
    await expect(keep).toBeFocused();
    await expect(keep).toHaveCSS("background-color", "rgb(68, 212, 205)");
    await expect(keep).toHaveCSS("color", "rgb(17, 23, 66)");
    await page.keyboard.press("Shift+Tab");
    await expect(discard).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(keep).toBeFocused();
    if (width >= 700) {
      const normalBackground = await keep.evaluate(el => getComputedStyle(el).backgroundColor);
      await keep.hover();
      await expect(keep).not.toHaveCSS("background-color", normalBackground);
      await expect(keep).toHaveCSS("background-color", "rgb(17, 23, 66)");
      await expect(keep).toHaveCSS("color", "rgb(255, 255, 255)");
      await expect(keep).toHaveCSS("transition-duration", "0.22s, 0.22s, 0.22s, 0.16s");
      await discard.hover();
      await expect(discard).toHaveCSS("background-color", "rgb(217, 119, 106)");
      await expect(discard).toHaveCSS("color", "rgb(255, 255, 255)");
    }
    const bounds = (await dialog.boundingBox())!;
    expect(bounds.x).toBeGreaterThanOrEqual(16);
    expect(bounds.x + bounds.width).toBeLessThanOrEqual(width - 16);
    await dialog.evaluate(el => Promise.all(el.getAnimations({ subtree: true }).map(animation => animation.finished)));
    await page.screenshot({ path: `/tmp/spark-discard-dialog-${width}.png` });
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(input).toHaveValue("Nháp giao diện tối");
    await expect(input).toBeFocused();
  });
}
