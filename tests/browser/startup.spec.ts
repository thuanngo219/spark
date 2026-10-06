import { test, expect, type Page } from "@playwright/test";
import { seedData } from "../seed-data";
import { getLocalDateKey } from "../../src/lib/dates";

const userId = "a4141cfa-5029-4fbb-8eb9-0ad72825764a";
const projectId = "b4141cfa-5029-4fbb-8eb9-0ad72825764a";
const itemId = "c4141cfa-5029-4fbb-8eb9-0ad72825764a";
const cloudProject = { id: projectId, name: "Dự án thật", color: "#8951C7", is_starred: false, archived_at: null, position: 0 };
const cloudItem = { id: itemId, type: "task", title: "Nội dung thật từ cloud", description: null, start_date: null, due_date: null, project_id: projectId, completed_at: null, archived_at: null, is_important: true, is_urgent: true, created_at: new Date().toISOString() };
const splash = (page: Page) => page.getByRole("region", { name: "Khởi động Spark" });
async function mockSession(page: Page, cached = false) {
  const expires = Math.floor(Date.now() / 1000) + 3600;
  const token = `${Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url")}.${Buffer.from(JSON.stringify({ sub: userId, exp: expires, role: "authenticated" })).toString("base64url")}.test-signature`;
  await page.route("**/auth/v1/**", route => route.fulfill({ json: {} }));
  await page.routeWebSocket(/supabase.*realtime/, ws => ws.close());
  await page.addInitScript(({ token, expires, userId, cached, projectId, itemId }) => {
    localStorage.setItem("sb-ukoowtpqztknbrgpyqdx-auth-token", JSON.stringify({ access_token: token, refresh_token: "test-refresh-token", expires_at: expires, expires_in: 3600, token_type: "bearer", user: { id: userId, email: "test@example.invalid", app_metadata: {}, user_metadata: {}, aud: "authenticated", created_at: new Date().toISOString() } }));
    if (cached) localStorage.setItem(`spark:data:v2:user:${userId}`, JSON.stringify({ projects: [{ id: projectId, name: "Dự án đã lưu", color: "#65458A", isStarred: false, archivedAt: null, position: 0 }], items: [{ id: itemId, type: "task", title: "Việc thật đã lưu", description: null, startDate: null, dueDate: null, projectId, completedAt: null, archivedAt: null, isImportant: false, isUrgent: false, createdAt: new Date().toISOString() }] }));
  }, { token, expires, userId, cached, projectId, itemId });
}

