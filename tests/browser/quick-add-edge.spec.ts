import { test, expect } from "./fixtures";
test("mobile edge swipe cancels quick-add without saving", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await expect(page.getByRole("region", { name: "Khởi động Spark" })).toBeHidden();
  await expect(page.locator("html")).toHaveCSS("touch-action", "pan-x pan-y");
  await page.getByRole("button", { name: "Thêm công việc", exact: true }).click();
  await page.getByRole("textbox", { name: "Tên mục", exact: true }).fill("Nháp hủy bằng vuốt");
  const client = await page.context().newCDPSession(page);
  await client.send("Emulation.setTouchEmulationEnabled", { enabled: true });
  await client.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: 8, y: 280 }] });
  for (let i = 1; i <= 6; i++) await client.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: 8 + i * 25, y: 280 }] });
  await client.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
  await expect(page.locator(".quick-add-dialog")).toBeHidden();
  await expect(page.locator(".item-title").filter({ hasText: "Nháp hủy bằng vuốt" })).toHaveCount(0);
  await page.getByRole("button", { name: "Thêm công việc", exact: true }).click();
  await expect(page.getByRole("textbox", { name: "Tên mục", exact: true })).toHaveValue("");
});
