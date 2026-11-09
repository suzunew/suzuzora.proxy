import { createServer } from 'node:http';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import express from 'express';
import compression from 'compression';
import wisp from 'wisp-server-node';
import { uvPath } from '@titaniumnetwork-dev/ultraviolet';
import { epoxyPath } from '@mercuryworkshop/epoxy-transport';
import { baremuxPath } from '@mercuryworkshop/bare-mux/node';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = join(__dirname, '..', 'public');
const app = express();
const server = createServer(app);
const port = Number.parseInt(process.env.PORT || '8080', 10);

app.disable('x-powered-by');
app.set('trust proxy', 1);

// Compress text assets and API responses; already-compressed media is skipped.
app.use(compression({ threshold: 1024, level: 6 }));

app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  if (req.path === '/sw.js') {
    res.setHeader('Service-Worker-Allowed', '/');
    res.setHeader('Cache-Control', 'no-cache');
  }
  next();
});

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', app: 'suzuzora-proxy' });
});

// The application's own files are revalidated so deployments update immediately.
app.use(express.static(PUBLIC_DIR, {
  extensions: ['html'],
  etag: true,
  lastModified: true,
  maxAge: '1h',
  setHeaders(res, filePath) {
    if (filePath.endsWith('sw.js')) res.setHeader('Cache-Control', 'no-cache');
  }
}));

// Neutral public paths keep implementation details out of the visible interface.
const coreStaticOptions = {
  etag: true,
  lastModified: true,
  setHeaders(res, filePath) {
    if (filePath.endsWith('sw.js')) {
      res.setHeader('Cache-Control', 'no-cache');
    } else {
      res.setHeader('Cache-Control', 'public, max-age=604800, immutable');
    }
  }
};
app.use('/engine/', express.static(uvPath, coreStaticOptions));
app.use('/transport-core/', express.static(epoxyPath, coreStaticOptions));
app.use('/transport/', express.static(baremuxPath, coreStaticOptions));

app.use((_req, res) => {
  res.status(404).sendFile(join(PUBLIC_DIR, '404.html'));
});

server.on('upgrade', (req, socket, head) => {
  if (req.url?.startsWith('/socket/')) {
    wisp.routeRequest(req, socket, head);
    return;
  }
  socket.destroy();
});

server.keepAliveTimeout = 65_000;
server.headersTimeout = 66_000;

const shutdown = () => {
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(1), 10_000).unref();
};
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

server.listen(port, '0.0.0.0', () => {
  console.log(`suzuzora proxy listening on 0.0.0.0:${port}`);
});
