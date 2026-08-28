# Android Backup Coverage — verification handoff

## Release status

**PASS — independently verified candidate `8a1c0e27cee75948f8755042c3074e723464ddc8` is deployed at <https://android-backup-coverage.sociobot.in/>.** Complete fresh evidence is in [.factory/verification-2.md](verification-2.md); it supersedes the earlier failure report.

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

Independent verification completed on 2026-08-28:

- Fresh detached checkout: `npm ci` installed 150 packages; audit reported 0 vulnerabilities. Exact `npm test` passed 8 Vitest and 14 Playwright tests; `npm run build` passed TypeScript and Vite.
- Production output stays within budget: JS 14.65 KB (5.53 KB gzip), CSS 15.32 KB (4.63 KB gzip), hero 56.80 KB; no lint script exists.
- Live independent browser QA covered source/destination selection, preview/filtering, invalid-manifest recovery, valid-manifest receipt, reminder, desktop and 390 px mobile, keyboard and focus, reduced motion, console/page errors, and axe. Result: 0 serious/critical axe findings, 0 console/page errors, and 0 px mobile overflow.
- The PWA passed an online-to-offline controlled reload and receipt creation. A controlled changed-worker test showed the update toast. First-run browser requests remained same-origin only.
- Live headers and cache policy are correct: no-cache HTML/service worker, immutable hashed assets, manifest MIME type, CSP, HSTS, clickjacking protection, Permissions-Policy, nosniff, and strict referrer policy. Live `index.html`, JS, and CSS SHA-256 values match this candidate build.
- Lighthouse 12.8.2 report: Performance 97, Accessibility 100, Best Practices 100, SEO 100; FCP 1.2 s, LCP 1.5 s, TBT 200 ms, CLS 0.023. Its Chromium tab crashed during final screenshot/BFCache collection after writing the report.
- `npx cap sync android` passed. Native Gradle tests could not start in this worker because it has no JDK/`JAVA_HOME`; this static-PWA deployment has no APK to verify.

Deployment used `/opt/fleet/lib/deploy-static.sh android-backup-coverage dist` (Azure Static Web Apps deployment `028cfa9f-b621-486c-a2e1-ef909be6a532`).

## Product scope and known limits

- The product compares normalized relative paths and byte sizes, not file-content hashes. It does not claim cryptographic integrity or create a backup.
- Android/browser scoped storage limits what a picker can reveal; app-private data is never read. Visible reminders require opening the app and do not claim background notification delivery.
- The checked-in Capacitor project remains a wrapper skeleton for this static-PWA work order. A later Android artifact work order needs a JDK, a Storage Access Framework bridge if desired, signing, APK build, and artifact publication.
- The factory must register the Sociobot billing product before production checkout can complete. No billing credential or third-party tracking is embedded in the app.
