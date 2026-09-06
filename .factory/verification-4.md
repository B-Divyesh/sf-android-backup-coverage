# Verify Android backup copies — independent verification 4

## Verdict

**PASS.** The live product and candidate have zero findings of every severity and zero untested public claims.

- Live URL: <https://android-backup-coverage.sociobot.in/>
- Implementation reviewed: `8b1283537f1e3b44d0ab352a4f68c046c9258213`
- Documentation reviewed: `5e05ae35c15cecb523f163cefa30907e9fe72066`
- Verified: 2026-09-06 UTC
- Finding count: **0**
- Untested claim count: **0**

Only `.factory/copy-audit.md`, `.factory/design.md`, and `.factory/handoff.md` changed between the implementation and documentation SHAs. A clean build matched every live product file byte for byte except the service worker's expected generated cache nonce.

## Job, audience, and first action

Fresh 1440 × 900 desktop and 390 × 844 phone contexts opened `/` before scrolling.

- Job: **Know every photo and video made it.**
- Audience: Android photo and video backup users who need proof that files reached a backup copy.
- First action: **Try it with sample data**.

The action ended at 561 px on desktop and 464 px on phone. It was inside both first viewports. Both views had zero horizontal overflow.

## Live product checks

The one-click sample opened a populated backup receipt with the persistent label **Demo — sample data, nothing is saved**. It showed 50% coverage, four named files, two verified files, one missing file, and one changed file. Reload preserved the label and sample result. **Reset demo** restored the 24-hour window and original four-file receipt.

A sentinel placed in the real IndexedDB database remained unchanged through demo entry, reset, and exit. **Start a real backup check** cleared the demo `app` record and opened `/#verify`. The complete demo flow sent only same-origin GET requests and no file data in a request body.

Normal, invalid, boundary, and recovery paths passed:

- An empty check kept **Compare both folders** disabled.
- All three visible file controls opened their chooser with Enter and accepted fixture data.
- An invalid JSON file list produced a focused alert with a recovery instruction.
- A valid file list cleared the alert and produced a 100% two-file receipt.
- History opened with focus in the dialog; Escape closed it and restored focus.
- **Erase local data** cleared selections, the receipt, and saved history after confirmation.
- JSON and CSV exports downloaded with the expected file types.

After one controlled visit, `/demo` reloaded offline, retained the sample receipt and label, showed the offline notice, reset, and compared again at 50%. A changed service worker displayed **Update available**, and **Reload now** returned to a usable app.

## Accessibility, routes, privacy, and links

- `/`, `/demo`, `/privacy/`, `/terms/`, and `/offline.html` returned 200 with their own title, `lang="en"`, one h1, one main landmark, canonical metadata, touch icon, and social metadata.
- The designed unknown route returned the expected HTTP 404, used **Unknown address**, and provided **Go to Backup Coverage**. The browser's failed-navigation message for that deliberate 404 is expected, not a defect.
- All internal links returned 200. The external contact destination was inspected as a link but not requested.
- Axe reported zero violations on every public route, the 404, and dark reduced-motion mode.
- Every visible link, button, and select measured at least 44 × 44 CSS px at 390 px.
- The repaired file buttons measured 48 px high with a visible 3 px solid focus outline. The wordmark and erase action measured 44 px high.
- The first Tab exposed the skip link. Enter moved navigation to `#main`. The demo h1 received focus, and the real-check fragment placed the next Tab on **Choose phone folder**.
- Reduced motion used effectively instant transitions and `scroll-behavior: auto`. Dark mode had no axe violations.
- At 200% text size, the job, actions, navigation, and privacy link remained visible and usable. The layout had only 2 px of scrollable edge rounding and no clipped content.
- Normal routes produced no console or page errors. Runtime requests stayed on the product origin. There were no analytics, account, payment, or data API calls.
- HTTPS redirect, HSTS, CSP, clickjacking protection, permissions policy, `nosniff`, strict referrer policy, manifest MIME type, no-cache HTML/service worker, and immutable hashed-asset caching all passed.

## Declared claims

Every exact command in `.factory/claims.json` ran from a fresh detached checkout at the documentation SHA. Each command passed 12 unit/static checks and its two matching browser-project checks.

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

The landing page, result states, Privacy, Terms, README, demo documentation, and offline copy were cross-checked against the registry. Their product promises map to these 15 claims. No public claim was missing, false, incomplete, or left untested. The arrival-window boundary also passed its unit coverage for waiting versus missing files.

## Clean checkout and build

The documented clean setup used Node 22.23.2.

```text
npm ci                 PASS — 151 packages, 0 vulnerabilities
npm test               PASS — 12 unit/static and 56 browser tests
npm run build           PASS — dist/ produced
npx cap sync android    PASS
```

The build produced 17.69 KB JavaScript (6.65 KB gzip), 18.82 KB CSS (5.16 KB gzip), 61.39 KB of Latin fonts, and a 56.80 KB hero image. These are within the declared static-product budgets.

