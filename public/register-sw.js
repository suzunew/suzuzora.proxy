'use strict';
async function registerSW() {
  if (!('serviceWorker' in navigator)) {
    throw new Error('このブラウザーはService Workerに対応していません。');
  }
  if (location.protocol !== 'https:' && !['localhost', '127.0.0.1'].includes(location.hostname)) {
    throw new Error('安全なHTTPS接続が必要です。KoyebのHTTPS URLを利用してください。');
  }
  await navigator.serviceWorker.register('/sw.js', { scope: '/' });
  await navigator.serviceWorker.ready;
}
