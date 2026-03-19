/* ============================================================
   Service Worker — Catálogo de Flores e Plantas
   Estratégia: Network-First com fallback para cache
   ============================================================ */

const CACHE_NAME = 'catalogo-flores-v1';
const OFFLINE_URL = '/';

/* Recursos que precisam ser cacheados imediatamente na instalação */
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
];

/* ─── INSTALL ─── */
self.addEventListener('install', (event) => {
  console.log('[SW] Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Pre-caching resources');
      return cache.addAll(PRECACHE_URLS);
    }).then(() => {
      // Força o SW novo a tomar controle imediatamente
      return self.skipWaiting();
    })
  );
});

/* ─── ACTIVATE ─── */
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => {
            console.log('[SW] Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    }).then(() => {
      // Assume controle de todas as abas abertas
      return self.clients.claim();
    })
  );
});

/* ─── FETCH ─── */
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignora requisições não-GET e de outros domínios (ex: Firebase)
  if (request.method !== 'GET') return;
  if (url.origin !== location.origin) return;

  // Para arquivos de assets (JS, CSS, imagens) — Cache First
  if (
    url.pathname.match(/\.(js|css|woff2?|ttf|otf|svg|png|jpg|jpeg|webp|ico)$/)
  ) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        });
      })
    );
    return;
  }

  // Para navegação (HTML) — Network First com fallback para cache
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(() => {
          return caches.match(OFFLINE_URL).then((cached) => {
            return cached || new Response(
              '<html><body><h1>Offline</h1><p>Sem conexão. Abra o app quando tiver internet.</p></body></html>',
              { headers: { 'Content-Type': 'text/html' } }
            );
          });
        })
    );
    return;
  }

  // Default — Network First
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        }
        return response;
      })
      .catch(() => caches.match(request))
  );
});

/* ─── BACKGROUND SYNC (para pedidos offline) ─── */
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-pedidos') {
    console.log('[SW] Background sync: pedidos');
    // A sincronização real é feita pelo Firebase quando a conexão volta
  }
});

/* ─── PUSH NOTIFICATIONS (preparado para uso futuro) ─── */
self.addEventListener('push', (event) => {
  if (!event.data) return;
  const data = event.data.json();
  self.registration.showNotification(data.title || 'Catálogo Flores', {
    body: data.body || 'Nova notificação',
    icon: '/icon-192.png',
    badge: '/icon-72.png',
    vibrate: [200, 100, 200],
    data: { url: data.url || '/' },
  });
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data?.url || '/')
  );
});
