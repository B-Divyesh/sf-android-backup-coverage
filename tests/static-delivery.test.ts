import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const deployment = JSON.parse(readFileSync(resolve(process.cwd(), 'public/staticwebapp.config.json'), 'utf8')) as {
  globalHeaders: Record<string, string>;
  routes: Array<{ route: string; headers?: Record<string, string> }>;
  mimeTypes: Record<string, string>;
};

describe('Azure Static Web Apps delivery contract', () => {
  it('sets security headers and the interoperable manifest MIME type', () => {
    const headers = deployment.globalHeaders;
    expect(headers['Content-Security-Policy']).toContain("default-src 'self'");
    expect(headers['Content-Security-Policy']).toContain("frame-ancestors 'none'");
    expect(headers['X-Frame-Options']).toBe('DENY');
    expect(headers['Permissions-Policy']).toContain('camera=()');
    expect(headers['X-Content-Type-Options']).toBe('nosniff');
    expect(deployment.mimeTypes['.webmanifest']).toBe('application/manifest+json');
  });

  it('only gives immutable caching to fingerprinted assets', () => {
    const assetRoute = deployment.routes.find((route) => route.route === '/assets/*');
    const shellRoute = deployment.routes.find((route) => route.route === '/index.html');
    const workerRoute = deployment.routes.find((route) => route.route === '/sw.js');
    expect(assetRoute?.headers?.['Cache-Control']).toBe('public, max-age=31536000, immutable');
    expect(shellRoute?.headers?.['Cache-Control']).toBe('no-cache');
    expect(workerRoute?.headers?.['Cache-Control']).toBe('no-cache');
  });
});
