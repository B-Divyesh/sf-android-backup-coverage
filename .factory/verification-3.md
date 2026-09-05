# Verify Android backup copies — independent verification 3

## Verdict

**FAIL.** Five findings remain: one high, two medium, and two low. There is one public claim without a declared claim test. All 15 declared claim commands passed.

- Live URL: <https://android-backup-coverage.sociobot.in/>
- Implementation reviewed: `abe2cb29fee2d235a3d281caf4a86875189bc5e5`
- Documentation reviewed: `4b4d543568118fbcee68d84e9e809767152337a7`
- Verified: 2026-09-05 UTC
- Finding count: **5**
- Untested claim count: **1**

The only repository change between the implementation and documentation SHAs is `.factory/handoff.md`. Live `index.html`, app JavaScript, app CSS, legal pages, offline page, and 404 page match a fresh build byte for byte. The service worker differs only in its generated cache name.

## Job, audience, and first action

Fresh 1440 × 900 desktop and 390 × 844 phone contexts were opened without scrolling.

- Job: **Know every photo and video made it.**
- Audience: Android photo and video backup users who need proof that files reached a backup copy.
- First action: **Try it with sample data**.

The action ended at 561 px on desktop and 463 px on phone, inside both first viewports. Both pages had zero horizontal overflow. Screenshots are in `/work/.evidence/android-backup-coverage-verify-3/`.

## Findings

### F-3-1 — High — File import has invisible keyboard focus

The visible **Choose phone files**, **Choose backup files**, and **Import file list** controls are styled `<label>` elements (`index.html:106`, `119`, and `120`). They do not enter the keyboard tab order. Their related file inputs remain tabbable but use the clipped 1 × 1 px `.visually-hidden` style (`index.html:107`, `121`, and `122`).

In a fresh browser, the tab sequence moved from `Choose phone folder` to the clipped `source-files` input, then from `Choose backup folder` through the clipped `destination-files` and `manifest-file` inputs. The focused inputs measured 1 × 1 px with `clip: rect(0px, 0px, 0px, 0px)`, so their otherwise valid 3 px outline could not be seen. The visible labels never received focus.

This fails the keyboard and visible-focus contract and makes the advertised JSON file-list path undiscoverable to a keyboard-only user. Use visible buttons for these file inputs, or expose a visible focus state on the associated control and prove the complete import path by keyboard.

### F-3-2 — Medium — Mobile layout shift exceeds the performance budget

Three cold Lighthouse 12.8.2 mobile runs measured CLS **0.198**, **0.196**, and **0.196**. The required budget is below 0.1. Lighthouse identifies the hero illustration and receipt preview as shifted elements after Fraunces and Atkinson Hyperlegible load.

Performance scores were 90, 90, and 91. LCP was 1.2–1.5 s and total transferred data was 135 KiB, so those budgets pass. Stabilize font metrics or preload the initial font files so the first layout does not move.

### F-3-3 — Medium — Several phone touch targets are smaller than 44 px

At 390 px, the home wordmark measured 165.6 × **36** px. Footer links measured 24 px high, and **Erase local data** measured 104 × **24** px. `src/styles.css:336` explicitly reduces the footer button to a 24 px minimum height.

These controls fail the 44 × 44 px touch-target contract. The erase action is also the main privacy recovery control. Increase their tap areas without changing the visible text size.

### F-3-4 — Low — Privacy page makes an unlisted false deletion claim

Privacy says: **“Starting for real deletes the demo database.”** (`public/privacy/index.html:13`). The implementation calls `clearState(true)`, which clears the `state` object store (`src/main.ts:368–371`; `src/storage.ts:45–51`) but does not call `indexedDB.deleteDatabase`.

Live proof after **Start a real backup check** showed no demo `app` record and no change to a sentinel in the real database, so the safety behavior is good. `indexedDB.databases()` still listed `demo:backup-coverage-local`, making the published sentence false. This sentence is also absent from `.factory/claims.json`, so it accounts for the one untested public claim. Say that the action clears demo data, or delete the database and add a tagged claim test.

### F-3-5 — Low — The 404 page uses a metaphorical label

The designed 404 correctly returns HTTP 404 and has the useful heading **Page not found**. Its eyebrow says **“A gap in the path”** (`public/404.html:11`). That is a metaphorical mood label and violates the supplied plain-words rule. Replace it with direct wording such as **Unknown address**, or remove it.

## Demo and main paths

The live sample itself passed:

- `/demo` and `/?demo=1` opened a persistent **Demo — sample data, nothing is saved** banner.
- The populated receipt showed 50%, four file rows, two verified, one missing, and one changed.
- **Reset demo** restored the four rows and the 24-hour arrival window.
- A sentinel in `backup-coverage-local` remained unchanged after reset and after leaving the demo.
- **Start a real backup check** cleared the demo `app` state and opened `/#verify`.
- The complete sample flow sent same-origin GET requests only, with no sample file data in a request body.

Normal, boundary, invalid, and recovery paths also passed. An empty check kept **Compare both folders** disabled. An invalid JSON file list produced a focused alert. Replacing it with a valid file list cleared the error, produced a 100% two-file receipt, scheduled the reminder, exported two JSON records, and allowed local data to be erased.

## Declared claims

Every exact command in `.factory/claims.json` ran from the fresh clone. Each command passed 12 Vitest checks and its two matching browser-project checks.

