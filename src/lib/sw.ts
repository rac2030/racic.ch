// Service Worker — lazy caching with content comparison and version tracking

declare const self: any;
declare const caches: any;

const CACHE_VERSION_KEY = 'racic-ch-cache-version';

// Default cache name — stamp-sw.js replaces this with a content-hashed version
export const CACHE_NAME = 'racic-ch-v1';

export function getVersion(): string {
  try { return localStorage.getItem(CACHE_VERSION_KEY) || '0'; }
  catch { return '0'; }
}

export function setVersion(v: string): void {
  try { localStorage.setItem(CACHE_VERSION_KEY, v); }
  catch {}
}

export function notifyClients(type: string, data?: Record<string, unknown>): void {
  self.clients.matchAll().then(function(clients) {
    clients.forEach(function(client) {
      client.postMessage(Object.assign({ type: type }, data || {}));
    });
  });
}

// Normalize a URL/path to a canonical site path without origin,
// 'index.html', or trailing slash (root becomes '/').
export function normalizePath(url: string): string {
  try {
    const u = new URL(url, 'https://racic.ch');
    let path = u.pathname.replace(/\/index\.html$/, '') || '/';
    if (path.length > 1) path = path.replace(/\/+$/, '');
    return path;
  } catch {
    const p = (url || '').replace(/\/index\.html$/, '');
    return p.length > 1 ? p.replace(/\/+$/, '') : (p || '/');
  }
}

// Requests that must never be served from cache (fresh API data).
export function shouldBypassCache(request?: {
  cache?: string;
}): boolean {
  return !!request && request.cache === 'no-store';
}

self.addEventListener('install', function(event) {
  self.skipWaiting();
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(names) {
      return Promise.all(
        names.filter(function(n) { return n !== CACHE_NAME; })
             .map(function(n) { return caches.delete(n); })
      );
    }).then(function() { return self.clients.claim(); })
  );
});

self.addEventListener('message', function(event) {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('fetch', function(event) {
  if (event.request.method !== 'GET') return;

  // Fresh-only requests (API calls like release notes) bypass the cache
  // entirely so the page always gets the newest content from the network.
  if (shouldBypassCache(event.request)) {
    event.respondWith(fetch(event.request));
    return;
  }

  event.respondWith(
    caches.match(event.request).then(function(cached) {
      var fetchPromise = fetch(event.request).then(function(networkResponse) {
        if (networkResponse && networkResponse.status === 200) {
          var clone = networkResponse.clone();
          caches.open(CACHE_NAME).then(function(cache) {
            cache.put(event.request, clone);
          });

          if (cached) {
            cached.clone().text().then(function(oldBody) {
              return networkResponse.clone().text().then(function(newBody) {
                if (oldBody !== newBody) {
                  var v = parseInt(getVersion()) + 1;
                  setVersion(String(v));
                  notifyClients('NEW_VERSION', { version: v, url: event.request.url });
                }
              });
            });
          }
        }
        return networkResponse;
      }).catch(function() {
        if (cached) return cached;
        return new Response('Offline and no cached version available', { status: 503, headers: { 'Content-Type': 'text/plain' } });
      });

      return cached || fetchPromise;
    })
  );
});
