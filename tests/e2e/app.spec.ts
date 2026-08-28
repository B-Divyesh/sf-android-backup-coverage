import { readFile } from 'node:fs/promises';
import { expect, test, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

async function openDemo(page: Page, path = '/demo') {
  await page.goto(path);
  await expect(page.locator('body')).toHaveAttribute('data-ready', 'true');
  await expect(page.getByText('Demo — sample data, nothing is saved', { exact: true })).toBeVisible();
  await expect(page.locator('#coverage-percent')).toHaveText('50%');
}

test('loads the checker with clear first-screen wording and keyboard access', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('body')).toHaveAttribute('data-ready', 'true');
  await expect(page).toHaveTitle('Android Backup Coverage — know every file made it');
  await expect(page.locator('h1')).toHaveCount(1);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Know every photo and video made it.');
  await expect(page.locator('#load-example')).toBeVisible();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Skip to main content' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/#main$/);
});

test('shows the three-step story and sample result without desktop scrolling', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  await expect(page.getByText('Phone folder', { exact: true })).toBeVisible();
  await expect(page.getByText('Local comparison', { exact: true })).toBeVisible();
  await expect(page.locator('.flow-strip').getByText('Backup receipt', { exact: true })).toBeVisible();
  await expect(page.getByText('2 of 4 photos verified. 1 missing and 1 changed.')).toBeVisible();
  const cta = await page.locator('.story-cta').boundingBox();
  expect(cta).not.toBeNull();
  expect(cta!.y + cta!.height).toBeLessThanOrEqual(900);
});

test('serves fingerprinted assets and a versioned service worker', async ({ page }) => {
  await page.goto('/');
  expect(await page.locator('script[type="module"]').getAttribute('src')).toMatch(/^\/assets\/app-[A-Za-z0-9_-]{8}\.js$/);
  expect(await page.locator('link[rel="stylesheet"]').getAttribute('href')).toMatch(/^\/assets\/app-[A-Za-z0-9_-]{8}\.css$/);
  expect(await page.locator('.hero-figure img').getAttribute('src')).toMatch(/^\/assets\/coverage-ceramic-[A-Za-z0-9_-]{8}\.webp$/);
  const worker = await page.request.get('/sw.js');
  expect(worker.ok()).toBeTruthy();
  expect(await worker.text()).toContain('coverage-');
});

test('uses complete route metadata and returns a designed HTTP 404', async ({ page }) => {
  for (const route of ['/', '/demo', '/privacy/', '/terms/']) {
    const response = await page.goto(route);
    expect(response?.status()).toBe(200);
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page.locator('main')).toHaveCount(1);
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('link[rel="canonical"]')).toHaveCount(1);
    await expect(page.locator('link[rel="apple-touch-icon"]')).toHaveCount(1);
    await expect(page.locator('meta[property="og:title"]')).toHaveCount(1);
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', /social-card\.webp$/);
    await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute('content', 'summary_large_image');
  }
  const missing = await page.goto('/no-such-route');
  expect(missing?.status()).toBe(404);
  await expect(page).toHaveTitle('Page not found — Android Backup Coverage');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Page not found');
  await expect(page.getByRole('link', { name: 'Go to Backup Coverage' })).toHaveAttribute('href', '/');
});

test('loads every public route without console or serious accessibility errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  for (const route of ['/', '/demo', '/privacy/', '/terms/']) {
    await page.goto(route);
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations.filter((item) => ['serious', 'critical'].includes(item.impact ?? '')), route).toEqual([]);
  }
  expect(errors).toEqual([]);
  await page.goto('/no-such-route');
  const missingResults = await new AxeBuilder({ page }).analyze();
  expect(missingResults.violations.filter((item) => ['serious', 'critical'].includes(item.impact ?? ''))).toEqual([]);
});

test('keeps dialog focus and controls keyboard-operable', async ({ page }) => {
  await page.goto('/');
  const trigger = page.getByRole('button', { name: 'History' });
  await trigger.focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('#history-dialog')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Close saved checks' })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(page.locator('#history-dialog')).not.toBeVisible();
  await expect(trigger).toBeFocused();
});

