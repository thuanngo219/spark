import { expect, test, type Page } from "@playwright/test";

async function openQuickAdd(page: Page) {
  await page.getByRole("button", { name: "Thêm công việc", exact: true }).click();
  await page.getByRole("button", { name: "Thêm Nội dung", exact: true }).click();
  return page.getByRole("textbox", { name: "Nội dung (nếu cần)", exact: true });
}

async function paste(page: Page, html: string) {
  await page.locator(".content-editor-input").evaluate((element, value) => {
    const transfer = new DataTransfer();
    transfer.setData("text/html", value);
    element.dispatchEvent(new ClipboardEvent("paste", { clipboardData: transfer, bubbles: true, cancelable: true }));
  }, html);
}

async function openTestItem(page: Page, title: string) {
  await page.locator(".item-main").filter({ hasText: title }).click();
  await expect(page.getByRole("button", { name: "Sửa Nội dung", exact: true })).toBeVisible();
}

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Hôm nay", exact: true })).toBeVisible();
});

test("Command B/I/U, undo, save, reload and cancel preserve formatting", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  const editor = await openQuickAdd(page);
  await page.getByRole("textbox", { name: "Tên mục" }).fill("Browser format test");
  await editor.fill("Đậm nghiêng gạch chân");
  await editor.press("Meta+a");
  for (const key of ["b", "i", "u"]) await editor.press(`Meta+${key}`);
  await expect(editor.locator("strong em u")).toHaveText("Đậm nghiêng gạch chân");
  await expect(page.getByRole("heading", { name: "Hôm nay", exact: true })).toBeVisible();
  await editor.press("Meta+z");
  await expect(editor.locator("u")).toHaveCount(0);
  await editor.press("Meta+Shift+z");
  await expect(editor.locator("u")).toHaveCount(1);
  await page.getByRole("button", { name: "Thêm", exact: true }).click();
  await page.getByRole("button", { name: "Hủy", exact: true }).click();
  await page.reload();
  await openTestItem(page, "Browser format test");
  await expect(page.locator(".detail-description strong")).toHaveText("Đậm nghiêng gạch chân");
  await expect(page.locator(".detail-description em u, .detail-description u em")).toHaveCount(1);
  await page.getByRole("button", { name: "Sửa Nội dung" }).click();
  await page.getByRole("textbox", { name: "Nội dung task", exact: true }).fill("Bỏ thay đổi này");
  await page.getByRole("button", { name: "Hủy", exact: true }).click();
  await expect(page.locator(".detail-description strong")).toHaveText("Đậm nghiêng gạch chân");
  expect(errors).toEqual([]);
});

test("4000 characters including newlines; rejects 4001; fixed edit header", async ({ page }) => {
  const editor = await openQuickAdd(page);
  await page.getByRole("textbox", { name: "Tên mục" }).fill("Browser long test");
  const text = ("Dòng kiểm tra.\n".repeat(300)).slice(0, 3999) + "X";
  await editor.click();
  await paste(page, `<p><strong>${text.replaceAll("\n", "<br>")}</strong></p>`);
  await expect(page.locator(".content-counter")).toHaveText("4.000 / 4.000");
  await editor.press("End");
  await editor.press("z");
  await expect(page.locator(".content-counter")).toHaveText("4.000 / 4.000");
  await expect(page.getByRole("status")).toContainText("tối đa 4.000");
  await page.getByRole("button", { name: "Thêm", exact: true }).click();
  await page.getByRole("button", { name: "Hủy", exact: true }).click();
  await openTestItem(page, "Browser long test");
  const sheet = await page.locator(".item-detail-sheet").boundingBox();
  expect(sheet?.width).toBe(880);
  const edit = page.getByRole("button", { name: "Sửa Nội dung" });
  await page.locator(".item-detail-sheet").evaluate((element) => Promise.all(element.getAnimations().map((animation) => animation.finished)));
  const before = await edit.boundingBox();
  const scroll = await page.locator(".detail-description .detail-read-row").evaluate((element) => { element.scrollTop = element.scrollHeight; return element.scrollTop; });
  expect(scroll).toBeGreaterThan(0);
  expect((await edit.boundingBox())?.y).toBe(before?.y);
  await expect(page.locator(".detail-description .detail-read-row")).toHaveText(text.trim());
  await page.screenshot({ path: "/tmp/spark-content-desktop.png" });
  await edit.click();
  await expect(page.getByRole("textbox", { name: "Nội dung task" })).toBeVisible();
  const editArea = await page.getByRole("textbox", { name: "Nội dung task" }).boundingBox();
  expect(editArea!.height).toBeGreaterThan(100);
});

