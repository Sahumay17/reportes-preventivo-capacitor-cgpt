import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// In AI Studio preview, Nginx runs on 8080 and proxies to port 3000.
// On Cloud Run or direct Docker deployment, the container must listen on process.env.PORT (typically 8080).
const isDevProxy = Boolean(process.env.DEFAULT_APP_PORT || process.env.NGINX_PORT);
const PORT = isDevProxy
  ? parseInt(process.env.DEFAULT_APP_PORT || '3000', 10)
  : parseInt(process.env.PORT || '8080', 10);
const HOST = '0.0.0.0';
const STATIC_DIR = path.join(__dirname, 'dist', 'pwa');

// Ensure dist/pwa exists and has index.html
if (!fs.existsSync(path.join(STATIC_DIR, 'index.html')) && fs.existsSync(path.join(__dirname, 'index.html'))) {
  try {
    fs.mkdirSync(path.join(STATIC_DIR, 'icons'), { recursive: true });
    const tpl = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
    const head = `<link rel="manifest" href="manifest.webmanifest">
<link rel="icon" href="icons/icon-192.png">
<link rel="apple-touch-icon" href="icons/icon-192.png">
<link rel="stylesheet" href="app.css">
<script src="jspdf.min.js"></script>`;
    const tail = `<script src="app.js"></script>`;
    fs.writeFileSync(path.join(STATIC_DIR, 'index.html'), tpl.replace('{{HEAD}}', head).replace('{{TAIL}}', tail));

    for (const file of ['app.js', 'app.css', 'logo.png', 'manifest.webmanifest', 'sw.js', 'jspdf.min.js']) {
      const srcFile = path.join(__dirname, file);
      if (fs.existsSync(srcFile)) {
        fs.copyFileSync(srcFile, path.join(STATIC_DIR, file));
      }
    }
    for (const icon of ['icon-192.png', 'icon-512.png', 'maskable-512.png']) {
      const srcIcon = path.join(__dirname, icon);
      if (fs.existsSync(srcIcon)) {
        fs.copyFileSync(srcIcon, path.join(STATIC_DIR, 'icons', icon));
      }
    }
  } catch (e) {
    console.warn('Could not auto-generate dist/pwa:', e.message);
  }
}

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
};

const server = http.createServer((req, res) => {
  let reqPath = req.url.split('?')[0];
  if (reqPath === '/' || reqPath === '') {
    reqPath = '/index.html';
  }

  // Health check endpoint for Cloud Run / load balancers
  if (reqPath === '/_health' || reqPath === '/healthz') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('OK');
    return;
  }

  const safePath = path.normalize(reqPath).replace(/^(\.\.[\/\\])+/, '');
  let filePath = path.join(STATIC_DIR, safePath);

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      filePath = path.join(STATIC_DIR, 'index.html');
    }

    fs.readFile(filePath, (readErr, content) => {
      if (readErr) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 Not Found');
        return;
      }

      const ext = path.extname(filePath).toLowerCase();
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';

      res.writeHead(200, {
        'Content-Type': contentType,
        'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=3600',
      });
      res.end(content);
    });
  });
});

server.listen(PORT, HOST, () => {
  console.log(`Server listening on http://${HOST}:${PORT} (mode: ${isDevProxy ? 'dev-proxy' : 'direct'})`);
});