test('fits the first screen and full page at a 390px viewport', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const cta = await page.locator('#load-example').boundingBox();
  expect(cta).not.toBeNull();
  expect(cta!.y + cta!.height).toBeLessThanOrEqual(844);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(0);
  await openDemo(page);
  const demoOverflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(demoOverflow).toBeLessThanOrEqual(0);
});

test('@claim:compare-folders compares the seeded phone folder with its backup copy', async ({ page }) => {
  await openDemo(page);
  await expect(page.locator('#source-selection')).toContainText('Phone photos · 4 files ready');
  await expect(page.locator('#destination-selection')).toContainText('Backup copy · 3 files ready');
  await expect(page.locator('#result-rows tr')).toHaveCount(4);
});

test('@claim:complete-receipt accounts for every selected sample file in the receipt', async ({ page }) => {
  await openDemo(page);
  await expect(page.locator('#result-rows tr')).toHaveCount(4);
  const metricTotal = await page.locator('.metric-row dd').allTextContents();
  expect(metricTotal.map(Number).reduce((total, count) => total + count, 0)).toBe(4);
  await expect(page.locator('#result-rows tr').filter({ hasText: 'IMG_4821.jpg' })).toHaveCount(1);
  await expect(page.locator('#result-rows tr').filter({ hasText: 'IMG_4820.jpg' })).toHaveCount(1);
  await expect(page.locator('#result-rows tr').filter({ hasText: 'Screenshot_104.png' })).toHaveCount(1);
  await expect(page.locator('#result-rows tr').filter({ hasText: 'IMG_4819.jpg' })).toHaveCount(1);
});

test('@claim:receipt-statuses shows matching, changed, and missing sample paths', async ({ page }) => {
  await openDemo(page, '/?demo=1');
  await expect(page).toHaveTitle('Demo — Android Backup Coverage');
  await expect(page.locator('#metric-verified')).toHaveText('2');
  await expect(page.locator('#metric-waiting')).toHaveText('0');
  await expect(page.locator('#metric-late')).toHaveText('1');
  await expect(page.locator('#metric-changed')).toHaveText('1');
  await expect(page.getByText('Screenshot_104.png', { exact: true })).toBeVisible();
  await expect(page.getByText('IMG_4819.jpg', { exact: true })).toBeVisible();
});