for (const width of [1280, 390]) {
  test(`fresh local startup is empty and reveal is accessible at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 });
    await page.goto("/");
    await expect(splash(page)).toBeHidden();
    await expect(page.locator(".item-row")).toHaveCount(0);
    await expect(page.locator(".app-shell")).not.toHaveAttribute("inert");
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.keyboard.press("n");
    await expect(page.locator(".quick-add-dialog")).toBeVisible();
  });
}

test("pristine local seed disappears while edited entries survive reload", async ({ page }) => {
  const data = seedData(getLocalDateKey());
  data.items.push({ ...data.items[0], id: crypto.randomUUID(), title: "Việc thật giữ lại" });
  await page.addInitScript(data => {
    if (!sessionStorage.getItem("seed-once")) {
      localStorage.setItem("spark:data:v1", JSON.stringify(data));
      sessionStorage.setItem("seed-once", "1");
    }
  }, data);
  await page.goto("/");
  await expect(splash(page)).toBeHidden();
  await expect(page.locator(".item-row")).toHaveCount(1);
  await expect(page.locator(".item-row")).toContainText("Việc thật giữ lại");
  await page.reload();
  await expect(splash(page)).toBeHidden();
  await expect(page.locator(".item-row")).toHaveCount(1);
});

test("startup waits for both cloud datasets, migrates only Violet, fades then reveals", async ({ page }) => {
  await mockSession(page);
  let releaseProjects!: () => void;
  let releaseItems!: () => void;
  const projectsReady = new Promise<void>(resolve => { releaseProjects = resolve; });
  const itemsReady = new Promise<void>(resolve => { releaseItems = resolve; });
  const patches: { url: string; body: unknown }[] = [];
  await page.route("**/rest/v1/projects*", async route => {
    if (route.request().method() === "PATCH") {
      patches.push({ url: route.request().url(), body: route.request().postDataJSON() });
      await route.fulfill({ status: 204 });
      return;
    }
    await projectsReady;
    await route.fulfill({ json: [cloudProject] });
  });
  await page.route("**/rest/v1/items*", async route => { await itemsReady; await route.fulfill({ json: [cloudItem] }); });
  await page.goto("/");
  await expect(page.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "45");
  await expect(page.locator(".app-shell")).toHaveAttribute("inert", "");
  await expect(page.locator(".item-row")).toHaveCount(0);
  await page.keyboard.press("n");
  await expect(page.locator(".quick-add-dialog")).toHaveCount(0);
  releaseProjects();
  await page.waitForTimeout(150);
  await expect(splash(page)).not.toHaveClass(/is-ready/);
  await page.evaluate(() => {
    const record: { name: string; at: number }[] = [];
    Object.assign(window, { startupEvents: record });
    document.addEventListener("animationend", e => record.push({ name: e.animationName, at: performance.now() }));
  });
  releaseItems();
  await expect(splash(page)).toHaveClass(/is-ready/);
  const timing = await splash(page).evaluate(el => {
    const background = getComputedStyle(el, "::before");
    return {
      fade: getComputedStyle(el.querySelector(".startup-content")!).animationDuration,
      delay: background.animationDelay,
      duration: background.animationDuration,
      origin: background.transformOrigin,
      rightCenter: `${el.clientWidth}px ${el.clientHeight / 2}px`,
    };
  });
  expect(timing).toEqual({ fade: "0.5s", delay: "0.5s", duration: "0.6s", origin: timing.rightCenter, rightCenter: timing.rightCenter });
  await expect(splash(page)).toBeHidden();
  const events = await page.evaluate(() => (window as unknown as { startupEvents: { name: string; at: number }[] }).startupEvents);
  const fade = events.find(e => e.name === "startup-logo-out")!;
  const reveal = events.find(e => e.name === "startup-reveal")!;
  expect(reveal.at - fade.at).toBeGreaterThan(500);
  await expect(page.locator(".item-row")).toContainText("Nội dung thật từ cloud");
  expect(patches).toHaveLength(1);
  expect(patches[0].body).toEqual({ color: "#D6A84F" });
  expect(patches[0].url).toContain(`user_id=eq.${userId}`);
  expect(patches[0].url).toContain(`id=eq.${projectId}`);
  expect(patches[0].url).toContain("color=eq.%238951C7");
});

test("failed sync preserves cached data and offers explicit offline fallback", async ({ page }) => {
  await mockSession(page, true);
  await page.route("**/rest/v1/**", route => route.fulfill({ status: 503, json: { message: "test unavailable" } }));
  await page.goto("/");
  await page.getByRole("button", { name: "Dùng dữ liệu đã lưu" }).click();
  await expect(splash(page)).toBeHidden();
  await expect(page.locator(".item-row")).toContainText("Việc thật đã lưu");
});

test("reduced motion startup releases the page", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(splash(page)).toBeHidden();
  await expect(page.getByRole("heading", { name: "Hôm nay", exact: true })).toBeVisible();
});

test("sync failure without cache cannot claim saved data and retry can recover", async ({ page }) => {
  await mockSession(page);
  await page.route("**/rest/v1/**", route => route.fulfill({ status: 400, json: { message: "test failure" } }));
  await page.goto("/");
  await expect(page.getByRole("button", { name: "Thử lại" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Dùng dữ liệu đã lưu" })).toHaveCount(0);
  await page.unroute("**/rest/v1/**");
  await page.route("**/rest/v1/projects*", route => route.fulfill({ json: [{ ...cloudProject, color: "#65458A" }] }));
  await page.route("**/rest/v1/items*", route => route.fulfill({ json: [cloudItem] }));
  await page.getByRole("button", { name: "Thử lại" }).click();
  await expect(splash(page)).toBeHidden();
  await expect(page.locator(".item-row")).toContainText("Nội dung thật từ cloud");
});

test("offline cloud session opens its own snapshot without remote reads", async ({ page }) => {
  await mockSession(page, true);
  await page.addInitScript(() => Object.defineProperty(navigator, "onLine", { get: () => false }));
  const requests: string[] = [];
  await page.route("**/rest/v1/**", route => { requests.push(route.request().url()); return route.abort(); });
  await page.goto("/");
  await expect(splash(page)).toBeHidden();
  await expect(page.locator(".item-row")).toContainText("Việc thật đã lưu");
  expect(requests).toEqual([]);
});

test("startup waits for pending offline mutations before revealing", async ({ page }) => {
  await mockSession(page, true);
  await page.addInitScript(({ userId, itemId, projectId }) => {
    localStorage.setItem(`spark:sync-pending:v1:${userId}`, JSON.stringify([{ id: crypto.randomUUID(), kind: "upsert-item", item: { id: itemId, type: "task", title: "Việc chỉnh khi offline", description: null, startDate: null, dueDate: null, projectId, completedAt: null, archivedAt: null, isImportant: true, isUrgent: false, createdAt: new Date().toISOString() } }]));
  }, { userId, itemId, projectId });
  let releaseWrite!: () => void;
  const waitForWrite = new Promise<void>(resolve => { releaseWrite = resolve; });
  let written = false;
  await page.route("**/rest/v1/projects*", route => route.fulfill({ json: [{ ...cloudProject, color: "#65458A" }] }));
  await page.route("**/rest/v1/items*", async route => {
    if (route.request().method() === "POST") {
      await waitForWrite;
      written = true;
      await route.fulfill({ status: 201, json: [] });
    } else await route.fulfill({ json: [{ ...cloudItem, title: written ? "Việc chỉnh khi offline" : cloudItem.title }] });
  });
  await page.goto("/");
  await expect(page.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "80");
  await expect(splash(page)).not.toHaveClass(/is-ready/);
  releaseWrite();
  await expect(splash(page)).toBeHidden();
  expect(written).toBe(true);
  await expect(page.locator(".item-row")).toContainText("Việc chỉnh khi offline");
});

test("signing out reveals empty local scope and retains the private snapshot", async ({ page }) => {
  await mockSession(page, true);
  await page.route("**/rest/v1/projects*", route => route.fulfill({ json: [{ ...cloudProject, color: "#65458A" }] }));
  await page.route("**/rest/v1/items*", route => route.fulfill({ json: [cloudItem] }));
  await page.goto("/");
  await expect(splash(page)).toBeHidden();
  await expect(page.locator(".item-row")).toContainText(cloudItem.title);
  await page.locator(".sync-header-status").click();
  await page.getByRole("button", { name: "Ngắt kết nối" }).click();
  await expect(splash(page)).toBeHidden();
  await expect(page.locator(".item-row")).toHaveCount(0);
  await expect(page.locator(".sync-dialog")).toHaveCount(0);
  const privateSnapshot = await page.evaluate(userId => new Promise<string[]>(resolve => {
    const open = indexedDB.open("spark-offline", 1);
    open.onsuccess = () => {
      const db = open.result;
      const request = db.transaction("snapshots").objectStore("snapshots").get(userId);
      request.onsuccess = () => { resolve(request.result.data.items.map((item: { title: string }) => item.title)); db.close(); };
    };
  }), userId);
  expect(privateSnapshot).toContain(cloudItem.title);
});
