/* ============================================================
   FPV Detector Service Worker
   Кэширует статику для offline-режима
   ============================================================ */
const CACHE = "fpv-detector-v1";
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png",
];

// Установка — кэшируем файлы
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE)
      .then((cache) => cache.addAll(ASSETS).catch(() => {}))
      .then(() => self.skipWaiting())
  );
});

// Активация — чистим старые кэши
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

// Перехват запросов
self.addEventListener("fetch", (event) => {
  const req = event.request;

  // WebSocket и не-GET запросы не трогаем
  if (req.method !== "GET") return;
  if (req.url.startsWith("ws://") || req.url.startsWith("wss://")) return;

  // Навигационные запросы — отдаём index.html из кэша
  if (req.mode === "navigate") {
    event.respondWith(
      caches.match("./index.html").then((r) => r || fetch(req))
    );
    return;
  }

  // Остальное — из кэша, если есть
  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req).then((response) => {
        // Кэшируем только успешные ответы того же origin
        if (response && response.status === 200 && response.type === "basic") {
          const copy = response.clone();
          caches.open(CACHE).then((cache) => cache.put(req, copy)).catch(() => {});
        }
        return response;
      }).catch(() => caches.match("./index.html"));
    })
  );
});