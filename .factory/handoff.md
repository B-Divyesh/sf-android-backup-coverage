# Android Backup Coverage — repair handoff

## Release status

**PASS — repair commit `124d11f` is pushed to `main` and deployed to <https://android-backup-coverage.sociobot.in/>.** It repairs every release blocker in the independent report for candidate `16c3ddc49cda76cf09a2746947175848cfd3109f`.

## What changed

- `npm test` is self-contained: Playwright builds before starting `vite preview`, so a fresh checkout does not need a pre-existing `dist/` directory.
- Vite emits content-fingerprinted app JavaScript, CSS, and hero artwork. The generated service worker carries a per-build cache version, discovers emitted asset paths from the built HTML, and preserves offline/update behavior.
- `public/staticwebapp.config.json` is the Azure Static Web Apps deployment contract: fingerprinted `/assets/*` receive `Cache-Control: public, max-age=31536000, immutable`; HTML and `sw.js` receive `no-cache`; the manifest is `application/manifest+json`.
- The deployment contract supplies same-origin CSP (including the optional Sociobot license-verification endpoint), `frame-ancestors 'none'`, `X-Frame-Options: DENY`, Permissions-Policy, nosniff, and strict referrer policy.
- Regression coverage checks the static-host policy contract, emitted hashed JS/CSS/image URLs, service-worker output, and keyboard skip-link/Pro-dialog behavior. Existing comparison, mobile, offline, console, and axe checks remain.

## Run and verify

```sh
npm ci
npm test
npm run build
npx cap sync android
```

Completed on 2026-08-28:

- Fresh `npm ci`: 150 packages installed; `npm audit` reported 0 vulnerabilities.
- With `dist/` deliberately moved aside, `npm test` passed: 8 Vitest tests and 14 Playwright tests (desktop Chromium and Pixel 5 / 390 px). This directly closes the clean-checkout blocker.
- `npm run build` passed TypeScript checking and produced `dist/`: app JS 14.65 KB, CSS 15.32 KB, and the fingerprinted WebP hero 56.80 KB. Initial JS remains below the 200 KB budget.
- `npx cap sync android` passed. `./android/gradlew -p android test` cannot run in this static-worker image because no JDK/`JAVA_HOME` is installed; no APK is in scope for this static deployment.
- Local Playwright covers source/destination comparison, filtering, 390 px overflow, service-worker-controlled offline reload, keyboard skip link and Escape/focus return from Pro, and axe serious/critical findings.
- Live post-deploy check (`/opt/fleet/lib/verify-url.sh`) returned HTTP 200 in 697 ms with title, `lang`, one `h1`, `main`, image alt text, labelled buttons, and no browser errors.
- Live Playwright/axe at 1440 px and 390 px: 0 serious/critical violations, 0 px horizontal overflow, no console/page errors; after one online load, offline reload reached `data-ready=true` and showed the offline notice. First-load requests were only to `https://android-backup-coverage.sociobot.in`.
- Live headers confirm `no-cache` on HTML and `sw.js`, immutable one-year caching on `/assets/app-DgoAUnXe.js`, `application/manifest+json` for `/manifest.webmanifest`, plus CSP, `X-Frame-Options: DENY`, Permissions-Policy, nosniff, and strict referrer policy.
- Live artifact identities match `dist/`: `index.html` `ac3efcfc…8803ce3`, app JS `4addc5a2…7823bb40`, app CSS `17b8d01a…ac5b730`, and `sw.js` `8b5a31b8…8305e9cbf`.
- Lighthouse 12.8.2 report: Performance 100, Accessibility 100, Best Practices 100, SEO 100; FCP 1.2 s, LCP 1.5 s, TBT 10 ms, CLS 0.023. The JSON report was written successfully, then the supplied Chromium tab emitted a screenshot/BFCache crash during final teardown; treat the scores as report evidence rather than a fully clean Lighthouse process exit.

Deployment used `/opt/fleet/lib/deploy-static.sh android-backup-coverage dist` (Azure Static Web Apps deployment `028cfa9f-b621-486c-a2e1-ef909be6a532`).

## Product scope and known limits

- The product compares normalized relative paths and byte sizes, not file-content hashes. It does not claim cryptographic integrity or create a backup.
- Android/browser scoped storage limits what a picker can reveal; app-private data is never read. Visible reminders require opening the app and do not claim background notification delivery.
- The checked-in Capacitor project remains a wrapper skeleton for this static-PWA work order. A later Android artifact work order needs a JDK, a Storage Access Framework bridge if desired, signing, APK build, and artifact publication.
- The factory must register the Sociobot billing product before production checkout can complete. No billing credential or third-party tracking is embedded in the app.
