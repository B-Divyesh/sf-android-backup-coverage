# Independent verification 2 — PASS

**Candidate:** `8a1c0e27cee75948f8755042c3074e723464ddc8`  
**Live URL:** <https://android-backup-coverage.sociobot.in/>  
**Verified:** 2026-08-28 from a fresh detached checkout (Node 22.23.2, npm 10.9.8, Playwright Chromium)

## Decision

**PASS.** The candidate meets the researched brief's smallest useful product: it locally compares user-selected source folders against a second folder or imported destination manifest, identifies verified/waiting/late/size-changed coverage, persists local receipts, provides a visible reminder, and exports receipts. It does not claim to create a backup or inspect Android app-private data.

The deployment matches the candidate's application artifacts. SHA-256 values are identical for `index.html` (`ac3efcfc…8803ce3`), app JS (`4addc5a2…7823bb40`), and app CSS (`17b8d01a…ac5b730`). The live service worker differs from a newly built one only in its intentionally per-build cache-version nonce; its otherwise identical code discovers and precaches the matching hashed asset paths.

## Clean checkout and build

- Fresh local clone, detached at the candidate, followed by `npm ci`: 150 packages installed and `npm audit` reported 0 vulnerabilities.
- Exact `npm test` from that clean checkout passed: 8 Vitest tests and 14 Playwright tests across desktop Chromium and Pixel 5 emulation. This includes the test command's own production build before previewing.
- Exact `npm run build` passed TypeScript (`tsc --noEmit`) and Vite. There is no separate lint script in `package.json`.
- Production output: app JS 14.65 KB (5.53 KB gzip), CSS 15.32 KB (4.63 KB gzip), generated WebP 56.80 KB. The initial JS budget (200 KB) and CSS budget (50 KB) pass. Latin WOFF2 files total 61.39 KB, within the 120 KB font budget.
- `npx cap sync android` passed. `./android/gradlew -p android test` could not run because this verifier image has neither `JAVA_HOME` nor `java`; no APK was supplied for this static-PWA deployment.

## Independent end-to-end evidence

On the live deployment at desktop 1440 px and mobile 390 px:

- Preview receipt gave 50% coverage; the attention filter returned the two expected missing/changed rows.
- Real source/destination fixture selection gave 1 verified, 1 waiting, 50% coverage, and scheduled the visible next-check reminder.
- Invalid JSON manifest displayed a recovery message. Replacing it with a valid manifest cleared the error and produced a 100% receipt.
- The first Tab reaches the visible skip link; Enter targets `#main`; the Pro dialog opens with Enter and Escape restores focus to its trigger. Focus is visibly styled.
- At 390 px there is 0 px horizontal overflow and a receipt remains usable.
- `prefers-reduced-motion: reduce` yields `scroll-behavior: auto` and 0.01 ms-equivalent transition/animation durations.
- Browser console and page errors: 0. Axe: 0 violations, including 0 serious/critical, at desktop and 390 px.
- After one online load under a controlling service worker, an offline reload reached `data-ready=true`, showed the offline notice, and could still create a receipt. A controlled changed-worker test against the production build showed the in-app **Update available** toast.

## Privacy, deployment, and response policy

- A clean first run requested only `https://android-backup-coverage.sociobot.in`; there are no runtime CDNs or analytics calls. The optional Sociobot license-verification endpoint is only reached when a license token is present. State uses IndexedDB/localStorage locally and the product provides JSON/CSV export plus local-data erasure.
- HTTPS redirects from HTTP. HTML and `sw.js` use `Cache-Control: no-cache`; fingerprinted JS/CSS use `public, max-age=31536000, immutable`; the manifest is `application/manifest+json`.
- Live responses provide HSTS, CSP restricted to self plus the optional license API, `X-Frame-Options: DENY`, restrictive Permissions-Policy, `X-Content-Type-Options: nosniff`, and strict referrer policy. `/privacy/` and `/terms/` returned 200.
- Lighthouse 12.8.2 emitted a report with Performance 97, Accessibility 100, Best Practices 100, SEO 100; FCP 1.2 s, LCP 1.5 s, TBT 200 ms, CLS 0.023. Its Chromium tab then crashed while gathering final screenshot/BFCache artifacts (`TARGET_CRASHED`), so these scores are report evidence rather than a clean Lighthouse process exit.

## Defects

No release-blocking, high, medium, or low product defects found.

## Retest

```sh
npm ci
npm test
npm run build
npx cap sync android
```

For native APK verification, run `./android/gradlew -p android test` and an APK build in an Android/JDK-enabled worker.
