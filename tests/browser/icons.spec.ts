import { expect, test } from "@playwright/test";

test("app metadata, manifest and offline cache use the new icon set", async ({ page, request }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Hôm nay", exact: true })).toBeVisible();
  await expect(page.locator('link[rel="icon"][type="image/svg+xml"]')).toHaveAttribute("href", "/spark-favicon-v2.svg");
  await expect(page.locator('link[rel="apple-touch-icon"]')).toHaveAttribute("href", "/icons/spark-apple-v2-180.png");
  await expect(page.locator('link[rel="icon"][type="image/x-icon"]')).toHaveAttribute("href", "/spark-favicon-v2.ico");
  const manifestResponse = await request.get("/manifest.webmanifest");
  expect(manifestResponse.ok()).toBeTruthy();
  const manifest = await manifestResponse.json();
  expect(manifest.icons).toEqual([
    { src: "/icons/spark-pwa-v2-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
    { src: "/icons/spark-pwa-v2-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
    { src: "/icons/spark-maskable-v2-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
  ]);
  const assets = [...manifest.icons.map((icon: { src: string }) => icon.src), "/icons/spark-apple-v2-180.png", "/icons/spark-favicon-v2-32.png"];
  for (const url of assets) {
    const response = await request.get(url);
    expect(response.ok()).toBeTruthy();
    expect(response.headers()["content-type"]).toContain("image/png");
    const data = await response.body();
    expect(data.subarray(1, 4).toString()).toBe("PNG");
    const size = Number(url.match(/-(\d+)\.png$/)![1]);
    expect(data.readUInt32BE(16)).toBe(size);
    expect(data.readUInt32BE(20)).toBe(size);
  }
  const svg = await request.get("/spark-favicon-v2.svg");
  expect(svg.ok()).toBeTruthy();
  expect(await svg.text()).toContain('stop-color="#2B3BA8"');
  const ico = await request.get("/spark-favicon-v2.ico");
  expect(ico.ok()).toBeTruthy();
  expect((await ico.body()).readUInt16LE(4)).toBe(3);
  if (process.env.SPARK_TEST_OFFLINE === "1") {
    await page.evaluate(() => navigator.serviceWorker.ready.then(() => true));
    await expect.poll(() => page.evaluate(async (urls) => {
      const found = await Promise.all(urls.map(async (url) => Boolean(await caches.match(url))));
      return found.every(Boolean);
    }, assets)).toBe(true);
  }
  await page.setViewportSize({ width: 390, height: 844 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test("desktop sidebar, compact rail and mobile drawer use the approved logo", async ({ page, request }) => {
  await page.goto("/");
  const desktop = page.locator(".app-shell > .sidebar");
  const logo = desktop.locator(".brand-full");
  const wrap = desktop.locator(".brand-full-wrap");
  await expect(logo).toBeVisible();
  await expect(logo).toHaveAttribute("src", "/brand/spark-logo-negative-v2.svg");
  await expect.poll(() => logo.evaluate((image) => (image as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
  const compact = (await wrap.boundingBox())!;
  expect(compact.width).toBe(36);
  const badgeBefore = await page.screenshot({ clip: compact });
  await page.getByRole("button", { name: "Mở rộng sidebar", exact: true }).click();
  await page.locator(".app-shell").evaluate(e => Promise.all(e.getAnimations().map(a => a.finished)));
  const expanded = (await wrap.boundingBox())!;
  expect(expanded.x).toBe(compact.x);
  expect(expanded.y).toBe(compact.y);
  expect(expanded.height).toBe(compact.height);
  expect(await page.screenshot({ clip: compact })).toEqual(badgeBefore);
  const artwork = (await logo.boundingBox())!;
  expect(artwork.y + artwork.height).toBeLessThanOrEqual(expanded.y + expanded.height);
  const navIcon = (await desktop.locator(".nav-item svg").first().boundingBox())!;
  expect(compact.x + 18).toBeCloseTo(navIcon.x + navIcon.width / 2, 1);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("button", { name: "Mở sidebar", exact: true }).click();
  const mobileLogo = page.locator(".sidebar-mobile .brand-full");
  await expect(mobileLogo).toBeVisible();
  await expect(mobileLogo).toHaveAttribute("src", "/brand/spark-logo-negative-v2.svg");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  for (const url of ["/brand/spark-logo-v2.svg", "/brand/spark-logo-negative-v2.svg", "/spark-mark-v2.svg", "/brand/spark-logo.svg", "/brand/spark-logo-negative.svg", "/spark-mark-negative.svg"]) {
    const response = await request.get(url);
    expect(response.ok()).toBeTruthy();
    const svg = await response.text();
    expect(svg).toContain('stop-color="#2B3BA8"');
    expect(svg).not.toContain("spark-check-burst");
  }
  if (process.env.SPARK_TEST_OFFLINE === "1") {
    await page.evaluate(() => navigator.serviceWorker.ready.then(() => true));
    await expect.poll(() => page.evaluate(async () => Boolean(await caches.match("/spark-mark-v2.svg")) && Boolean(await caches.match("/brand/spark-logo-negative-v2.svg")))).toBe(true);
  }
});
