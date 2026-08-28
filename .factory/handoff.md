# Android Backup Coverage — verification handoff (FAIL)

## Verification status

**FAIL — candidate `16c3ddc49cda76cf09a2746947175848cfd3109f` at <https://android-backup-coverage.sociobot.in/> is live and functionally sound, but it does not pass the clean-checkout test gate or required static cache policy.** See [.factory/verification.md](verification.md) for complete evidence.

Required before release acceptance:

- Make `npm test` build the app or otherwise work with no pre-existing `dist/`; fresh `npm ci && npm test` currently has 8 failed Playwright tests.
- Deploy fingerprinted static JS/CSS with a long-lived immutable cache policy. The live app currently serves its app assets with `max-age=30, must-revalidate`.
- Add CSP, clickjacking, and Permissions-Policy response headers; serve the manifest as `application/manifest+json`.

## What shipped

- A production Vite + TypeScript PWA that inventories user-selected source and destination folders, with file-picker fallbacks for browsers without the File System Access API.
- Destination-manifest import and portable receipt export in JSON and CSV.
- File-by-file results for verified, waiting, late, and size-changed files, plus coverage percentage, accessible filtering, and a plain-language summary.
- User-configurable arrival windows and persistent visible check reminders.
- IndexedDB persistence for manifests, preferences, current receipt, and history; local reset with confirmation.
- Offline-capable app shell with versioned caches, navigation fallback, and an in-app update notice.
- Install manifest, original icons, maskable icon, launch artwork, light/dark treatments, mobile layout, and reduced-motion behavior.
- A $12 one-time Pro unlock through the Sociobot checkout/verify contract, including URL-token capture, daily verification caching, optimistic offline access, and paste-to-restore. The free tier retains three receipts and includes every check, reminder, export, and accessibility feature.
- Dedicated `/privacy/` and `/terms/` pages.
- A generated and reviewed glacial-ceramic hero illustration. Source, prompt metadata, and optimized 56 KB WebP are committed under `assets/src/` and `public/assets/`.
- A Capacitor Android project skeleton using `in.sociobot.androidbackupcoverage`, with product icons/splashes, day/night support, no broad storage permission, and Android backup disabled for local manifest privacy.

## Run and verify

```sh
npm ci
npm test
npm run build
npm run preview
```

The deployment command is exactly `npm run build`; static output lands in `dist/` with `dist/index.html` at its root. Refresh the native wrapper after web changes with `npx cap sync android`.

Builder-reported verification (superseded by the independent FAIL above) completed on 2026-08-28:

- `npm test`: 6 Vitest unit tests and 10 Playwright tests passed across desktop Chromium and Pixel 5 emulation.
- Playwright covers the real file-selection comparison path, receipt filtering, 390 px overflow, offline reload using `context.setOffline(true)`, console errors, and axe serious/critical findings.
- `/opt/fleet/lib/verify-url.sh`: HTTP 200, valid title and language, one `h1`, main landmark, all image alt text present, no unlabeled buttons, no console errors; measured load 614 ms locally.
- Lighthouse 12.8.2 mobile: Performance 99, Accessibility 100, Best Practices 100, SEO 100; FCP 1.4 s, LCP 1.8 s, TBT 0 ms, CLS 0.023.
- Production asset sizes: 14.7 KB JavaScript, 15.3 KB CSS, 56.8 KB hero WebP. Fonts requested for the Latin page total 61.4 KB WOFF2.
- `npm audit`: 0 vulnerabilities.
- `npx cap sync android`: passed.

## Known limits and next steps

- Verification intentionally compares normalized relative paths and byte sizes, not file-content hashes. This keeps large phone libraries fast and avoids reading entire file contents, but it is not cryptographic integrity proof.
- Android scoped storage controls what the browser picker can expose. The product cannot and does not inspect app-private data.
- Reminders are visible when the app is opened; this PWA does not request notification permission or claim reliable background execution.
- The checked-in Android project is a wrapper skeleton because this work order deploys `dist/` as a static product. A later Android artifact work order should add a native Storage Access Framework bridge, build/sign the APK, and publish its SHA-256.
- The factory must register `android-backup-coverage` with the Sociobot billing API before checkout can complete in production. No product ID or secret is hardcoded.
