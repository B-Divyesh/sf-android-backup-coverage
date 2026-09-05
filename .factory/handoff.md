# Repair handoff — Android Backup Coverage

## Outcome

**PASS.** The static PWA is deployed at <https://android-backup-coverage.sociobot.in>.

- Implementation SHA deployed: `abe2cb29fee2d235a3d281caf4a86875189bc5e5`
- Deployment: 2026-09-05 UTC, static deploy completed successfully.
- The later handoff commit is documentation only; it does not change the deployed runtime.

## What changed

- Added outcome-based claims and browser checks for the visible reminder date, the no-backup boundary, all free features, and local-data erasure. The registry now has 15 claims, each with one tagged observable browser test.
- The no-backup check compares shipped folders, proves the chosen backup fixture bytes do not change, and records no write/data request.
- The free-features check opens saved history, changes a reminder, and downloads JSON and CSV without an account, checkout, or paid control.
- Completed the offline fallback: canonical, Open Graph, Twitter metadata, and the shared Home/Demo/Privacy navigation are present.
- Renamed the demo exit action to **Start a real backup check**. It clears demo storage and opens the real check.
- Used `backup copy` consistently in the first screen and renamed the scope heading to **How a backup receipt marks each file**.
- Removed the unsupported `ambient-light-sensor` Permissions-Policy directive. The deployment test now reads the actual local server header and checks public-route console output.
- During cold live testing, found that entrance opacity briefly lowered text contrast. The landing motion is now transform-only, text stays fully opaque, and an immediate-render axe regression test covers it.
- Kept the Terms boundary precise: the app compares folders or file lists the user chooses and does not create a backup.
- Copied the verb-first 68-character catalog description to `/work/.evidence/catalog-description.txt`.

## Current user path

Before scrolling, both a fresh 1440 × 900 desktop page and fresh 390 × 844 phone page state:

- Job: **Know every photo and video made it.**
- Audience: Android photo and video backup users who need proof that files reached a backup copy.
- First action: **Try it with sample data**.

The primary action was visible in both viewports, with zero horizontal overflow.

## Verification

### Clean GitHub clone

A fresh depth-one clone of `main` at `abe2cb29fee2d235a3d281caf4a86875189bc5e5` completed:

```sh
npm ci
npm test
npm run build
npx cap sync android
```

- `npm ci`: passed with 0 reported vulnerabilities.
- `npm test`: 12 Vitest checks and 50 browser checks passed.
- `npm run build`: passed and wrote `dist/`.
- `npx cap sync android`: passed.
- `/opt/fleet/lib/verify-url.sh https://android-backup-coverage.sociobot.in <evidence-dir>` passed: HTTPS 200, title, `lang="en"`, one `h1`, `main`, image alt text, button labels, and zero browser errors.
- Every exact command in `.factory/claims.json` passed in both Chromium projects:
  `compare-folders`, `complete-receipt`, `receipt-statuses`, `demo-isolation`,
  `local-only`, `offline-reload`, `destination-inputs`, `path-and-size`,
  `json-csv-export`, `free-access`, `reminder-schedule`, `does-not-back-up`,
  `all-free-features`, `erase-local-data`, and `network-boundary`.

### Build and performance

- App JavaScript: 17.43 KB raw / 6.62 KB gzip.
- CSS: 19.73 KB raw / 5.47 KB gzip.
- Hero image: 56.80 KB.
- Initial Latin WOFF2 requests total 61.39 KB.
- Current live mobile Lighthouse: Performance 100, Accessibility 100, Best Practices 100, SEO 100. FCP 1.2 s, LCP 1.5 s, TBT 0 ms, CLS 0.05.

### Cold HTTPS checks

- `/`, `/demo`, `/privacy/`, `/terms/`, and `/offline.html` returned 200 with their route titles, one `h1`, `main`, canonical, Open Graph, and Twitter metadata.
- A missing route returned the designed **Page not found** page with HTTP 404. This expected 404 was not treated as an error.
- Crawled internal links all returned 200.
- Fresh desktop and phone browser contexts had zero console errors, zero axe serious/critical findings, and zero horizontal overflow.
- The live demo opened directly at 50% with four file rows and the persistent sample label. **Reset demo** restored that result. A sentinel in real IndexedDB stayed unchanged, and demo state was empty after **Start a real backup check**.
- After a controlled first load, the live phone demo reloaded offline with the 50% receipt and offline notice visible.
- Live header checks show the supported Permissions-Policy without `ambient-light-sensor`.
- Fingerprinted JS and CSS have `public, max-age=31536000, immutable`; `sw.js` and the manifest have `no-cache`.
- SHA-256 checks matched the deployed `index.html`, hashed app JS, hashed CSS, `sw.js`, and `offline.html` to the local `abe2cb2` build.

## Earlier finding disposition

| Finding | Status |
|---|---|
| Review 1 B1 sample sandbox | Fixed and cold-live retested. |
| Review 1 B2 / unlisted claims | Fixed; registry expanded to 15 exact claim commands. |
| Review 1 B3 dead paid action | Fixed; the product is free with no paid controls. |
| Review 1 B4 designed 404 | Fixed and live HTTP 404 verified. |
| Review 1 M1 legal-page skeleton | Remains fixed. |
| Review 1 M2 route/share metadata | Fixed for the remaining offline fallback. |
| Review 1 M3 wording | Fixed by the consistent destination term, clear heading, and result-naming demo exit. |
| Review 2 F-2-1 through F-2-6 | All fixed and covered by the checks above. |

## Known limits and next steps

- This is the authorized static-PWA release. The Capacitor project syncs, but no signed APK was built or published; Android artifact signing and distribution remain a later Android work order.
- The app compares user-selected browser-accessible folders or imported JSON file lists. It deliberately does not create backups, connect to cloud accounts, or inspect app-private Android data.
- A live update notification needs a future deployment to appear naturally. The waiting-worker notification and reload path are covered by a controlled browser test.
