const CACHE_VERSION = "v6";
const CACHE_NAME = `tobbetu-cache-${CACHE_VERSION}`;
const OFFLINE_URL = "/offline.html";

const FILES_TO_CACHE = [
  "/",
  "/index.html",
  "/css/style.css",
  "/css/font-awesome.min.css",
  "/scripts/academic.js",
  "/scripts/announche.js",
  "/scripts/countdown.js",
  "/scripts/getmeal.js",
  "/scripts/getnextring.js",
  "/scripts/gettodaymenu.js",
  "/scripts/notifymenu.js",
  "/scripts/program.js",
  "/scripts/rings.js",
  "/scripts/screensaver.js",
  "/scripts/script.js",
  "/scripts/shirvan.js",
  "/scripts/themeswitch.js",
  "/fonts/fontawesome-webfont.eot",
  "/fonts/fontawesome-webfont.svg",
  "/fonts/fontawesome-webfont.ttf",
  "/fonts/fontawesome-webfont.woff",
  "/fonts/fontawesome-webfont.woff2",
  "/fonts/Omer-Sphere.woff",
  "/manifest.json",
  "/jsons/cezerixyzannouncements.json",
  "/jsons/courses.json",
  "/jsons/menu.json",
  "/akademik/index.html",
  "/arsiv/index.html",
  "/duyurular/index.html",
  "/kopru/index.html",
  "/menu/index.html",
  "/program/index.html",
  "/ringler/index.html",
  "/sayac/index.html",
  "/test/index.html",
  "/darkicon.png",
  "/fancyicon.png",
  "/lighticon.png",
  "/images/osmankuru.png",
  "/images/ahmethoca.png",
  "/images/anooshirvan.png"
];


// INSTALL — Precache core files
self.addEventListener("install", (event) => {
  console.log("Installing service worker:", CACHE_VERSION);
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(FILES_TO_CACHE))
      .then(() => self.skipWaiting())
  );
});


// ACTIVATE — Clean old caches
self.addEventListener("activate", (event) => {
  console.log("Activating service worker:", CACHE_VERSION);
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});


// FETCH — Network-first, fallback to cache, then offline
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return; // skip POST etc.

  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Update cache with fresh copy
        const resClone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, resClone));
        return response;
      })
      .catch(async () => {
        const cached = await caches.match(event.request);
        return cached || (await caches.match(OFFLINE_URL));
      })
  );
});


// AUTO-UPDATE CACHE every 10 min in background (for open tabs)
self.addEventListener("periodicsync", (event) => {
  if (event.tag === "update-cache") {
    event.waitUntil(updateCache());
  }
});

async function updateCache() {
  console.log("Background cache refresh...");
  const cache = await caches.open(CACHE_NAME);
  for (const url of FILES_TO_CACHE) {
    try {
      const response = await fetch(url, { cache: "no-store" });
      if (response.ok) await cache.put(url, response);
    } catch (err) {
      console.warn("Failed to refresh:", url);
    }
  }
}

// Notification
self.addEventListener("notificationclick", e => {
  e.notification.close();
  e.waitUntil(clients.openWindow("/"));
});