test('@claim:demo-isolation keeps demo storage separate, resets it, and discards it on exit', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('body')).toHaveAttribute('data-ready', 'true');
  await page.evaluate(async () => {
    const database = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open('backup-coverage-local', 1);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    await new Promise<void>((resolve, reject) => {
      const transaction = database.transaction('state', 'readwrite');
      transaction.objectStore('state').put({ marker: 'real-check' }, 'sentinel');
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  });
  await openDemo(page);
  await expect(page.locator('body')).toHaveAttribute('data-storage-namespace', 'demo:backup-coverage-local');
  await page.locator('#arrival-window').selectOption('168');
  await page.getByRole('button', { name: 'Reset demo' }).click();
  await expect(page.locator('#arrival-window')).toHaveValue('24');
  await expect(page.locator('#result-rows tr')).toHaveCount(4);
  const realMarker = await page.evaluate(async () => {
    const database = await new Promise<IDBDatabase>((resolve) => {
      const request = indexedDB.open('backup-coverage-local', 1);
      request.onsuccess = () => resolve(request.result);
    });
    return await new Promise<string | undefined>((resolve) => {
      const request = database.transaction('state').objectStore('state').get('sentinel');
      request.onsuccess = () => resolve((request.result as { marker?: string })?.marker);
    });
  });
  expect(realMarker).toBe('real-check');
  await page.getByRole('link', { name: 'Start for real' }).click();
  await expect(page).toHaveURL(/\/#verify$/);
  const demoState = await page.evaluate(async () => {
    const database = await new Promise<IDBDatabase>((resolve) => {
      const request = indexedDB.open('demo:backup-coverage-local', 1);
      request.onsuccess = () => resolve(request.result);
    });
    return await new Promise((resolve) => {
      const request = database.transaction('state').objectStore('state').get('app');
      request.onsuccess = () => resolve(request.result ?? null);
    });
  });
  expect(demoState).toBeNull();
});

test('@claim:local-only sends no sample file data away from the device', async ({ page }) => {
  const requests: { url: string; method: string; body: string | null }[] = [];
  page.on('request', (request) => requests.push({ url: request.url(), method: request.method(), body: request.postData() }));
  await openDemo(page);
  await page.getByRole('button', { name: 'Compare both folders' }).click();
  await expect(page.locator('#coverage-percent')).toHaveText('50%');
  expect(requests.every((request) => new URL(request.url).origin === 'http://127.0.0.1:4173')).toBeTruthy();
  expect(requests.every((request) => request.method === 'GET')).toBeTruthy();
  expect(requests.map((request) => request.body ?? '').join('')).not.toContain('IMG_4821.jpg');
});

test('@claim:offline-reload reloads and resets the sample check offline', async ({ page, context }) => {
  await openDemo(page);
  await page.waitForFunction(() => navigator.serviceWorker?.controller !== null);
  await page.reload();
  await expect(page.locator('body')).toHaveAttribute('data-ready', 'true');
  await context.setOffline(true);
  await page.reload();
  await expect(page.locator('body')).toHaveAttribute('data-ready', 'true');
  await expect(page.locator('#coverage-percent')).toHaveText('50%');
  await page.getByRole('button', { name: 'Reset demo' }).click();
  await page.getByRole('button', { name: 'Compare both folders' }).click();
  await expect(page.locator('#coverage-percent')).toHaveText('50%');
});

test('@claim:destination-inputs accepts both a backup folder and a JSON file list', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('body')).toHaveAttribute('data-ready', 'true');
  await page.locator('#source-files').setInputFiles('tests/fixtures/source');
  await page.locator('#destination-files').setInputFiles('tests/fixtures/destination');
  await expect(page.locator('#destination-selection')).toContainText('destination · 1 file ready');
  await page.locator('#manifest-file').setInputFiles('tests/fixtures/backup-list.json');
  await expect(page.locator('#destination-selection')).toContainText('backup-list.json · 2 files ready');
  await expect(page.getByRole('button', { name: 'Compare both folders' })).toBeEnabled();
});

test('@claim:path-and-size distinguishes equal sizes from a changed size at the same path', async ({ page }) => {
  await openDemo(page);
  const matched = page.locator('#result-rows tr').filter({ hasText: 'IMG_4821.jpg' });
  const changed = page.locator('#result-rows tr').filter({ hasText: 'Screenshot_104.png' });
  await expect(matched).toContainText('Verified');
  await expect(changed).toContainText('Size changed');
  await expect(matched).toContainText('DCIM/Camera/IMG_4821.jpg');
  await expect(changed).toContainText('Pictures/Screenshots/Screenshot_104.png');
});

test('@claim:json-csv-export exports all four sample records in both formats', async ({ page }) => {
  await openDemo(page);
  const [csvDownload] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: 'Export CSV' }).click()]);
  const csv = await readFile(await csvDownload.path() as string, 'utf8');
  expect(csv.split('\n')).toHaveLength(5);
  expect(csv).toMatch(/^path,size,modified,status/);
  expect(csv).toContain('IMG_4821.jpg');
  const [jsonDownload] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: 'Export JSON' }).click()]);
  const json = JSON.parse(await readFile(await jsonDownload.path() as string, 'utf8')) as { schema: number; files: unknown[] };
  expect(json.schema).toBe(1);
  expect(json.files).toHaveLength(4);
});

test('@claim:free-access exposes complete checks without account, checkout, or paid controls', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('button', { name: 'Choose phone folder', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Choose backup folder', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: /sign in|buy|pro/i })).toHaveCount(0);
  await openDemo(page);
  await expect(page.getByRole('button', { name: 'Export CSV' })).toBeVisible();
});

test('@claim:network-boundary keeps product, demo, legal, reset, and export requests same-origin', async ({ page }) => {
  const origins = new Set<string>();
  page.on('request', (request) => origins.add(new URL(request.url()).origin));
  await openDemo(page);
  await page.getByRole('button', { name: 'Reset demo' }).click();
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export JSON' }).click();
  await download;
  await page.goto('/privacy/');
  await page.goto('/terms/');
  expect([...origins]).toEqual(['http://127.0.0.1:4173']);
});
