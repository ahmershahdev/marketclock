const CACHE = "marketclock-offline-v1";
const OFFLINE_URL = "/offline";

async function precacheOfflinePage() {
  const cache = await caches.open(CACHE);
  const response = await fetch(OFFLINE_URL, { cache: "reload" });
  if (!response.ok) return;
  const html = await response.clone().text();
  await cache.put(OFFLINE_URL, response);
  // The offline page needs its stylesheet and fonts too, and they have hashed names.
  const assets = [...new Set(html.match(/\/_next\/static\/[^"'\s)]+\.(?:css|woff2)/g) ?? [])];
  await cache.addAll(assets);
}

self.addEventListener("install", (event) => {
  event.waitUntil(precacheOfflinePage().then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  if (request.mode === "navigate") {
    event.respondWith(fetch(request).catch(() => caches.match(OFFLINE_URL)));
    return;
  }

  const url = new URL(request.url);
  if (url.origin === self.location.origin && url.pathname.startsWith("/_next/static/")) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ??
          fetch(request).then((response) => {
            if (response.ok) {
              const copy = response.clone();
              caches.open(CACHE).then((cache) => cache.put(request, copy));
            }
            return response;
          }),
      ),
    );
  }
});
