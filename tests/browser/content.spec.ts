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
  for (const name of ["In đậm", "In nghiêng", "Gạch chân", "Danh sách dấu đầu dòng", "Danh sách đánh số"]) {
    const button = await page.getByRole("button", { name, exact: true }).boundingBox();
    expect(button!.height).toBeGreaterThanOrEqual(44);
    expect(button!.width).toBeGreaterThanOrEqual(44);
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: "/tmp/spark-content-mobile.png" });
});

test("lists persist, field switching saves drafts, dates reject invalid ranges, editor fills available height", async ({ page }) => {
  const editor = await openQuickAdd(page);
  await page.getByRole("textbox", { name: "Tên mục" }).fill("Lists and draft test");
  await editor.fill("Mục một");
  await page.getByRole("button", { name: "Danh sách dấu đầu dòng" }).click();
  await editor.press("End"); await editor.press("Enter"); await editor.pressSequentially("Mục hai");
  await expect(editor.locator("ul li")).toHaveCount(2);
  await editor.press("Meta+a");
  await page.getByRole("button", { name: "Danh sách đánh số" }).click();
  await expect(editor.locator("ol li")).toHaveCount(2);
  await page.getByRole("button", { name: "Thêm", exact: true }).click();
  await page.getByRole("button", { name: "Hủy", exact: true }).click();
  await page.reload(); await openTestItem(page, "Lists and draft test");
  await expect(page.locator(".detail-description ol li")).toHaveCount(2);
  expect(await page.locator(".detail-description ol").evaluate((e) => getComputedStyle(e).marginBottom)).toBe("6px");
  await expect(page.locator(".detail-field-heading").first().getByRole("button", { name: "Sửa tên" })).toBeVisible();
  await page.getByRole("button", { name: "Sửa Nội dung" }).click();
  const detail = page.getByRole("textbox", { name: "Nội dung task", exact: true });
  await expect(detail.locator("ol li")).toHaveCount(2);
  await expect(detail).toBeFocused();
  await detail.locator("li p").last().click();
  await detail.pressSequentially(" đã sửa", { delay: 20 });
  await page.getByRole("button", { name: "Sửa tên" }).click();
  const title = page.getByRole("textbox", { name: "Tên task", exact: true });
  expect(await title.evaluate(e => getComputedStyle(e).boxShadow)).toBe("none");
  await title.fill("Saved switched title");
  await page.getByRole("button", { name: "Sửa Nội dung" }).click();
  await page.locator(".item-detail-sheet").evaluate((e) => Promise.all(e.getAnimations().map(a => a.finished)));
  expect((await page.locator(".item-detail-sheet").boundingBox())!.height).toBeCloseTo(688, 0);
  await page.screenshot({ path: "/tmp/spark-refined-editor-desktop.png" });
  expect(await detail.evaluate(e => getComputedStyle(e).backgroundColor)).toBe("rgba(0, 0, 0, 0)");
  await page.getByRole("button", { name: "Hủy", exact: true }).click();
  const dates = page.locator(".detail-metadata input[type=date]");
  const originalStart = await dates.first().inputValue();
  const originalDue = await dates.nth(1).inputValue();
  await dates.first().fill("2099-10-20");
  await expect(page.getByRole("status")).toContainText("chưa được lưu");
  await page.getByRole("button", { name: "Đóng", exact: true }).click();
  await page.reload(); await openTestItem(page, "Saved switched title");
  await expect(page.locator(".detail-description ol li").last()).toContainText("đã sửa");
  await expect(dates.first()).toHaveValue(originalStart);
  await expect(dates.nth(1)).toHaveValue(originalDue);
  await dates.first().fill("2099-10-20"); await dates.nth(1).fill("2099-10-21");
  await expect(page.getByRole("status")).toHaveCount(0);
  await page.getByRole("button", { name: "Đóng", exact: true }).click();
  await page.reload();
  await page.getByRole("button", { name: "Tất cả", exact: true }).click();
  await openTestItem(page, "Saved switched title");
  await expect(dates.first()).toHaveValue("2099-10-20"); await expect(dates.nth(1)).toHaveValue("2099-10-21");
});

test("bullet and number buttons work in an empty editor and exit on an empty line", async ({ page }) => {
  for (const [name, tag] of [["Danh sách dấu đầu dòng", "ul"], ["Danh sách đánh số", "ol"]]) {
    const editor = await openQuickAdd(page);
    const button = page.getByRole("button", { name, exact: true });
    await button.click();
    await expect(editor).toBeFocused();
    await expect(button).toHaveAttribute("aria-pressed", "true");
    await editor.pressSequentially("Dòng một", { delay: 15 });
    await editor.press("Enter");
    await editor.pressSequentially("Dòng hai", { delay: 15 });
    await expect(editor.locator(`${tag} li`)).toHaveCount(2);
    await editor.press("Enter"); await editor.press("Enter");
    await editor.pressSequentially("Ngoài danh sách", { delay: 15 });
    await expect(editor.locator(":scope > p").last()).toHaveText("Ngoài danh sách");
    await expect(button).toHaveAttribute("aria-pressed", "false");
    await page.getByRole("button", { name: "Hủy", exact: true }).click();
  }
});

test("mobile detail and quick-add focus styles remain light, lists fit narrow screens", async ({ page }) => {
  const editor = await openQuickAdd(page);
  await page.getByRole("textbox", { name: "Tên mục" }).fill("Mobile list test");
  await editor.click();
  await paste(page, "<p>Trước</p><ul><li><strong>Một</strong></li><li>Hai</li></ul><p>Sau</p>");
  await expect(editor.locator("ul li")).toHaveCount(2);
  expect(await editor.evaluate(e => getComputedStyle(e).backgroundColor)).toBe("rgb(241, 242, 245)");
  await page.getByRole("button", { name: "Thêm", exact: true }).click();
  await page.getByRole("button", { name: "Hủy", exact: true }).click();
  await page.reload();
  expect(await page.locator(".view-header").evaluate(e => getComputedStyle(e).backdropFilter)).toBe("blur(8px)");
  await page.setViewportSize({ width: 390, height: 844 });
  await openTestItem(page, "Mobile list test");
  await expect(page.locator(".detail-description ul li")).toHaveCount(2);
  await page.getByRole("button", { name: "Sửa Nội dung" }).click();
  const detail = page.getByRole("textbox", { name: "Nội dung task", exact: true });
  await expect(detail).toBeFocused();
  expect((await detail.boundingBox())!.height).toBeCloseTo(844 * .4, 0);
  await page.screenshot({ path: "/tmp/spark-refined-editor-mobile.png" });
  for (const width of [390, 320]) {
    await page.setViewportSize({ width, height: 844 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    expect(await page.locator(".content-toolbar").evaluate(e => e.scrollWidth <= e.clientWidth)).toBe(true);
  }
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
