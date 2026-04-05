const CACHE_VERSION = "v9.1";
const CACHE_NAME = `tobbetu-cache-${CACHE_VERSION}`;
const OFFLINE_URL = "/offline.html";

const FILES_TO_CACHE = [
  "/",
  "/index.html",
  "/css/customfeatures.css",
  "/css/eskicss.css",
  "/css/font-awesome.min.css",
  "/css/forprogrampage.css",
  "/css/oldstyle.css",
  "/css/spacestyle.css",
  "/css/style.css",
  "/css/tables.css",
  "/css/terminalstyle.css",
  "/scripts/academic.js",
  "/scripts/announche.js",
  "/scripts/bridger.js",
  "/scripts/countdown.js",
  "/scripts/getclasses.js",
  "/scripts/getmeal.js",
  "/scripts/getnextring.js",
  "/scripts/gettodaymenu.js",
  "/scripts/languageswitch.js",
  "/scripts/notification.js",
  "/scripts/notifymenu.js",
  "/scripts/program.js",
  "/scripts/rings.js",
  "/scripts/screensaver.js",
  "/scripts/script.js",
  "/scripts/shirvan.js",
  "/scripts/soundmanager.js",
  "/scripts/styleswitcher.js",
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
  "/jsons/translations.json",
  "/akademik/index.html",
  "/ana/index.html",
  "/arsiv/index.html",
  "/dersler/index.html",
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
  "/images/anooshirvan.png",
  "/sounds/fenerbahce.wav"
];

// INSTALL — Precache core files safely
self.addEventListener("install", (event) => {
  console.log("Installing service worker:", CACHE_VERSION);
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(async (cache) => {
        for (const file of FILES_TO_CACHE) {
          try {
            const res = await fetch(file, { cache: "no-store" });
            if (res.ok && res.status === 200) await cache.put(file, res);
          } catch (err) {
            console.warn("Failed to cache:", file, err);
          }
        }
      })
      .then(() => self.skipWaiting())
  );
});

// ACTIVATE — Remove old caches
self.addEventListener("activate", (event) => {
  console.log("Activating service worker:", CACHE_VERSION);
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// FETCH — Network-first, fallback to cache, with 206-safe caching
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  const url = event.request.url;

  // Always get fresh CSS (theme switching)
  if (url.endsWith(".css")) {
    event.respondWith(
      caches.open(`${CACHE_NAME}-css`).then(async (cache) => {
        try {
          const fresh = await fetch(event.request, { cache: "no-store" });
          if (fresh.status === 200) cache.put(event.request, fresh.clone());
          return fresh;
        } catch {
          return cache.match(event.request);
        }
      })
    );
    return;
  }

  // Network-first for everything else
  event.respondWith(
    fetch(event.request)
      .then(async (response) => {
        // Skip caching partial (206) or invalid responses
        if (response.ok && response.status === 200) {
          const clone = response.clone();
          try {
            const cache = await caches.open(CACHE_NAME);
            await cache.put(event.request, clone);
          } catch (err) {
            console.warn("Cache put skipped:", event.request.url, err);
          }
        }
        return response;
      })
      .catch(async () => {
        const cached = await caches.match(event.request);
        return cached || (await caches.match(OFFLINE_URL));
      })
  );
});

// AUTO-UPDATE — background cache refresh
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
      const res = await fetch(url, { cache: "no-store" });
      if (res.ok && res.status === 200) await cache.put(url, res);
    } catch (err) {
      console.warn("Failed to refresh:", url);
    }
  }
}

// Notifications
self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  e.waitUntil(clients.openWindow("/"));
});

// Manual “Skip Waiting” trigger
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
