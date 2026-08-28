import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('loads the complete checker with no serious accessibility issues', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  await page.goto('/');
  await expect(page.locator('body')).toHaveAttribute('data-ready', 'true');
  await expect(page).toHaveTitle(/Android Backup Coverage/);
  await expect(page.locator('h1')).toHaveCount(1);
  await expect(page.locator('main')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Choose source folder', exact: true })).toBeVisible();
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations.filter((item) => ['serious', 'critical'].includes(item.impact ?? ''))).toEqual([]);
  expect(errors).toEqual([]);
});

test('serves fingerprinted app assets and a versioned service worker', async ({ page }) => {
  await page.goto('/');
  const script = await page.locator('script[type="module"]').getAttribute('src');
  const stylesheet = await page.locator('link[rel="stylesheet"]').getAttribute('href');
  const hero = await page.locator('.hero-figure img').getAttribute('src');
  expect(script).toMatch(/^\/assets\/app-[A-Za-z0-9_-]{8}\.js$/);
  expect(stylesheet).toMatch(/^\/assets\/app-[A-Za-z0-9_-]{8}\.css$/);
  expect(hero).toMatch(/^\/assets\/coverage-ceramic-[A-Za-z0-9_-]{8}\.webp$/);

  const worker = await page.request.get('/sw.js');
  expect(worker.ok()).toBeTruthy();
  expect(await worker.text()).toContain('coverage-');
});

test('keeps the skip link and Pro dialog fully keyboard-operable', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Skip to main content' })).toBeFocused();
  await expect(page.getByRole('link', { name: 'Skip to main content' })).toBeVisible();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/#main$/);

  await page.getByRole('button', { name: 'Pro', exact: true }).focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('#pro-dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator('#pro-dialog')).not.toBeVisible();
  await expect(page.getByRole('button', { name: 'Pro', exact: true })).toBeFocused();
});

test('shows a useful receipt and filters attention items', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('body')).toHaveAttribute('data-ready', 'true');
  await page.getByRole('button', { name: 'Preview a receipt' }).click();
  await expect(page.getByRole('heading', { name: 'Coverage result' })).toBeVisible();
  await expect(page.locator('#coverage-percent')).toHaveText('50%');
  await page.getByRole('button', { name: 'Needs attention' }).click();
  await expect(page.locator('#result-rows tr')).toHaveCount(2);
  await expect(page.getByText('Size changed', { exact: false })).toBeVisible();
  await expect(page.locator('#result-rows .status.late')).toBeVisible();
});

test('compares selected source and destination files end to end', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('body')).toHaveAttribute('data-ready', 'true');
  await page.locator('#source-files').setInputFiles('tests/fixtures/source');
  await page.locator('#destination-files').setInputFiles('tests/fixtures/destination');
  await expect(page.getByRole('button', { name: 'Compare both copies' })).toBeEnabled();
  await page.getByRole('button', { name: 'Compare both copies' }).click();
  await expect(page.locator('#coverage-percent')).toHaveText('50%');
  await expect(page.locator('#metric-verified')).toHaveText('1');
  await expect(page.locator('#metric-waiting')).toHaveText('1');
  await expect(page.locator('#reminder-status')).toContainText('Next check:');
});

test('remains usable after the network goes offline', async ({ page, context }) => {
  await page.goto('/');
  await expect(page.locator('body')).toHaveAttribute('data-ready', 'true');
  await page.waitForFunction(() => navigator.serviceWorker?.controller !== null);
  // Let the controlling worker observe and cache one complete application load.
  await page.reload();
  await expect(page.locator('body')).toHaveAttribute('data-ready', 'true');
  await context.setOffline(true);
  await page.reload();
  await expect(page.locator('body')).toHaveAttribute('data-ready', 'true');
  await page.evaluate(() => {
    Object.defineProperty(navigator, 'onLine', { configurable: true, value: false });
    window.dispatchEvent(new Event('offline'));
  });
  await expect(page.getByText('You’re offline.', { exact: false })).toBeVisible();
  await page.getByRole('button', { name: 'Preview a receipt' }).click();
  await expect(page.locator('#coverage-percent')).toHaveText('50%');
});

test('fits a 390px viewport without horizontal overflow', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(0);
});
