import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize, resolve } from 'node:path';

const root = resolve(process.cwd(), 'dist');
const port = Number(process.env.PORT || 4173);
const types = {
  '.css': 'text/css; charset=utf-8', '.html': 'text/html; charset=utf-8', '.ico': 'image/x-icon',
  '.js': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8', '.png': 'image/png',
  '.svg': 'image/svg+xml', '.txt': 'text/plain; charset=utf-8', '.webmanifest': 'application/manifest+json',
  '.webp': 'image/webp', '.woff2': 'font/woff2', '.xml': 'application/xml; charset=utf-8',
};

const securityHeaders = {
  'Content-Security-Policy': "default-src 'self'; base-uri 'self'; connect-src 'self'; font-src 'self'; form-action 'self'; frame-ancestors 'none'; img-src 'self' blob:; manifest-src 'self'; object-src 'none'; script-src 'self'; style-src 'self'; style-src-attr 'unsafe-inline'; worker-src 'self'",
  'Permissions-Policy': 'accelerometer=(), camera=(), geolocation=(), gyroscope=(), microphone=(), payment=(), usb=()',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
};

function sendFile(response, file, status = 200) {
  response.writeHead(status, { ...securityHeaders, 'Content-Type': types[extname(file)] || 'application/octet-stream' });
  createReadStream(file).pipe(response);
}

createServer((request, response) => {
  const url = new URL(request.url || '/', 'http://localhost');
  if (!['GET', 'HEAD'].includes(request.method || '')) {
    response.writeHead(405, securityHeaders).end();
    return;
  }
  if (url.pathname === '/' || url.pathname === '/demo' || url.pathname === '/demo/') {
    sendFile(response, join(root, 'index.html'));
    return;
  }
  const clean = normalize(decodeURIComponent(url.pathname)).replace(/^[/\\]+/, '');
  let candidate = resolve(root, clean);
  if (!candidate.startsWith(`${root}/`)) {
    sendFile(response, join(root, '404.html'), 404);
    return;
  }
  if (existsSync(candidate) && statSync(candidate).isDirectory()) candidate = join(candidate, 'index.html');
  if (existsSync(candidate) && statSync(candidate).isFile()) sendFile(response, candidate);
  else sendFile(response, join(root, '404.html'), 404);
}).listen(port, '127.0.0.1', () => process.stdout.write(`Static test server: http://127.0.0.1:${port}\n`));