| Claim | Result |
|---|---|
| `compare-folders` | PASS |
| `complete-receipt` | PASS |
| `receipt-statuses` | PASS |
| `demo-isolation` | PASS |
| `local-only` | PASS |
| `offline-reload` | PASS |
| `destination-inputs` | PASS |
| `path-and-size` | PASS |
| `json-csv-export` | PASS |
| `free-access` | PASS |
| `reminder-schedule` | PASS |
| `does-not-back-up` | PASS |
| `all-free-features` | PASS |
| `erase-local-data` | PASS |
| `network-boundary` | PASS |

F-3-4 is a separate public claim that is missing from the registry and contradicted by live evidence.

## Clean checkout and build

A fresh GitHub clone at documentation SHA `4b4d543` completed:

```text
npm ci                 PASS — 151 packages, 0 vulnerabilities
npm test               PASS — 12 Vitest and 50 Playwright tests
npm run build          PASS — dist/ produced
npx cap sync android   PASS
```

The build emitted 17.43 KB JavaScript (6.62 KB gzip), 19.73 KB CSS (5.47 KB gzip), and a 56.80 KB hero image. Initial Latin WOFF2 files total 61.39 KB. The Capacitor app ID is `in.sociobot.androidbackupcoverage`, and Android backup is disabled. APK signing and distribution remain a later work order.

## Routes, accessibility, privacy, and offline behavior

- `/`, `/demo`, `/privacy/`, `/terms/`, and `/offline.html` returned 200 with distinct titles, `lang="en"`, one `h1`, one `main`, canonical metadata, and social metadata.
- `/definitely-missing-qa3` returned the designed 404. This expected response is not a defect.
- All internal product links returned 200. The external contact link was not requested because this work order forbids connecting to another product.
- Normal public routes produced zero console errors. The supplied `verify-url.sh` passed with zero browser errors and no missing labels or alt text.
- Axe found zero serious or critical issues on every public route, the 404 page, and dark reduced-motion mode. Axe does not detect F-3-1 or F-3-3.
- Reduced-motion timing was effectively immediate (`0.01ms`). A 720 px viewport used as a desktop 200% zoom equivalent had no horizontal overflow or lost first action.
- After one controlled visit, the phone demo reloaded offline, showed the offline notice, retained the 50% receipt, reset, and compared again.
- A demo reload retained four sample rows. Internal persistence, JSON/CSV export, and the erase path worked.
- Live requests during the complete demo were same-origin GETs only. No analytics, account, payment, or data API request appeared.
- Security headers, manifest MIME type, no-cache shell/service worker, and immutable fingerprinted-asset caching were correct.

## Earlier finding disposition

| Earlier finding | Current disposition |
|---|---|
| Review 1 B1 — no isolated demo | Fixed and live retested, including real-data sentinel. |
| Review 1 B2 — missing claim registry | The 15 declared claims pass. F-3-4 is a newly found unlisted claim. |
| Review 1 B3 — dead paid action | Fixed; no paid action or paid claim remains. |
| Review 1 B4 — no designed 404 | Fixed; live route returns the expected designed HTTP 404. |
| Review 1 M1 — legal CSP and skeleton | Fixed; legal pages have shared structure and no console error. |
| Review 1 M2 — share/device metadata | Fixed on all public routes and fallbacks. |
| Review 1 M3 — unclear terms and headings | Earlier named cases are fixed. F-3-5 is a separate remaining plain-words issue. |
| Review 2 F-2-1 — three untested promises | Fixed; all three exact claim commands pass. |
| Review 2 F-2-2 — offline metadata/navigation | Fixed and live retested. |
| Review 2 F-2-3 — unclear demo exit | Fixed; action is **Start a real backup check**. |
| Review 2 F-2-4 — destination terminology | Fixed; the first screen uses **backup copy**. |
| Review 2 F-2-5 — vague result heading | Fixed; the current heading names the backup receipt. |
| Review 2 F-2-6 — Permissions-Policy warning | Fixed; the unsupported directive is absent and consoles are clean. |
| Verification 1 — clean `npm test` failure | Fixed; the fresh-clone command builds and passes. |
| Verification 1 — cache, CSP, policy, and manifest issues | Fixed in live headers. |
| Verification 2 — APK not verified | Still an accepted later-work-order limit, not a release claim. |

## Evidence

- `/work/.evidence/android-backup-coverage-verify-3/desktop-first-screen.png`
- `/work/.evidence/android-backup-coverage-verify-3/phone-first-screen.png`
- `/work/.evidence/android-backup-coverage-verify-3/phone-demo.png`
- `/work/.evidence/android-backup-coverage-verify-3/phone-demo-offline.png`
- `/work/.evidence/android-backup-coverage-verify-3/verify-url/verify.json`
- `/work/.evidence/android-backup-coverage-verify-3/lighthouse.json`
- `/work/.evidence/android-backup-coverage-verify-3/lighthouse-2.json`
- `/work/.evidence/android-backup-coverage-verify-3/lighthouse-3.json`

## Retest after repair

Repair all five findings, list and test the corrected privacy statement, then repeat the 15 claim commands, keyboard tab sequence, 390 px touch-target measurement, and three cold mobile Lighthouse runs. A pass requires zero findings and zero untested claims.
