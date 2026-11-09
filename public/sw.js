'use strict';
importScripts('/engine/uv.bundle.js');
importScripts('/proxy.config.js');
importScripts('/engine/uv.sw.js');

const proxyWorker = new UVServiceWorker();
self.addEventListener('fetch', (event) => {
  event.respondWith(proxyWorker.fetch(event));
});