Three cold live Lighthouse 12.8.2 reports each scored 100 for Performance, Accessibility, Best Practices, and SEO. LCP was 1.503–1.511 seconds, TBT was 0–45 ms, and CLS was 0.000. Chromium printed its known tab-crash message after each complete report was written; the reports contain complete categories, metrics, screenshots, and audit results.

The worker URL verifier passed with a 660 ms network-idle load, zero console errors, a title, language, one h1, main landmark, complete image alt text, and labeled buttons.

## Earlier finding disposition

| Earlier finding | Current disposition |
|---|---|
| Review 1 B1 — no isolated one-click demo | Fixed and live retested: direct demo, persistent label, reset, exit, separate namespace, and real-data sentinel all pass. |
| Review 1 B2 — no claim registry | Fixed: all 15 declared commands pass, and the public-copy cross-check found no unlisted claim. |
| Review 1 B3 — dead paid action | Fixed: no paid control or paid promise remains. The release is plainly free. |
| Review 1 B4 — no designed 404 | Fixed: the designed recovery page returns the expected HTTP 404. |
| Review 1 M1 — legal CSP and missing skeleton | Fixed: legal pages use the shared header/footer and self-hosted CSS with clean consoles. |
| Review 1 M2 — missing share/device metadata | Fixed on the app, legal, offline, and 404 pages. |
| Review 1 M3 — unclear terms and headings | Fixed: **backup copy**, **backup check**, and **backup receipt** are consistent; headings and actions are direct. |
| Review 2 F-2-1 — three untested promises | Fixed: `reminder-schedule`, `does-not-back-up`, and `all-free-features` pass. |
| Review 2 F-2-2 — incomplete offline route | Fixed: metadata, shared navigation, recovery action, and accessibility pass live. |
| Review 2 F-2-3 — unclear demo exit | Fixed: **Start a real backup check** clears demo state and takes keyboard navigation to the real checker. |
| Review 2 F-2-4 — inconsistent destination term | Fixed: the first screen uses **backup copy**. |
| Review 2 F-2-5 — vague result heading | Fixed: **How a backup receipt marks each file** names its content. |
| Review 2 F-2-6 — invalid policy warning | Fixed: the unsupported directive is absent and normal consoles are clean. |
| Verification 1 — clean `npm test` failure | Fixed: the exact command builds first and passes from the clean checkout. |
| Verification 1 — mutable static assets | Fixed: app assets are content-hashed and live with one-year immutable caching. |
| Verification 1 — missing security policy | Fixed: live responses contain the expected CSP, frame, permissions, MIME, and cache headers. |
| Verification 2 — native APK not exercised | Accepted release boundary: this work order ships the PWA and synchronized Capacitor project; signing and distribution remain later work. |
| Verification 3 F-3-1 — invisible keyboard import focus | Fixed: all three visible buttons open with Enter and show a 3 px outline. |
| Verification 3 F-3-2 — mobile CLS above 0.1 | Fixed: all three live Lighthouse runs measured 0.000. |
| Verification 3 F-3-3 — touch targets below 44 px | Fixed: the complete phone route sweep found none below 44 × 44 px. |
| Verification 3 F-3-4 — false, unlisted deletion claim | Fixed: Privacy says demo data is cleared, and `demo-isolation` proves that behavior. |
| Verification 3 F-3-5 — metaphorical 404 label | Fixed: the label is **Unknown address**. |

## Scope and remaining work

This is a static PWA with no backend, tenant state, or live request quota, so backend isolation, restart persistence, health, and 429 checks do not apply. There is no paid feature or AI feature.

APK signing, installed-APK testing, and distribution remain a later Android work order and are not claimed by this release.

## Evidence

- `/work/.evidence/android-backup-coverage-verify-4/live-results.json`
- `/work/.evidence/android-backup-coverage-verify-4/claim-results.tsv`
- `/work/.evidence/android-backup-coverage-verify-4/npm-test.log`
- `/work/.evidence/android-backup-coverage-verify-4/npm-build.log`
- `/work/.evidence/android-backup-coverage-verify-4/cap-sync.log`
- `/work/.evidence/android-backup-coverage-verify-4/verify-url/verify.json`
- `/work/.evidence/android-backup-coverage-verify-4/live-byte-compare.tsv`
- `/work/.evidence/android-backup-coverage-verify-4/lighthouse-1.json`
- `/work/.evidence/android-backup-coverage-verify-4/lighthouse-2.json`
- `/work/.evidence/android-backup-coverage-verify-4/lighthouse-3.json`
- `/work/.evidence/android-backup-coverage-verify-4/desktop-first-screen.png`
- `/work/.evidence/android-backup-coverage-verify-4/phone-first-screen.png`
- `/work/.evidence/android-backup-coverage-verify-4/phone-demo.png`
- `/work/.evidence/android-backup-coverage-verify-4/phone-demo-offline.png`