test("quick-add defaults follow view and type, preserve explicit choices", async ({ page }) => {
  await page.getByRole("button", { name: "Thêm công việc", exact: true }).click();
  const dates = page.locator(".quick-add input[type=date]");
  const today = await dates.first().inputValue();
  expect(today).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  await page.getByRole("checkbox", { name: "Ghi chú" }).check();
  await expect(dates.first()).toHaveValue("");
  await page.getByRole("checkbox", { name: "Ghi chú" }).uncheck();
  await expect(dates.first()).toHaveValue(today);
  await dates.first().fill("");
  await page.getByRole("checkbox", { name: "Ghi chú" }).check();
  await page.getByRole("checkbox", { name: "Ghi chú" }).uncheck();
  await expect(dates.first()).toHaveValue("");
  await page.getByRole("button", { name: "Hủy", exact: true }).click();
  await page.keyboard.press("a");
  await page.getByRole("button", { name: "Thêm công việc", exact: true }).click();
  await expect(dates.first()).toHaveValue("");
  await expect(dates.nth(1)).toHaveValue("");
});

test("mobile 390px: formatting toolbar, 160px editor and no overflow", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const editor = await openQuickAdd(page);
  await editor.fill("Nội dung mobile");
  await editor.press("Meta+a");
  await page.getByRole("button", { name: "In đậm", exact: true }).click();
  await expect(editor.locator("strong")).toHaveText("Nội dung mobile");
  const box = await editor.boundingBox();
  expect(box?.height).toBe(160);
  for (const name of ["In đậm", "In nghiêng", "Gạch chân"]) {
    const button = await page.getByRole("button", { name, exact: true }).boundingBox();
    expect(button!.height).toBeGreaterThanOrEqual(44);
    expect(button!.width).toBeGreaterThanOrEqual(44);
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: "/tmp/spark-content-mobile.png" });
});


test("offline cold start can open the editor before its first use", async ({ page, context }) => {
  test.skip(process.env.SPARK_TEST_OFFLINE !== "1", "Requires a production build with service worker");
  await page.evaluate(() => navigator.serviceWorker.ready.then(() => true));
  await expect.poll(async () => page.evaluate(async () => {
    const names = performance.getEntriesByType("resource").map((entry) => entry.name).filter((name) => name.includes("/_next/static/") && name.endsWith(".js"));
    return names.length > 0 && (await Promise.all(names.map((name) => caches.match(name)))).every(Boolean);
  })).toBe(true);
  await context.setOffline(true);
  await page.reload();
  const editor = await openQuickAdd(page);
  await editor.fill("Offline có định dạng");
  await editor.press("Meta+a");
  await editor.press("Meta+b");
  await page.getByRole("textbox", { name: "Tên mục" }).fill("Browser offline test");
  await page.getByRole("button", { name: "Thêm", exact: true }).click();
  await page.getByRole("button", { name: "Hủy", exact: true }).click();
  await page.reload();
  await openTestItem(page, "Browser offline test");
  await expect(page.locator(".detail-description strong")).toHaveText("Offline có định dạng");
  await context.setOffline(false);
});
