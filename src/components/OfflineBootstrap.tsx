"use client";

import { useEffect } from "react";

function cacheLoadedAssets(registration: ServiceWorkerRegistration) {
  const urls = new Set<string>([window.location.href, new URL("/", window.location.origin).href]);
  for (const entry of performance.getEntriesByType("resource")) {
    try {
      const url = new URL(entry.name);
      if (url.origin === window.location.origin) urls.add(url.href);
    } catch {
      // Ignore browser-specific performance entries that are not URLs.
    }
  }
  registration.active?.postMessage({ type: "CACHE_URLS", urls: [...urls] });
}

function scheduleAssetCache(registration: ServiceWorkerRegistration) {
  if ("requestIdleCallback" in window) {
    window.requestIdleCallback(() => cacheLoadedAssets(registration), { timeout: 2_000 });
    return;
  }
  globalThis.setTimeout(() => cacheLoadedAssets(registration), 0);
}

export function OfflineBootstrap() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return;
    let active = true;

    navigator.serviceWorker.register("/sw.js", {
      scope: "/",
      updateViaCache: "none",
    }).then(async (registration) => {
      const ready = await navigator.serviceWorker.ready;
      if (active) scheduleAssetCache(ready ?? registration);
    }).catch((error) => {
      console.error("Spark service worker registration failed", error);
    });

    return () => {
      active = false;
    };
  }, []);

  return null;
}
