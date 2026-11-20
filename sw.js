// 오프라인 실행용 서비스 워커. 앱을 수정해 다시 올릴 때는 VERSION 숫자를 올려 주세요.
const PREFIX = "wp2027-", VERSION = PREFIX + "v4";
const ASSETS = ["./", "./index.html", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png", "./icon-maskable-512.png", "./apple-touch-icon.png"];
self.addEventListener("install", e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k.startsWith(PREFIX) && k !== VERSION).map(k => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET" || url.origin !== location.origin) return; // 구글 로그인·드라이브 요청은 그대로 통과
  e.respondWith(
    (e.request.mode === "navigate" || /\.html$|\/$|\.webmanifest$|sw\.js$/.test(url.pathname) ? fetch(url.href, { cache: "no-cache", credentials: "same-origin" }) : fetch(e.request)) // 화면 파일은 항상 서버에서 최신 확인
      .then(res => { const copy = res.clone(); caches.open(VERSION).then(c => c.put(e.request, copy)); return res; })
      .catch(() => caches.match(e.request).then(r => r || caches.match("./index.html")))
  );
});
