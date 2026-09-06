# Verify Android backup copies — strict review 3

## Verdict

**PASS.** The live product and implementation have zero findings of every severity and zero untested public claims.

- Live URL: <https://android-backup-coverage.sociobot.in/>
- Implementation reviewed: `8b1283537f1e3b44d0ab352a4f68c046c9258213`
- Documentation baseline reviewed: `110fb043f6e2089e1840a82aca1d6850fc8bfa2d`
- Reviewed: 2026-09-06 UTC
- Finding count: **0**
- Untested claim count: **0**

The commits after the implementation change only factory documentation. A clean build at the documentation baseline matched every deployed product file byte for byte. The service worker differed only in its generated cache nonce after normalization.

The separate work-order path `factory-evidence/android-backup-coverage-verify-4/qa-report.md` was not mounted in this worker. The complete committed report at `.factory/verification-4.md` was read before testing, and this review independently repeated its material checks.

## Job, audience, and first action

Fresh 1440 × 900 desktop and 390 × 844 phone contexts opened the live home page before scrolling.

- Job: **Know every photo and video made it.**
- Audience: Android photo and video backup users who need proof that files reached a backup copy.
- First action: **Try it with sample data**.

The action ended at 562 px on desktop and 464 px on phone. It was inside both first viewports. Neither view had horizontal overflow. The page title names the job: **Android Backup Coverage — verify backup copies**.

## Demo and main paths

The first action opened `/demo` in one click. The page immediately showed the persistent label **Demo — sample data, nothing is saved**, a 50% backup receipt, four named files, two verified files, one missing file, and one changed file.

- Reload kept the demo label and populated receipt.
- **Reset demo** restored the 24-hour window, four rows, and 50% result.
- A sentinel in the real IndexedDB database survived demo entry, reset, and exit unchanged.
- **Start a real backup check** cleared the demo `app` record and opened `/#verify`.
- The full browser session sent only same-origin GET requests and no request body.

Normal, invalid, boundary, and recovery checks passed:

- An empty check kept **Compare both folders** disabled.
- All three visible file controls opened with Enter and accepted the supplied fixtures.
- Invalid JSON focused an alert that explained how to recover.
- A valid file list cleared the alert and produced a 100% two-file receipt.
- JSON and CSV exports downloaded with the expected extensions.
- History moved focus into its dialog; Escape closed it and restored focus.
- Confirmed **Erase local data** cleared selections, the receipt, and saved history.

After one online visit, the phone demo reloaded offline with the label, receipt, and offline notice intact. Reset and comparison still returned the 50% result. The clean browser suite also passed its controlled service-worker update and **Reload now** path.

## Accessibility, routes, privacy, and links

- `/`, `/demo`, `/privacy/`, `/terms/`, and `/offline.html` returned 200 with their own title, `lang="en"`, one h1, one main landmark, canonical metadata, a touch icon, and social metadata.
- A deliberate unknown route returned the expected HTTP 404, used **Unknown address**, and linked back with **Go to Backup Coverage**. Its browser 404 message is expected.
- All same-origin links returned their intended 200 response, apart from the deliberate 404 page itself. The external contact link was identified but not requested.
- Axe reported zero violations on every public route, the 404 page, and dark reduced-motion mode.
- Every visible phone link, button, and select measured at least 44 × 44 CSS px. There was no route overflow.
- The first Tab exposed the skip link. Enter focused `#main`.
- Each file button measured 48 px high with a visible 3 px solid focus outline.
- Reduced motion used effectively instant animation and transition durations with `scroll-behavior: auto`.
- A 720 px layout used as a 200% desktop zoom equivalent retained the h1, navigation, sample action, privacy link, and zero horizontal overflow.
- Normal routes produced no console or page errors. Runtime requests stayed on the product origin.
- HTTP redirected to HTTPS. HSTS, CSP, frame protection, permissions policy, `nosniff`, strict referrer policy, manifest MIME type, no-cache HTML/service worker, and immutable hashed assets all passed.

## Declared claims

Every exact command in `.factory/claims.json` ran from detached clean checkout `110fb043f6e2089e1840a82aca1d6850fc8bfa2d`. Each passed 12 unit/static checks and its two matching desktop/mobile browser checks.

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

The landing page, result states, Privacy, Terms, README, demo documentation, and offline copy were cross-checked against the registry. No public product promise was missing, false, incomplete, or untested. The brief already calls for import/export and destination input; both are present. The product's comparison job does not benefit from adding an AI step.

## Clean checkout and performance

The documented setup used Node 22.23.2.

