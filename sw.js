const CACHE = "daftar-v3";
const ASSETS = [
  "./", "./index.html", "./manifest.json", "./icon.svg", "./icon-maskable.svg",
  "./icon-192.png", "./icon-512.png", "./icon-maskable-512.png", "./apple-touch-icon.png",
  "./css/style.css?v=3", "./js/app.js?v=3"
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting()).catch(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((keys) =>
    Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
  ).then(() => self.clients.claim()));
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;
  e.respondWith(
    caches.match(req).then((hit) => {
      const net = fetch(req).then((res) => {
        if (res && res.status === 200) caches.open(CACHE).then((c) => c.put(req, res.clone()));
        return res;
      }).catch(() => hit || (req.mode === "navigate" ? caches.match("./index.html") : Response.error()));
      return hit || net;
    })
  );
});
