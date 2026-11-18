import { test, expect } from "./fixtures";

for (const width of [390, 700, 1280]) {
  test(`list spacing and full project names at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.addInitScript(() => {
      const data = JSON.parse(localStorage.getItem("spark:data:v1")!);
      data.projects[0].name = "WWW DANH MỤC TIẾNG VIỆT " + "W".repeat(58);
      localStorage.setItem("spark:data:v1", JSON.stringify(data));
    });
    await page.goto("/");
    await expect(page.locator(".startup-caption")).toHaveCSS("margin-top", "17px");
    await expect(page.getByRole("region", { name: "Khởi động Spark" })).toBeHidden();
    await page.evaluate(() => document.fonts.ready);
    await expect(page.locator(".item-list").first()).toHaveCSS("row-gap", width < 700 ? "0px" : "2px");
    if (width < 700) {
      const row = page.locator(".item-row").filter({ has: page.locator(".item-project-dot:visible") }).filter({ has: page.locator(".checkbox") }).first();
      const geometry = await row.evaluate(element => {
        const checkbox = element.querySelector(".checkbox")!;
        const ring = getComputedStyle(checkbox, "::before");
        const control = checkbox.getBoundingClientRect();
        const dot = element.querySelector(".item-project-dot:not(.mobile-project-dot), .mobile-project-dot")!.getBoundingClientRect();
        const title = element.querySelector(".item-title")!.getBoundingClientRect();
        return {
          touchWidth: control.width,
          firstGap: dot.left - (control.left + control.width / 2 + parseFloat(ring.width) / 2),
          secondGap: title.left - dot.right,
          checkboxCenter: control.top + parseFloat(ring.top),
          dotCenter: dot.top + dot.height / 2,
          titleCenter: title.top + title.height / 2,
        };
      });
      expect(geometry.touchWidth).toBe(44);
      expect(geometry.firstGap).toBe(6);
      expect(geometry.secondGap).toBe(6);
      expect(geometry.checkboxCenter).toBeCloseTo(geometry.titleCenter, 1);
      expect(geometry.dotCenter).toBeCloseTo(geometry.titleCenter, 1);
    }
    if (width >= 700) {
      const chip = page.locator(".item-project-chip").first();
      await chip.click();
      await expect(chip).toHaveAttribute("aria-expanded", "true");
      await expect(chip.locator(".item-project-chip-label")).toHaveCSS("opacity", "1");
      await page.evaluate(() => Promise.all(document.getAnimations().filter(a => a.effect?.getTiming().iterations !== Infinity).map(a => a.finished)));
      const bounds = await chip.evaluate(el => {
        const visual = el.querySelector<HTMLElement>(".item-project-chip-visual")!;
        const label = el.querySelector<HTMLElement>(".item-project-chip-label")!;
        const main = el.parentElement!.querySelector<HTMLElement>(".item-main")!;
        const v = visual.getBoundingClientRect(), l = label.getBoundingClientRect();
        return { clippedX: label.scrollWidth > label.clientWidth + 1, clippedY: label.scrollHeight > label.clientHeight + 1,
          inside: l.left >= v.left && l.right <= v.right && l.bottom <= v.bottom,
          gap: main.getBoundingClientRect().left - v.right,
          centered: getComputedStyle(label).textAlign };
      });
      await expect(chip.locator(".item-project-chip-label")).toHaveCSS("white-space", "nowrap");
      expect(bounds.clippedX).toBe(false);
      expect(bounds.clippedY).toBe(false);
      expect(bounds.inside).toBe(true);
      expect(bounds.gap).toBeGreaterThanOrEqual(6);
      expect(bounds.centered).toBe("left");
      await page.screenshot({ path: `/tmp/spark-project-label-${width}.png`, fullPage: true });
      const widths = await page.locator(".item-project-chip.expanded .item-project-chip-visual").evaluateAll(els => els.map(el => el.getBoundingClientRect().width));
      expect(Math.max(...widths) - Math.min(...widths)).toBeLessThan(1);
      await chip.click();
      await expect(chip).toHaveAttribute("aria-expanded", "false");
      await chip.evaluate(el => Promise.all(el.parentElement!.getAnimations({ subtree: true }).map(a => a.finished)));
      const centerDelta = await chip.evaluate(el => { const dot = el.querySelector(".item-project-chip-dot")!.getBoundingClientRect(); const row = el.parentElement!.getBoundingClientRect(); return Math.abs(dot.y + dot.height / 2 - row.y - row.height / 2); });
      expect(centerDelta).toBeLessThan(1);
    }
    if (width < 700) expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
}

test("mobile puts undated item icons beside the title", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript(() => {
    const data = JSON.parse(localStorage.getItem("spark:data:v1")!);
    Object.assign(data.items[0], { startDate: null, dueDate: null });
    localStorage.setItem("spark:data:v1", JSON.stringify(data));
  });
  await page.goto("/");
  await expect(page.getByRole("region", { name: "Khởi động Spark" })).toBeHidden();
  await page.keyboard.press("a");
  const row = page.locator(".item-main").filter({ hasText: "Chốt ba việc quan trọng cho hôm nay" });
  await expect(row).toHaveCSS("height", "40px");
  await expect(row.locator("..").locator(".checkbox")).toHaveCSS("height", "40px");
  const title = (await row.locator(".item-title").boundingBox())!;
  const icons = (await row.locator(".item-meta").boundingBox())!;
  const bounds = (await row.boundingBox())!;
  expect(icons.y + icons.height / 2).toBeCloseTo(title.y + title.height / 2, 1);
  expect(icons.x + icons.width).toBeCloseTo(bounds.x + bounds.width - 4, 1);
});
