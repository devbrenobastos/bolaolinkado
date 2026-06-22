// ============================================
// Palpiteiro Nato — Service Worker v6
// Estratégia: Cache-First para estáticos,
//             Network-First para navegação,
//             Push Notifications
// ============================================

const CACHE_VERSION = 'v6';
const STATIC_CACHE = `bolao-static-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `bolao-dynamic-${CACHE_VERSION}`;

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/offline.html',
  '/manifest.webmanifest',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/icon-512-maskable.png',
  '/icons/apple-touch-icon.png',
];

// ——— INSTALL: pré-cache dos assets estáticos ———
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// ——— ACTIVATE: limpar caches antigos ———
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== STATIC_CACHE && key !== DYNAMIC_CACHE)
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

// ——— FETCH: estratégia híbrida ———
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignorar: chrome-extension, non-http, Supabase API calls, CDN fonts
  if (
    !url.protocol.startsWith('http') ||
    url.hostname.includes('supabase.co') ||
    url.hostname.includes('fonts.googleapis.com') ||
    url.hostname.includes('fonts.gstatic.com') ||
    url.hostname.includes('api-football.com')
  ) {
    return;
  }

  // Estratégia 1 — Cache First para assets estáticos (JS, CSS, ícones, fontes locais)
  if (
    request.destination === 'script' ||
    request.destination === 'style' ||
    request.destination === 'image' ||
    request.destination === 'font' ||
    url.pathname.startsWith('/icons/') ||
    url.pathname.endsWith('.webmanifest')
  ) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          if (response && response.status === 200 && response.type !== 'opaque') {
            const clone = response.clone();
            caches.open(STATIC_CACHE).then((cache) => cache.put(request, clone));
          }
          return response;
        });
      })
    );
    return;
  }

  // Estratégia 2 — Network First para navegação (HTML)
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const clone = response.clone();
          caches.open(STATIC_CACHE).then((cache) => cache.put(request, clone));
          return response;
        })
        .catch(() =>
          caches.match('/index.html').then(
            (cached) => cached || caches.match('/offline.html')
          )
        )
    );
    return;
  }

  // Estratégia 3 — Stale-While-Revalidate para demais requisições
  event.respondWith(
    caches.match(request).then((cached) => {
      const fetchPromise = fetch(request).then((response) => {
        if (response && response.status === 200 && response.type !== 'opaque') {
          const clone = response.clone();
          caches.open(DYNAMIC_CACHE).then((cache) => cache.put(request, clone));
        }
        return response;
      });
      return cached || fetchPromise;
    })
  );
});

// ——— PUSH: receber notificação do servidor ———
self.addEventListener('push', (event) => {
  let data = { title: 'Palpiteiro Nato', body: 'Você tem uma atualização!', url: '/' };

  if (event.data) {
    try {
      data = { ...data, ...event.data.json() };
    } catch {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    image: data.image || undefined,
    data: { url: data.url || '/' },
    vibrate: [200, 100, 200],
    tag: data.tag || 'bolao-notification',
    renotify: true,
    requireInteraction: false,
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

// ——— NOTIFICATIONCLICK: abrir/focar o app ao clicar ———
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const targetUrl = event.notification.data?.url || '/';

  event.waitUntil(
    clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            client.focus();
            client.navigate(targetUrl);
            return;
          }
        }
        return clients.openWindow(targetUrl);
      })
  );
});

// ——— MESSAGE: forçar atualização do SW ———
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
