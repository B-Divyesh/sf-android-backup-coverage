# Independent verification — FAIL

**Candidate:** `16c3ddc49cda76cf09a2746947175848cfd3109f`  
**URL:** <https://android-backup-coverage.sociobot.in/>  
**Verified:** 2026-08-28 (fresh dependency install, Node 22, Chromium supplied for Playwright)

## Decision

**FAIL.** The deployed product is the tested candidate and the core local comparison flow works, but the repository does not meet the clean-checkout quality gate: `npm test` fails when `dist/` is absent. A production build is an undocumented prerequisite for its browser suite. The live deployment also does not meet the specified immutable static-asset caching policy.

## Blocking defects

### High — clean `npm test` is not self-contained

After `npm ci`, I moved only the generated `dist/` output aside and ran the exact `npm test` script. Vitest passed all 6 tests, but Playwright failed 8 of 10 tests in 43.4 s: all functional desktop/mobile cases timed out waiting for `body[data-ready="true"]`, because `vite preview` returned an empty shell without built assets. The two remaining tests merely checked width and passed on that empty shell.

Running `npm run build` first makes the same script pass: 6 Vitest tests and 10 Playwright tests pass (desktop Chromium and Pixel 5). The fix is to build as part of the e2e/test command or make Playwright's web-server command build before previewing.

### High — live static-asset cache policy is not immutable

Live `GET /assets/app.js` and `/assets/app.css` return `cache-control: public, must-revalidate, max-age=30`. Assets are named `/assets/app.js` and `/assets/app.css`, not content-hashed. This contradicts the required long-lived immutable caching for versioned static assets and the README deployment instruction. It increases repeat-load/update pressure and makes cache behavior dependent on the service worker. Deploy fingerprinted assets with `Cache-Control: public, max-age=31536000, immutable`; keep HTML and `sw.js` short-lived.

## Passing evidence

- `npm ci`: installed 150 packages; audit reported 0 vulnerabilities.
- Exact production build: `npm run build` passed (`tsc --noEmit && vite build`). Output is 14.68 KB JS, 15.32 KB CSS, 56 KB WebP hero; initial JS is well under the 200 KB budget.
- After that build, `npm test` passed: 6 unit tests + 10 Playwright tests. There is no lint script; TypeScript checking is part of the build.
- Independently exercised the live app: disabled state with no evidence, source/destination folder comparison, preview receipt, verified/waiting/late/size-changed results, filtering, JSON export, invalid manifest error, valid-manifest recovery, Pro dialog Escape/focus return, and desktop/390 px layouts. No console or page errors occurred.
- Browser network capture on a no-license first run made requests only to `android-backup-coverage.sociobot.in` (HTML, app JS/CSS, local image and self-hosted fonts). Code inspection confirms the sole optional product API is license verification after a token is present; no analytics/tracking or CDN imports were found.
- Keyboard: the skip link becomes visible on first Tab and reaches `#main`; modal Escape returns focus to `#pro-open`. Designed focus rules are present. `prefers-reduced-motion: reduce` changed scroll behavior to `auto` and transition/animation duration to `0.01ms`.
- axe-core on the live site found zero violations, including zero serious/critical findings, at 1440 px and 390 px. Both checked widths had zero horizontal overflow.
- PWA: the live site registered a controlling service worker; after one online load it reloaded offline with `data-ready=true` and the offline banner visible. A controlled changed-worker test showed the in-app `Update available. Reload now` toast.
- Deployment identity: SHA-256 values match candidate build and live site for `index.html` (`d6743c…0a20c93`), `assets/app.js` (`e9cf57…629e92`), `assets/app.css` (`17b8d0…b730`), and `sw.js` (`3c6c07…0ed0826`).
- Response checks: HTTP redirects to HTTPS; HTML, JS and CSS return 200. HSTS, `nosniff`, and `strict-origin-when-cross-origin` are present. The Chromium manifest parser reported no manifest errors despite the server's `application/octet-stream` manifest MIME type.

## Additional findings / limitations

- **Medium, deployment hardening:** live responses have no `Content-Security-Policy`, `frame-ancestors`/`X-Frame-Options`, or `Permissions-Policy`. Add a restrictive CSP and clickjacking/permissions policies at the static host.
- **Low, deployment correctness:** `/manifest.webmanifest` is served as `application/octet-stream`; Chromium accepts it, but serve `application/manifest+json` for interoperable PWA behavior.
- Lighthouse 12.8.2 generated a report with Performance 99, Accessibility 100, Best Practices 100, SEO 100; FCP 1.4 s, LCP 1.7 s, TBT 40 ms, CLS 0.023. Its process exited non-zero after report generation because the supplied Chromium tab crashed during a screenshot/BFCache artifact, so treat the scores as indicative rather than a clean Lighthouse command pass.
- `npx cap sync android` passed. `./android/gradlew -p android test` could not start because this verifier image has no JDK (`JAVA_HOME` unset; `java`/`javac` absent). The work order deploys the static PWA and no APK was supplied, so native test/APK verification remains unperformed.

## Retest

```sh
npm ci
npm test                 # must pass before a build exists
npm run build
npm test
npm run preview
```

Then verify the live asset cache headers and response policies after deployment.
