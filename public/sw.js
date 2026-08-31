const CACHE_NAME = "spark-app-shell-v1";
const APP_SHELL = [
  "/",
  "/manifest.webmanifest",
  "/spark-favicon.svg",
  "/spark-mark-negative.svg",
  "/brand/spark-logo-negative.svg",
  "/icons/spark-pwa-negative-192.png",
  "/icons/spark-pwa-negative-512.png",
  "/icons/spark-maskable-negative-512.png",
  "/icons/spark-apple-negative-180.png",
];

async function cacheResponse(cache, request, options) {
  try {
    const response = await fetch(request, options);
    if (response.ok && response.type === "basic") await cache.put(request, response);
  } catch {
    // A partial precache is still useful; missing assets can be cached at runtime.
  }
}

async function precacheUrls(urls) {
  const cache = await caches.open(CACHE_NAME);
  await Promise.all(urls.map((url) => cacheResponse(cache, new Request(url), { cache: "reload" })));
}

async function cacheMissingUrls(urls) {
  const cache = await caches.open(CACHE_NAME);
  for (const url of new Set(urls)) {
    const request = new Request(url);
    if (await cache.match(request)) continue;
    await cacheResponse(cache, request);
  }
}

self.addEventListener("install", (event) => {
  event.waitUntil(precacheUrls(APP_SHELL).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key.startsWith("spark-app-shell-") && key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("message", (event) => {
  if (event.data?.type !== "CACHE_URLS" || !Array.isArray(event.data.urls)) return;
  const urls = event.data.urls.filter((value) => {
    try {
      const url = new URL(value, self.location.origin);
      return url.origin === self.location.origin && url.pathname !== "/sw.js";
    } catch {
      return false;
    }
  });
  event.waitUntil(cacheMissingUrls(urls));
});

async function navigationResponse(request) {
  const cache = await caches.open(CACHE_NAME);
  try {
    const response = await fetch(request);
    if (response.ok && response.type === "basic") await cache.put(request, response.clone());
    return response;
  } catch {
    return (await cache.match(request)) ?? (await cache.match("/")) ?? Response.error();
  }
}

async function cacheFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok && response.type === "basic") await cache.put(request, response.clone());
  return response;
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);
  const network = fetch(request)
    .then(async (response) => {
      if (response.ok && response.type === "basic") await cache.put(request, response.clone());
      return response;
    })
    .catch(() => undefined);
  return cached ?? (await network) ?? Response.error();
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin || url.pathname === "/sw.js") return;

  if (request.mode === "navigate") {
    event.respondWith(navigationResponse(request));
    return;
  }

  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(cacheFirst(request));
    return;
  }

  if (["style", "script", "font", "image"].includes(request.destination)) {
    event.respondWith(staleWhileRevalidate(request));
  }
});
