self.addEventListener('install', function (event) {
  console.log('[Service Worker] Installing service installing..', event)
  event.waitUntil(
    caches.open('static')
      .then(function (cache) {
        console.log('[Service Worker] Precaching ...')
        cache.addAll([
          '/',
          '/index.html',
          '/src/js/app.js',
          '/src/js/feed.js',
          '/src/js/fetch.js',
          '/src/js/promise.js',
          '/src/js/material.min.js',
          '/src/images/main-image.jpg',
          'https://fonts.googleapis.com/css?family=Roboto:400,700',
          'https://fonts.googleapis.com/icon?family=Material+Icons',
          'https://cdnjs.cloudflare.com/ajax/libs/material-design-lite/1.3.0/material.indigo-pink.min.css',
          '/src/css/app.css',
          '/src/css/feed.css'
        ])
      })
  )
});

self.addEventListener('activate', function (event) {
  console.log('[Service Worker] Activating service worker..', event)
  return self.clients.claim();
});

self.addEventListener('fetch', function (event) {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response
        } else {
          return fetch(event.request)
            .then(res => {
              return caches.open('dynamic')
                .then(cache => {
                  cache.put(event.request.url, res.clone());
                  return res;
                })
            })
            .catch((err) => {
              
            });
        }
      })
  );
});