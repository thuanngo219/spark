import { expect, test } from "./fixtures";

for (const width of [1280, 390, 320]) {
  for (const theme of ["light", "dark"] as const) {
    test(`header collapses and restores without scroll jumps at ${width}px in ${theme}`, async ({ page }) => {
      await page.setViewportSize({ width, height: 800 });
      await page.emulateMedia({ colorScheme: theme });
      await page.addInitScript(() => {
        const projectId = crypto.randomUUID();
        localStorage.setItem("spark:data:v1", JSON.stringify({
          projects: [{ id: projectId, name: "Dự án kiểm tra tiêu đề dài", color: "#8951C7", isStarred: false, archivedAt: null }],
          items: Array.from({ length: 48 }, (_, i) => ({
            id: crypto.randomUUID(), type: "task", title: `Công việc kiểm tra ${i + 1}`,
            description: "", startDate: null, dueDate: null, projectId,
            completedAt: null, archivedAt: null, isImportant: false, isUrgent: false,
            createdAt: new Date().toISOString(),
          })),
        }));
      });
      const errors: string[] = [];
      page.on("pageerror", error => errors.push(error.message));
      await page.goto("/");
  await expect(page.getByRole("region", { name: "Khởi động Spark" })).toBeHidden();
      await expect(page.locator(".item-row")).toHaveCount(48);
      const header = page.locator(".view-header");
      const title = header.locator("h1");
      const fullSize = await title.evaluate(el => parseFloat(getComputedStyle(el).fontSize));
      await expect(header.locator("p")).toBeVisible();
      await page.mouse.move(width - 40, 450);
      await page.mouse.wheel(0, 36);
      await expect(header).toHaveClass(/is-compact/);
      await page.waitForTimeout(350);
      expect(await page.evaluate(() => scrollY)).toBe(36);
      await expect(header).toHaveClass(/is-compact/);
      const compactSize = await title.evaluate(el => parseFloat(getComputedStyle(el).fontSize));
      expect(compactSize).toBeCloseTo(fullSize / 2, 2);
      expect(await title.evaluate(el => parseFloat(getComputedStyle(el).letterSpacing) / parseFloat(getComputedStyle(el).fontSize))).toBeCloseTo(-0.025, 4);
      for (const selector of [".eyebrow", "p", ".view-title-row button"]) {
        for (const el of await header.locator(selector).all()) await expect(el).toBeHidden();
      }
      if (width >= 700) {
        await expect(header.locator(".view-actions")).toBeVisible();
        const titleBox = (await title.boundingBox())!;
        const controlsBox = (await header.locator(".view-actions").boundingBox())!;
        expect(titleBox.y + titleBox.height / 2).toBeCloseTo(controlsBox.y + controlsBox.height / 2, 1);
      }
      else await expect(page.locator(".mobile-sync-status")).toBeVisible();
      await expect(header.locator(".view-project-band")).toHaveCSS("height", "5px");
      await page.mouse.wheel(0, 500);
      await expect.poll(async () => (await header.boundingBox())?.y).toBe(0);
      await page.mouse.wheel(0, -2000);
      await expect(header).not.toHaveClass(/is-compact/);
      await expect(header.locator("p")).toBeVisible();
      await expect.poll(() => title.evaluate(el => parseFloat(getComputedStyle(el).fontSize))).toBe(fullSize);
      if (width < 700) {
        await header.getByRole("button", { name: "Mở sidebar", exact: true }).click();
      }
      await page.getByRole("button", { name: "Dự án kiểm tra tiêu đề dài", exact: true }).click();
      await expect(title).toHaveText("Dự án kiểm tra tiêu đề dài");
      await page.mouse.move(width - 40, 450);
      await page.mouse.wheel(0, 400);
      await expect(header).toHaveClass(/is-compact/);
      await expect(header.getByRole("button", { name: /Chỉnh sửa dự án/ })).toBeHidden();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      expect(errors).toEqual([]);
    });
  }
}

test("short mobile list keeps its scroll range when the header collapses", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 550 });
  await page.goto("/");
  await expect(page.getByRole("region", { name: "Khởi động Spark" })).toBeHidden();
  await page.locator(".item-main").first().waitFor();
  await page.keyboard.press("a");
  const header = page.locator(".view-header");
  const height = await page.evaluate(() => document.documentElement.scrollHeight);
  await page.setViewportSize({ width: 390, height: height - 40 });
  await page.mouse.move(350, 250);
  await page.mouse.wheel(0, 36);
  await expect(header).toHaveClass(/is-compact/);
  await page.waitForTimeout(350);
  await expect(header).toHaveClass(/is-compact/);
  expect(await page.evaluate(() => scrollY)).toBe(36);
  await page.mouse.wheel(0, -100);
  await expect(header).not.toHaveClass(/is-compact/);
});
