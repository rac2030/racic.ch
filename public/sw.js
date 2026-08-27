const CACHE_NAME = 'racic-ch-d6057eff';
const CACHE_VERSION_KEY = 'racic-ch-cache-version';

function getVersion() {
  try { return localStorage.getItem(CACHE_VERSION_KEY) || '0'; }
  catch { return '0'; }
}

function setVersion(v) {
  try { localStorage.setItem(CACHE_VERSION_KEY, v); }
  catch {}
}

function notifyClients(type, data) {
  self.clients.matchAll().then(function(clients) {
    clients.forEach(function(client) {
      client.postMessage(Object.assign({ type: type }, data || {}));
    });
  });
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

self.addEventListener('fetch', function(event) {
  if (event.request.method !== 'GET') return;

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
                  notifyClients('NEW_VERSION', { version: v });
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
