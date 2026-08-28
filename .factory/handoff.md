# Repair handoff — Android Backup Coverage

## Release status

**PASS.** Perfection-loop round 1 is deployed at <https://android-backup-coverage.sociobot.in/>. No blocking finding from `.factory/review-1.md` remains open.

Deployed source commit: `0c61da94c9f1f34cb8508b97b60f2a6220276e27`  
Azure Static Web Apps deployment: `62accaf8-f667-4e57-aef9-f4c728e725ff`  
Default host: `gentle-pebble-0c74de60f.7.azurestaticapps.net`

## What changed

- Rewrote the campaign first screen around “Know every photo and video made it.” It names Android backup users and presents the sample action immediately.
- Added a compact three-step story using Lucide icons: phone folder → local comparison → backup receipt.
- Added an above-the-fold 50% sample receipt with verified, missing, and changed counts, plus a second sample-data action.
- Preserved the glacial ceramic identity and original generated artwork. Added only a derived 1200×630 social card and a 180 px touch icon.
- Added `/demo` and `?demo=1` entry points with a persistent demo banner, reset control, and start-for-real control.
- Isolated demo state in `demo:backup-coverage-local`. Leaving demo mode clears that state and never reads or writes `backup-coverage-local`.
- Added `.factory/claims.json` with eleven tagged, observable browser claim tests.
- Removed the dead checkout, Pro dialog, license requests, caps, and all paid promises. This release is free with no account.
- Added explicit `/demo` routing and an Azure 404 override. Unknown paths now return the designed 404 document with HTTP 404.
- Rebuilt Privacy, Terms, offline, and 404 pages with the shared header/footer, legal cross-links, focus styling, and CSP-safe external CSS.
- Added route titles, descriptions, canonicals, Open Graph and Twitter metadata, social artwork, touch icon, favicon, robots, and sitemap demo entry.
- Standardized user-facing terms around phone folder, backup copy, backup check, backup receipt, verified, missing, and changed.
- Added restrained one-time entrance and progress motion. Reduced-motion mode collapses it to an immediate state.
- Updated the catalog line to: `Verify your Android photos and videos reached a second backup copy.`

## Verification evidence

### Full local suite

From `/work/repo`:

```sh
npm ci
npm test
npm run build
npx cap sync android
```

Results on 2026-08-28 UTC:

- `npm ci`: 151 packages installed; 0 vulnerabilities.
- `npm test`: 12 Vitest unit/static/registry checks and 38 Playwright checks passed.
- Browser matrix: desktop Chromium and Pixel 5 mobile at 390 px.
- Axe: zero serious or critical findings on `/`, `/demo`, `/privacy/`, `/terms/`, and the 404 page.
- Dark mode and reduced-motion checks passed.
- Console/page errors: zero on all public 200 routes.
- Mobile overflow: 0 px on landing and demo.
- Offline: `/demo` reloaded under `context.setOffline(true)`, reset its seed, and recreated the 50% receipt.
- `npm run build`: passed and produced `dist/`.
- Initial JS: 17.43 KB raw / 6.62 KB gzip.
- CSS: 19.75 KB raw / 5.48 KB gzip.
- Hero artwork: 56.80 KB. Social card: 37.11 KB.
- `npx cap sync android`: passed; web assets and Capacitor configuration copied successfully.

### Every claim from a clean clone

A fresh `--no-local` clone of commit `0c61da94c9f1f34cb8508b97b60f2a6220276e27` ran the exact command from every `.factory/claims.json` entry. Each command passed in Chromium and Pixel 5:

- `@claim:compare-folders` — 2 passed
- `@claim:complete-receipt` — 2 passed
- `@claim:receipt-statuses` — 2 passed
- `@claim:demo-isolation` — 2 passed
- `@claim:local-only` — 2 passed
- `@claim:offline-reload` — 2 passed
- `@claim:destination-inputs` — 2 passed
- `@claim:path-and-size` — 2 passed
- `@claim:json-csv-export` — 2 passed
- `@claim:free-access` — 2 passed
- `@claim:network-boundary` — 2 passed

### Performance and structural checks

Lighthouse 12.8.2 against the production build on a local static server:

- Performance: 99
- Accessibility: 100
- Best Practices: 100
- SEO: 100
- FCP: 1.7 s
- LCP: 2.0 s
- TBT: 0 ms
- CLS: 0

`verify-url.sh` returned title, `lang=en`, one h1, a main landmark, zero missing alt attributes, zero unlabeled buttons, and zero console errors. Local measured load time was 601 ms.

### Live deployment

- `/`: 200
- `/demo`: 200
- `/privacy/`: 200
- `/terms/`: 200
- `/no-such-route`: 404
- `/favicon.ico`: 200
- `/social-card.webp`: 200
- Live `/demo`: title `Demo — Android Backup Coverage`, persistent banner visible, 50% result, four rows, 0 px horizontal overflow.
- Live mobile Axe: zero serious or critical findings; console/page errors: zero.
- Live headers include the same-origin CSP, HSTS, nosniff, frame denial, referrer policy, and permissions policy.

Evidence files are in `.factory/evidence/local/` and `.factory/evidence/live/` in the worker workspace.

## Known limits and next steps

There are no known release-blocking gaps.

- Verification compares normalized relative paths and byte sizes, not file-content hashes.
- Browser and Android scoped-storage rules determine which folders a user can open.
- The checked-in Capacitor project remains the required Android skeleton. APK signing and publication belong to a later Android work order.
- The prior paid tier is intentionally absent until a working Sociobot billing product exists.
