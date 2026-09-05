import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const deployment = JSON.parse(readFileSync(resolve(process.cwd(), 'public/staticwebapp.config.json'), 'utf8')) as {
  globalHeaders: Record<string, string>;
  routes: Array<{ route: string; rewrite?: string; headers?: Record<string, string> }>;
  mimeTypes: Record<string, string>;
  responseOverrides: Record<string, { rewrite: string; statusCode: number }>;
};

describe('Azure Static Web Apps delivery contract', () => {
  it('sets security headers and the interoperable manifest MIME type', () => {
    const headers = deployment.globalHeaders;
    expect(headers['Content-Security-Policy']).toContain("default-src 'self'");
    expect(headers['Content-Security-Policy']).toContain("frame-ancestors 'none'");
    expect(headers['Content-Security-Policy']).not.toContain('api.sociobot.in');
    expect(headers['X-Frame-Options']).toBe('DENY');
    expect(headers['Permissions-Policy']).toContain('camera=()');
    expect(headers['Permissions-Policy']).not.toContain('ambient-light-sensor');
    expect(headers['X-Content-Type-Options']).toBe('nosniff');
    expect(deployment.mimeTypes['.webmanifest']).toBe('application/manifest+json');
  });

  it('serves only the declared demo route and returns the designed 404 for unknown paths', () => {
    expect(deployment.routes.find((route) => route.route === '/demo')?.rewrite).toBe('/index.html');
    expect(deployment.responseOverrides['404']).toEqual({ rewrite: '/404.html', statusCode: 404 });
  });

  it('only gives immutable caching to fingerprinted assets', () => {
    const assetRoute = deployment.routes.find((route) => route.route === '/assets/*');
    const shellRoute = deployment.routes.find((route) => route.route === '/index.html');
    const workerRoute = deployment.routes.find((route) => route.route === '/sw.js');
    expect(assetRoute?.headers?.['Cache-Control']).toBe('public, max-age=31536000, immutable');
    expect(shellRoute?.headers?.['Cache-Control']).toBe('no-cache');
    expect(workerRoute?.headers?.['Cache-Control']).toBe('no-cache');
  });

  it('keeps the visual system free of gradients', () => {
    const styles = [
      readFileSync(resolve(process.cwd(), 'src/styles.css'), 'utf8'),
      readFileSync(resolve(process.cwd(), 'public/legal.css'), 'utf8'),
    ].join('\n');
    expect(styles).not.toMatch(/(?:linear|radial|conic)-gradient\(/);
  });
});
