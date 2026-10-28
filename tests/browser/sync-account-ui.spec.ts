import { test, expect } from "@playwright/test";

for (const width of [390, 1280]) for (const theme of ["light", "dark"] as const) {
  test(`cloud account controls ${width}px ${theme}`, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 });
    await page.emulateMedia({ colorScheme: theme });
    const userId = "a4141cfa-5029-4fbb-8eb9-0ad72825764a";
    const expires = Math.floor(Date.now() / 1000) + 3600;
    const token = `${Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url")}.${Buffer.from(JSON.stringify({ sub: userId, exp: expires, role: "authenticated" })).toString("base64url")}.test-signature`;
    await page.route("**/auth/v1/**", route => route.fulfill({ json: {} }));
    await page.route("**/rest/v1/**", route => route.fulfill({ json: [] }));
    await page.routeWebSocket(/supabase.*realtime/, ws => ws.close());
    await page.addInitScript(({ token, expires, userId }) => {
      localStorage.setItem("sb-ukoowtpqztknbrgpyqdx-auth-token", JSON.stringify({ access_token: token, refresh_token: "test-refresh-token", expires_at: expires, expires_in: 3600, token_type: "bearer", user: { id: userId, email: "test@example.invalid", app_metadata: {}, user_metadata: {}, aud: "authenticated", created_at: new Date().toISOString() } }));
    }, { token, expires, userId });
    await page.goto("/");
    await expect(page.getByRole("region", { name: "Khởi động Spark" })).toBeHidden();
    await page.locator(width < 700 ? ".mobile-sync-status" : ".local-mode-card").click();
    const dialog = page.locator(".sync-dialog");
    await page.locator(".utility-screen").evaluate(el => Promise.all(el.getAnimations().map(a => a.finished)));
    await expect(dialog.locator("h2")).toHaveText("Dữ liệu luôn bên bạn, trên mọi thiết bị.");
    await expect(dialog.locator(".editor-header span")).toHaveText("ĐỒNG BỘ TỪ CLOUD");
    await expect(dialog.locator(".signed-in-row small")).toHaveText("Tài khoản");
    await expect(dialog.locator(".sync-hero > span")).toHaveCSS("border-radius", "50%");
    await expect(dialog.locator(".sync-hero > span")).toHaveCSS("color", "rgb(255, 255, 255)");
    await expect(dialog.locator(".sync-hero > span")).toHaveCSS("background-color", "rgb(17, 23, 66)");
    const disconnect = dialog.getByRole("button", { name: "Ngắt kết nối", exact: true });
    await expect(disconnect.locator("svg")).toBeVisible();
    await expect(disconnect).toBeInViewport();
    expect((await disconnect.boundingBox())!.height).toBeGreaterThanOrEqual(44);
    await expect(disconnect).not.toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
    await page.screenshot({ path: `/tmp/spark-sync-account-${width}-${theme}.png` });
    // Only the isolated fake session is signed out; every auth request is intercepted.
    await disconnect.click();
    await expect(dialog).toBeHidden();
    await page.locator(width < 700 ? ".mobile-sync-status" : ".local-mode-card").click();
    await expect(dialog.locator('input[type="email"]')).toBeVisible();
  });
}
