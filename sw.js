const staticCacheName = "static-cache-demo";
const dynamicCacheName = "dynamic-cache-demo";

const assets = [
  "./manifest.json",
  "./",
  "./index.html",
  "./fallback.html",
  "./css/style.css",
  "./icons/qr.gif",
  "./icons/56x56.png",
  "./icons/112x112.png",
  "./icons/128x128.png",
  "./icons/144x144.png",
  "./icons/196x196.png",
  "./icons/512x512.png",
  "./icons/favicon.png",
  "./icons/mobile-scan.png",
  "./js/index.js",
  "./js/global-functions.js",
  "./js/custom-qr-reader.js",
  "./js/html5-qrcode.min.js",
  "./sounds/notification.mp3",
  "https://fonts.googleapis.com/css2?family=Exo+2:wght@400;600&display=swap",
  "https://fonts.gstatic.com/s/exo2/v19/7cHmv4okm5zmbtYoK-4.woff2",
];

// installing service worker
self.addEventListener("install", (e) => {
  // console.log("installing app...");
  // waitUntil - wait for the task to exe, inside the ()
  e.waitUntil(
    // adding files to cache
    caches
      .open(staticCacheName)
      .then((cache) => cache.addAll(assets))
      .catch((err) => {
        return console.log("❌ SW Installation Error");
      })
  );

  // skip waiting - auto reinstall
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  // console.log("updating app...");
  // delete old chache
  e.waitUntil(
    caches
      .keys()
      .then((keys) => {
        return Promise.all(keys.filter((key) => key !== staticCacheName).map((key) => caches.delete(key)));
      })
      .catch((err) => {
        console.log("❌ SW Activation Error", err);
      })
  );
});

// fetch from cache storage first
// if not found then fetch from server
self.addEventListener("fetch", (e) => {
  e.respondWith(
    caches
      .match(e.request)
      .then(async (cacheRes) => {
        return (
          cacheRes ||
          fetch(e.request).then(async (fetchRes) => {
            return caches.open(dynamicCacheName).then((cache) => {
              cache.put(e.request.url, fetchRes.clone());
              return fetchRes;
            });
          })
        );
      })
      .catch((err) => {
        // if user offline req for new page return offline page
        if (e.request.url.indexOf(".html") > -1) {
          return caches.match("./fallback.html");
        }

        return console.log("❌ SW Fetching Error");
      })
  );
});
