/**
 * Minimal service worker: exists purely to satisfy PWA installability and
 * to serve a friendly offline page for navigations when there's no
 * connection. Deliberately does NOT cache JS/CSS/API responses — doing
 * that risks serving a stale app bundle after a deploy, which is a much
 * worse bug than "no offline support". Bump CACHE_NAME to force old
 * caches to be cleared on the next activate.
 */
const CACHE_NAME = "eloq-shell-v1";
const OFFLINE_URL = "/offline.html";

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) =>
        cache.addAll([
          OFFLINE_URL,
          "/icons/icon-192.png",
          "/icons/icon-512.png",
        ]),
      )
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  // Only handle full-page navigations — everything else (JS, CSS, API
  // calls, images) passes straight through untouched.
  if (event.request.mode !== "navigate") return;

  event.respondWith(
    fetch(event.request).catch(() => caches.match(OFFLINE_URL)),
  );
});
