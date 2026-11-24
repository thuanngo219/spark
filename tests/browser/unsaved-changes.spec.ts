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
    const rejected = page.waitForEvent("dialog");
    const cancel = form.getByRole("button", { name: "Hủy", exact: true }).click();
    const dialog = await rejected;
    expect(dialog.type()).toBe("confirm");
    await dialog.dismiss();
    await cancel;
    await expect(title).toHaveValue("Bản nháp cần giữ");
    const accepted = page.waitForEvent("dialog");
    const escape = page.keyboard.press("Escape");
    await (await accepted).accept();
    await escape;
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
      page.once("dialog", dialog => dialog.dismiss());
      await title.press("Escape");
      await expect(title).toHaveValue("Tên chưa lưu");
      page.once("dialog", dialog => dialog.accept());
      await title.press("Escape");
      await expect(title).toBeHidden();
      await detail.getByRole("button", { name: "Sửa Nội dung", exact: true }).click();
      const content = detail.locator(".content-editor-input");
      await content.fill("Nội dung chưa lưu");
      page.once("dialog", dialog => dialog.dismiss());
      await detail.getByRole("button", { name: "Hủy", exact: true }).click();
      await expect(content).toHaveText("Nội dung chưa lưu");
      if (width >= 700) {
        page.once("dialog", dialog => dialog.dismiss());
        await detail.getByRole("button", { name: /^(Đóng|QUAY LẠI)$/ }).click();
        await expect(content).toHaveText("Nội dung chưa lưu");
      }
      page.once("dialog", dialog => dialog.accept());
      await detail.getByRole("button", { name: "Hủy", exact: true }).click();
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
  page.once("dialog", dialog => dialog.accept());
  await page.locator(".quick-add-dialog").getByRole("button", { name: "Hủy", exact: true }).click();
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
  const warning = page.waitForEvent("dialog");
  const cancel = detail.getByRole("button", { name: "Hủy", exact: true }).click();
  await (await warning).dismiss();
  await cancel;
  await expect(content.locator("strong")).toHaveText("Định dạng cần lưu");
  await detail.getByRole("button", { name: "Lưu Nội dung", exact: true }).click();
  await page.reload();
  await expect(page.getByRole("region", { name: "Khởi động Spark" })).toBeHidden();
});
