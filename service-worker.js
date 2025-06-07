
const CACHE_NAME = 'hiztegia-pwa-cache-v3'; // Cache-aren bertsioa eguneratu aldaketak daudenean
const urlsToCache = [
  '/',
  '/index.html',
  // Esbuild-ek sortutako JS fitxategia automatikoki cache-atuko da fetch gertaeran index.html-k eskatzen duenean
  // Beraz, ez da esplizituki hemen sartu behar /index.tsx gisa.
  '/data.json',
  '/verbData.json',
  '/manifest.webmanifest',
  '/favicon.svg',
  '/icons/icon-192x192.png', // Ziurtatu PNG fitxategi hauek sortzen dituzula
  '/icons/icon-512x512.png', // Ziurtatu PNG fitxategi hauek sortzen dituzula
  'https://esm.sh/react@^19.1.0',
  'https://esm.sh/react-dom@^19.1.0/client',
  'https://cdn.tailwindcss.com'
];

self.addEventListener('install', event => {
  console.log('Service Worker: Instalazioa egiten...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Cache-a irekita, fitxategiak gehitzen...');
        return cache.addAll(urlsToCache)
          .then(() => console.log('Service Worker: Fitxategi guztiak cache-atuta.'))
          .catch(error => console.error('Service Worker: Ezin izan dira fitxategiak cache-atu instalazioan:', error, urlsToCache));
      })
      .catch(error => console.error('Service Worker: Ezin izan da cache-a ireki instalazioan:', error))
  );
});

self.addEventListener('activate', event => {
  console.log('Service Worker: Aktibatzen...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Cache zaharra ezabatzen:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('Service Worker: Bezero guztiak kontrolatzen...');
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', event => {
  const requestUrl = new URL(event.request.url);

  // Kanpoko baliabideak (esm.sh, cdn.tailwindcss.com) beti cache-tik lehenik
  if (requestUrl.origin === 'https://esm.sh' || requestUrl.origin === 'https://cdn.tailwindcss.com') {
    event.respondWith(
      caches.match(event.request)
        .then(response => {
          if (response) {
            return response;
          }
          return fetch(event.request).then(
            fetchResponse => {
              // Egiaztatu erantzuna baliozkoa den
              if(!fetchResponse || fetchResponse.status !== 200 || fetchResponse.type !== 'basic' && fetchResponse.type !== 'cors') {
                return fetchResponse;
              }
              const responseToCache = fetchResponse.clone();
              caches.open(CACHE_NAME)
                .then(cache => {
                  cache.put(event.request, responseToCache);
                });
              return fetchResponse;
            }
          );
        })
    );
    return;
  }

  // Beste eskaera lokaletarako, cache-first estrategia
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response; // Cache-tik zerbitzatu
        }
        // Cache-an ez badago, saretik eskatu
        return fetch(event.request).then(
          fetchResponse => {
            // Egiaztatu erantzuna baliozkoa den eta cache-atu
            if(!fetchResponse || fetchResponse.status !== 200 || fetchResponse.type !== 'basic') {
              return fetchResponse;
            }
            const responseToCache = fetchResponse.clone();
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });
            return fetchResponse;
          }
        ).catch(error => {
            console.error('Service Worker: Fetch errorea', event.request.url, error);
            // Lineaz kanpoko orri sinple bat itzul genezake hemen nahi izanez gero
        });
      })
  );
});
