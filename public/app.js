'use strict';

const $ = (id) => document.getElementById(id);
const home = $('home');
const browser = $('browser');
const frame = $('web-frame');
const connection = new BareMux.BareMuxConnection('/transport/worker.js');
let currentUrl = '';
let transportReady = false;

function resolveTarget(raw) {
  const value = String(raw || '').trim();
  if (!value) return '';

  // Explicit URLs are opened directly; all other input uses DuckDuckGo Japan.
  try {
    const parsed = new URL(value);
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') return parsed.href;
    throw new Error('http:// または https:// のURLを入力してください。');
  } catch (error) {
    if (error.message?.includes('http://')) throw error;
  }

  if (/^[a-z0-9.-]+(?::\d+)?(?:\/.*)?$/i.test(value) && value.includes('.')) {
    try { return new URL(`https://${value}`).href; } catch {}
  }

  return `https://html.duckduckgo.com/html/?q=${encodeURIComponent(value)}&kl=jp-jp`;
}

async function openTarget(raw) {
  $('error').textContent = '';
  let target;
  try {
    target = resolveTarget(raw);
    if (!target) return;
    await registerSW();

    const socket = `${location.protocol === 'https:' ? 'wss:' : 'ws:'}//${location.host}/socket/`;
    if (!transportReady || (await connection.getTransport()) !== '/transport-core/index.mjs') {
      await connection.setTransport('/transport-core/index.mjs', [{ wisp: socket }]);
      transportReady = true;
    }

    currentUrl = target;
    $('current-url').textContent = target;
    home.classList.add('hidden');
    browser.classList.remove('hidden');
    frame.src = self.__uv$config.prefix + self.__uv$config.encodeUrl(target);
  } catch (error) {
    $('error').textContent = error.message || 'ページを開けませんでした。';
  }
}

$('proxy-form').addEventListener('submit', (event) => {
  event.preventDefault();
  openTarget($('address').value);
});

document.querySelectorAll('[data-url]').forEach((button) => {
  button.addEventListener('click', () => openTarget(button.dataset.url));
});

$('close-browser').addEventListener('click', () => {
  frame.src = 'about:blank';
  browser.classList.add('hidden');
  home.classList.remove('hidden');
});
$('back').addEventListener('click', () => {
  try { frame.contentWindow.history.back(); } catch {}
});
$('forward').addEventListener('click', () => {
  try { frame.contentWindow.history.forward(); } catch {}
});
$('refresh').addEventListener('click', () => {
  try { frame.contentWindow.location.reload(); }
  catch {
    if (currentUrl) frame.src = self.__uv$config.prefix + self.__uv$config.encodeUrl(currentUrl);
  }
});