```text
npm ci                 PASS — 151 packages, 0 vulnerabilities
15 claim commands      PASS — every exact command in .factory/claims.json
npm test               PASS — 12 unit/static and 56 browser tests
npm run build          PASS — dist/ produced
npx cap sync android   PASS
```

The build produced 17.69 KB JavaScript (6.65 KB gzip), 18.82 KB CSS (5.16 KB gzip), 61.39 KB of Latin fonts, and a 56.80 KB hero image. These are inside the product budgets.

A fresh live Lighthouse 12.8.2 run scored 100 for Performance, Accessibility, Best Practices, and SEO. LCP was 1.519 seconds, TBT was 67 ms, CLS was 0.000, and total transfer was 151.46 KB. The worker URL verifier passed in 555 ms with zero console errors and no basic structure, alt-text, or button-label failure.

## Earlier finding disposition

| Earlier finding | Current disposition |
|---|---|
| Review 1 B1 — no isolated one-click demo | Fixed and live retested: direct sample, persistent label, reset, exit, separate namespace, and real-data sentinel pass. |
| Review 1 B2 — no claim registry | Fixed: all 15 commands pass and the public-copy audit found no unlisted product claim. |
| Review 1 B3 — dead paid action | Fixed: no paid control or paid promise remains. The release is free. |
| Review 1 B4 — no designed 404 | Fixed: the designed recovery page returns the expected HTTP 404. |
| Review 1 M1 — legal CSP and missing skeleton | Fixed: legal pages use the shared header/footer and self-hosted CSS with clean consoles. |
| Review 1 M2 — missing share/device metadata | Fixed on the app, legal, offline, and 404 pages. |
| Review 1 M3 — unclear terms and headings | Fixed: **backup copy**, **backup check**, and **backup receipt** are consistent; headings and actions are direct. |
| Review 2 F-2-1 — three untested promises | Fixed: `reminder-schedule`, `does-not-back-up`, and `all-free-features` pass. |
| Review 2 F-2-2 — incomplete offline route | Fixed: metadata, navigation, recovery, and accessibility pass live. |
| Review 2 F-2-3 — unclear demo exit | Fixed: **Start a real backup check** clears demo state and opens the real checker. |
| Review 2 F-2-4 — inconsistent destination term | Fixed: the first screen uses **backup copy**. |
| Review 2 F-2-5 — vague result heading | Fixed: **How a backup receipt marks each file** names its content. |
| Review 2 F-2-6 — invalid policy warning | Fixed: the unsupported directive is absent and normal consoles are clean. |
| Verification 1 — clean `npm test` failure | Fixed: the exact command builds first and passes from the clean checkout. |
| Verification 1 — mutable static assets | Fixed: app assets are content-hashed with one-year immutable caching. |
| Verification 1 — missing security policy and wrong manifest MIME type | Fixed in live response headers. |
| Verification 2 — native APK not exercised | Accepted release boundary: this release is the PWA and synchronized Capacitor project; signing and distribution remain a later Android work order. |
| Verification 3 F-3-1 — invisible keyboard import focus | Fixed: every visible file control opens with Enter and shows a 3 px outline. |
| Verification 3 F-3-2 — mobile CLS above 0.1 | Fixed: the fresh live Lighthouse run measured 0.000. |
| Verification 3 F-3-3 — touch targets below 44 px | Fixed: the full phone route sweep found none below 44 × 44 px. |
| Verification 3 F-3-4 — false, unlisted deletion claim | Fixed: Privacy says demo data is cleared, and `demo-isolation` proves that result. |
| Verification 3 F-3-5 — metaphorical 404 label | Fixed: the label is **Unknown address**. |

## Scope and evidence

This is a static PWA. It has no backend, tenant state, live request quota, paid feature, or runtime AI feature. Backend tenant isolation, restart persistence, health, and 429 checks do not apply.

APK signing, installed-APK testing, and distribution remain the explicitly documented later Android work order. The checked-in Capacitor project synchronized successfully and does not claim that an APK is available.

Evidence:

- `/work/.evidence/android-backup-coverage-review-3/desktop-first-screen.png`
- `/work/.evidence/android-backup-coverage-review-3/phone-first-screen.png`
- `/work/.evidence/android-backup-coverage-review-3/phone-demo.png`
- `/work/.evidence/android-backup-coverage-review-3/phone-demo-offline.png`
- `/work/.evidence/android-backup-coverage-review-3/verify-url/verify.json`
- `/work/.evidence/android-backup-coverage-review-3/lighthouse.json`
