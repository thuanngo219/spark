import { test, expect } from "./fixtures";
test("desktop sidebar icons retain positions across collapse", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("region", { name: "Khởi động Spark" })).toBeHidden();
  await page.getByRole("button", { name: "Mở rộng sidebar" }).click();
  const sidebar = page.locator(".app-shell > .sidebar");
  const positions = () => sidebar.locator(".nav-item > svg, .project-nav-row .project-dot").evaluateAll(elements => elements.map(el => { const b = el.getBoundingClientRect(); return { x: b.x + b.width / 2, y: b.y + b.height / 2 }; }));
  await page.locator(".app-shell").evaluate(el => Promise.all(el.getAnimations().map(a => a.finished)));
  const all = (await sidebar.getByRole("button", { name: "Tất cả", exact: true }).boundingBox())!;
  const important = (await sidebar.getByRole("button", { name: "Quan Trọng", exact: true }).boundingBox())!;
  expect(important.y - all.y - all.height).toBe(0);
  const expanded = await positions();
  await page.getByRole("button", { name: "Thu gọn sidebar" }).click();
  await page.locator(".app-shell").evaluate(el => Promise.all(el.getAnimations().map(a => a.finished)));
  expect(await positions()).toEqual(expanded);
});
