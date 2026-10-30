import { test, expect } from "./fixtures";

for (const width of [390, 700, 1280]) {
  test(`list spacing and full project names at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.addInitScript(() => {
      const data = JSON.parse(localStorage.getItem("spark:data:v1")!);
      data.projects[0].name = "WWW DỰ ÁN TIẾNG VIỆT " + "W".repeat(58);
      localStorage.setItem("spark:data:v1", JSON.stringify(data));
    });
    await page.goto("/");
    await expect(page.locator(".startup-caption")).toHaveCSS("margin-top", "17px");
    await expect(page.getByRole("region", { name: "Khởi động Spark" })).toBeHidden();
    await page.evaluate(() => document.fonts.ready);
    await expect(page.locator(".item-list").first()).toHaveCSS("row-gap", "2px");
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
      expect(bounds.clippedX).toBe(false);
      expect(bounds.clippedY).toBe(false);
      expect(bounds.inside).toBe(true);
      expect(bounds.gap).toBeGreaterThanOrEqual(6);
      expect(bounds.centered).toBe("center");
      await page.screenshot({ path: `/tmp/spark-project-label-${width}.png`, fullPage: true });
      await chip.click();
      await expect(chip).toHaveAttribute("aria-expanded", "false");
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
}
