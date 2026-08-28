# Adversarial first-read review 1 — Android Backup Coverage

**Review date:** 2026-08-28 UTC

**Live URL:** <https://android-backup-coverage.sociobot.in/>
**Verdict:** **FAIL**

The product has a clear core comparison UI and a distinctive ceramic visual treatment. It does not provide the mandatory safe, one-click sample-data experience, cannot substantiate its public claims through the required registry, has a broken paid-action link, and has no designed 404. Any one of those defects prevents a pass.

## Cold first read

Fresh Chromium contexts were opened at 390 × 844 and 1440 × 900 before scrolling.

- **What it does:** compares a phone folder with a second copy and shows a receipt of files that arrived, changed, or are missing.
- **Who it is for:** Android photo owners who want evidence that another copy received their files.
- **What to click first:** `Check coverage` starts the real folder-selection flow; `Preview a receipt` shows a non-persistent example.

The core job, audience, and real first action are understandable from the first screen, so this specific first-read test is not a blocker. At 390 px the hero is 870 px tall, but the headline, explanation, and both actions are visible without horizontal overflow. The first screen is visually product-specific rather than a generic SaaS template: it uses the documented ceramic illustration, restrained palette, and instrument-like layout.

The sample action is nevertheless inadequate. The exact label is **`Preview a receipt`**, which does not tell a visitor that they can try the product with sample data and does not enter a safe demo.

## Blocking findings

### B1 — No one-click isolated demo

**Quote/evidence:** The only candidate is `Preview a receipt`. It opens a realistic 50% receipt (`Phone photos → Home NAS`) but the page contains no `Demo — sample data, nothing is saved` banner, `Reset demo`, or `Start for real`. On both `/demo` and `?demo=1`, the ordinary empty checker opens: the receipt is hidden and there is no demo banner. After clicking the preview, a reload removes the receipt, so the preview itself did not persist; this is not a separate demo storage namespace.

**Why this fails first use:** A visitor cannot safely try the actual workflow or know whether sample activity is isolated from their own future records. The primary action instead asks for real folder access before the product has demonstrated its result.

**Concrete fix:** Add a visible first-screen button **`Try it with sample data`** with adjacent helper copy **`See a 50% receipt for four sample photos. Nothing is saved.`**. Make `/demo` and `?demo=1` seed those source and destination records immediately, use a `demo:` IndexedDB/localStorage namespace, and show a persistent banner **`Demo — sample data, nothing is saved`** with **`Reset demo`** and **`Start for real`**. Add an end-to-end test that proves the sample receipt appears on entry, Reset restores the seed, demo keys are separate, and real keys are unchanged.

### B2 — Claims registry is missing; every public promise is untestable by the required contract

**Evidence:** `.factory/claims.json` does not exist in the checkout. Therefore there were zero listed claim commands to run and no `@claim:<id>` tests. `npm ci && npm test` passed (8 Vitest and 14 Playwright tests), but its test names have no claim tags and cannot be mapped to the copy below.

**Why this misleads:** Visitors are asked to rely on privacy, offline, export, comparison, and price promises without a declared reproducible test for any of them. A general regression suite is not evidence for a particular promise.

**Concrete fix:** Add `.factory/claims.json` and one clean-demo tagged observable test per sentence below, or remove the sentence. The test column is the required concrete addition.

| Unlisted claim finding | Exact claim-like sentence | Required test |
|---|---|---|
| UC1 | `Compare a phone folder with any second copy.` | `@claim:compare-folders`: demo receipt identifies seeded matching, changed, and missing paths. |
| UC2 | `Get a plain receipt for what arrived, what changed, and what is still missing—without giving us your files.` | Split into `@claim:receipt-statuses` for visible rows/counts and `@claim:local-only` for whole-demo request interception. |
| UC3 | `File names and manifests stay on this device.` | `@claim:local-only`: intercept all demo requests; allow only same-origin assets and assert no file/manifest request. |
| UC4 | `Files are read only long enough to create a local manifest; contents are never uploaded.` | `@claim:no-upload`: choose demo fixture files while intercepting requests and assert no file-content request/body. |
| UC5 | `Folder checks and saved receipts still work.` | `@claim:offline-reload`: first load `/demo`, set offline, reload, create/reset a sample receipt. |
| UC6 | `License verification will resume later.` | `@claim:license-retry`: mock a queued failed verification, restore network, and assert one retry/result; otherwise remove it. |
| UC7 | `Compare local folders, USB storage, NAS mounts, and portable manifests from the tools you already use.` | `@claim:destination-inputs`: demo tests an importable manifest and every supported picker route; remove unsupported USB/NAS wording. |
| UC8 | `Checks run in your browser.` | `@claim:local-check`: demo request interception plus observable local receipt result. |
| UC9 | `We have no account database and receive no file names, metadata, or manifests.` | `@claim:no-account-or-upload`: same whole-demo network-interception test, documented to permit no data API. |
| UC10 | `This verifies visible files by path and size.` | `@claim:path-and-size`: same path/size is verified; same path/different size is changed. |
| UC11 | `It cannot read app-private data or make a missing backup for you.` | `@claim:limits`: test the supported picker boundary if possible; otherwise retain this limitation only in Terms. |
| UC12 | `Keep unlimited verification history and compare changing folders over time. Current checks, reminders, accessibility, and every export stay free.` | `@claim:free-and-pro-limits`: assert free history cap, paid cap, exports, and reminders. Do not say “unlimited” when the code shows 100. |
| UC13 | `Sociobot/Dodo is the merchant of record and handles refunds. A refunded license is automatically revoked.` | `@claim:refund-revocation`: sandboxed verification response proves a revoked token loses Pro; otherwise move/remove the claim. |
| UC14 | `Android Backup Coverage is a local-first verifier...` / `All folder metadata and receipts are kept in IndexedDB on the device.` (README) | `@claim:local-storage`: clean demo checks the documented local namespace and no remote data request. |
| UC15 | `Continue using saved application code and local checks offline after the PWA has cached one full load.` (README) | `@claim:offline-reload` as above, from `/demo`, not the ordinary preview action. |
| UC16 | `No analytics or runtime CDN is used. License verification is the only product API request and happens only when a license is present.` (README) | `@claim:network-boundary`: intercept a full demo and a license-present run; assert precise allowed origins/requests. |

### B3 — The visible paid action is dead

**Quote/evidence:** Opening `Pro` exposes `Buy Pro securely`, whose destination is `https://api.sociobot.in/api/v1/products/android-backup-coverage/checkout`. A direct request returned **HTTP 404** on 2026-08-28.

**Why this misleads:** The dialog promises a $12 one-time product and presents a purchase action that cannot be completed.

**Concrete fix:** Register/fix the Sociobot billing product, then add a link test that expects the checkout route to return a valid checkout response. Until it exists, remove the purchase action and all paid-tier promises from the live product.

### B4 — Unknown routes return the home page with HTTP 200; there is no designed 404

**Evidence:** `GET /no-such-route` returned **200** with title `Android Backup Coverage — know what reached a second copy` and the landing page, not an error route. There is no checked-in 404 document/route. `/demo` also returns this ordinary landing page rather than demo state.

**Why this loses visitors:** A mistyped or shared bad URL looks valid but silently changes the visitor’s destination. It is also a broken routing requirement.

**Concrete fix:** Add a styled 404 document/route with a plain `Page not found` h1 and a `Go to Backup Coverage` link, configure the host to return HTTP 404 for unknown paths, and test `/no-such-route` for status, title, h1, and recovery link.

## Other findings

### M1 — Privacy and Terms load with CSP console errors and without the standard site skeleton

**Evidence:** Fresh browser loads of `/privacy/` and `/terms/` each emitted: `Applying inline style violates the following Content Security Policy directive 'style-src 'self''`. Both documents put their only stylesheet in an inline `<style>` element. Each has only a back link in its header and no footer, Privacy/Terms cross-links, or `Built by Param Factory` line.

**Why it matters:** The linked legal pages are visibly unstyled under the production security policy and do not preserve the navigation/context a visitor had on the product page.

**Concrete fix:** Move the legal CSS to a self-hosted stylesheet permitted by the CSP (or use a matching CSP hash), then use the same accessible header, skip link, footer, Privacy, Terms, and Param Factory build line as the landing page. Add route-load console-error tests for both pages.

### M2 — Required share and device metadata is incomplete

**Evidence:** The landing page has `lang`, one h1, a 57-character title, a description, canonical URL, SVG favicon, manifest, and theme color. It has **zero** `og:*` tags, no Twitter card tags, and no 180 px `apple-touch-icon` link. `/privacy/` and `/terms/` have route-specific titles, descriptions, canonicals, and one h1.

**Why it matters:** Shared links have no product-specific social card, and iOS home-screen users have no required touch icon.

**Concrete fix:** Add product-specific OG/Twitter title, description, and a real self-hosted 1200×630 ceramic card; add a self-hosted 180 px apple-touch icon; test these tags on every route.

### M3 — Copy uses unexplained terms and shifts the name of the same thing

**Evidence:** The landing calls the target a `second copy`, `backup destination`, `destination folder`, `proof`, `manifest`, and `coverage`; README adds `local-first verifier`, `NAS`, `cloud mount`, `PWA`, and `IndexedDB`. Headings `A coverage layer, not another cloud.`, `Destination-neutral`, and `Private by construction` do not explain their meaning out of context. `Buy Pro securely` adds an unproven security adjective and is not a clean result-naming action.

**Why it matters:** A first-time phone user must infer whether to select the backup folder, a share, or a special export and cannot tell whether “coverage” means a backup service.

**Concrete fix:** Use one term consistently: **backup copy** for the compared destination and **backup check** for the result. Replace the headings with `What this backup check can compare`, `Choose any backup copy you can open`, and `Your file list stays on this device`. Change the paid action to `Buy Pro` after B3 is fixed. Explain `NAS` as `network drive (NAS)` once and move developer-only terms out of user-facing copy.

## Copy audit

Word counts use whitespace-separated words. The landing list covers every sentence-bearing string in the shipped landing document, including offline and dialog text; headings, field labels, and buttons that are fragments are reviewed in M3. README code blocks, headings, URLs, and tableless command lines are excluded.

### Landing page sentences

| Words | Sentence |
|---:|---|
| 5 | Know your photos made it. |
| 8 | Compare a phone folder with any second copy. |
| 18 | Get a plain receipt for what arrived, what changed, and what is still missing—without giving us your files. |
| 8 | File names and manifests stay on this device. |
| 12 | One separated tile is all it takes to break a backup promise. |
| 7 | We compare relative paths and file sizes. |
| 15 | Files are read only long enough to create a local manifest; contents are never uploaded. |
| 12 | Select DCIM, Pictures, or another folder Android allows this browser to read. |
| 14 | Select a mounted destination folder, or import a manifest exported from the backup destination. |
| 9 | Anything still absent after this window is marked late. |
| 9 | Your next check is scheduled after the first receipt. |
| 2 | You’re offline. |
| 7 | Folder checks and saved receipts still work. |
| 5 | License verification will resume later. |
| 16 | Compare local folders, USB storage, NAS mounts, and portable manifests from the tools you already use. |
| 5 | Checks run in your browser. |
| 13 | We have no account database and receive no file names, metadata, or manifests. |
| 8 | This verifies visible files by path and size. |
| 12 | It cannot read app-private data or make a missing backup for you. |
| 6 | Quiet proof for your second copy. |
| 11 | Ceramic illustration generated for this product with the factory image model. |
| 3 | No receipts yet. |
| 8 | Choose both folders and run your first comparison. |
| 6 | Free keeps the latest 3 receipts. |
| 8 | Pro keeps up to 100 on this device. |
| 10 | Keep unlimited verification history and compare changing folders over time. |
| 9 | Current checks, reminders, accessibility, and every export stay free. |
| 9 | Sociobot/Dodo is the merchant of record and handles refunds. |
| 6 | A refunded license is automatically revoked. |
| 2 | Update available. |

No landing sentence exceeds 22 words. The copy flags are jargon/inconsistent terms in M3, unlisted claims in B2, and `Buy Pro securely` as an unsupported adjective/non-result action.

### README sentences and copy items

| Words | Sentence or sentence-like copy item | Flag / proposed rewrite where needed |
|---:|---|---|
| 27 | Android Backup Coverage is a local-first verifier for people who back up phone photos or other folders to a NAS, USB disk, cloud mount, or another tool. | **Over 22; jargon.** `Check whether your Android photos reached your backup copy.` |
| 25 | It compares a user-selected source with a user-selected destination (or portable JSON manifest) and produces a readable receipt of verified, waiting, late, and changed files. | **Over 22; jargon.** `Choose a phone folder and a backup copy. See which files match, changed, or are missing.` |
| 22 | It is intentionally not a backup service: it does not move files, connect to cloud accounts, read app-private storage, or promise recoverability. | Split: `This app checks a backup. It does not create one or connect to cloud accounts.` |
| 11 | A verified item is a matching relative path and file size. | Use `A match has the same path and file size.` |
| 7 | Important data should still be restored periodically. | Keep; useful limit. |
| 10 | Select a browser-readable source folder such as DCIM or Pictures. | `Choose a phone folder, such as DCIM or Pictures.` |
| 13 | Select a mounted destination folder, or import a JSON manifest from the destination. | `Choose your backup folder, or import its file list.` |
| 9 | Choose an expected arrival window and visible reminder interval. | `Choose how long a new file may take to arrive.` |
| 13 | Review and filter a local coverage receipt; export it as JSON or CSV. | `Review the backup check. Export JSON or CSV.` |
| 6 | Keep the latest three receipts free. | **Claim; see UC12.** `Free keeps your latest three checks.` |
| 11 | A $12 one-time Pro license keeps up to 100 local receipts. | **Dead paid path; see B3.** Remove until checkout works. |
| 17 | Continue using saved application code and local checks offline after the PWA has cached one full load. | **Jargon/claim.** `After the first visit, open your saved checks without a connection.` Add UC15 test. |
| 12 | All folder metadata and receipts are kept in IndexedDB on the device. | **Jargon/claim.** `Your file list and checks stay in this browser.` Add UC14 test. |
| 7 | No analytics or runtime CDN is used. | **Jargon/claim.** `This app does not use analytics.` Add UC16 test. |
| 16 | License verification is the only product API request and happens only when a license is present. | **Claim.** Keep only with UC16 test. |
| 3 | Requires Node.js 22+. | Keep in developer documentation. |
| 28 | npm test runs Vitest comparison tests and builds the app before Playwright checks in desktop Chromium and a 390 px Android viewport, including axe accessibility and offline coverage. | **Over 22; developer jargon.** `npm test builds the app and runs unit and browser checks. It checks desktop, 390 px, accessibility, and offline use.` |
| 11 | It therefore passes from a fresh checkout without a pre-existing dist. | `It runs from a fresh checkout.` |
| 19 | npm run build is the deployment command and writes the static site to dist, with dist/index.html at its root. | `npm run build writes the deployable site to dist/.` |
| 5 | Preview the production output with: | Fragment; acceptable developer label. |
| 15 | The importer accepts an array of file records, or an object containing files or source. | `Import a list of files, or an object with files.` |
| 17 | Each item needs a relative path and byte size; name, modified (Unix milliseconds), and type are optional. | `Each file needs its path and size in bytes. The other fields are optional.` |
| 13 | JSON receipts exported by the app can also be imported as destination evidence. | `You can import a JSON check as the backup file list.` |
| 8 | The checked-in Capacitor project uses application ID in.sociobot.androidbackupcoverage. | Keep in Android developer section. |
| 6 | Refresh it after web changes with: | Fragment; acceptable developer label. |
| 24 | The current work order is a static PWA deployment; signing and publishing an APK are intentionally left to the later Android artifact work order. | **Over 22.** `This release is a static PWA. APK signing and publishing are future work.` |
| 8 | No keystore or secret belongs in this repository. | Keep. |
| 17 | Deploy the contents of dist as a static site with the included privacy, terms, and offline.html documents. | `Deploy dist/ as a static site.` |
| 28 | staticwebapp.config.json is included in dist and configures Azure Static Web Apps with long-lived immutable caching for fingerprinted assets, short-lived HTML/service-worker responses, manifest MIME type, and response security policies. | **Over 22; jargon.** `staticwebapp.config.json sets the required host headers and cache rules.` |
| 9 | Do not override those cache rules at the edge. | `Keep these cache rules when deploying.` |

## Verification record

- Clean dependency install: `npm ci` installed 150 packages; audit reported 0 vulnerabilities.
- Quality commands: `npm test` passed **8 Vitest tests and 14 Playwright tests**; `npm run build` passed and created `dist/`. The test suite includes root-page axe checks, but no tagged claim tests.
- Browser checks: fresh desktop and mobile landing loads had zero console errors, one h1, `main`, title, description, canonical, and zero horizontal overflow. First-load network requests were same-origin only. The sample receipt showed 50% coverage and disappeared after reload.
- Offline: the existing repository test reports an online-to-offline controlled reload for the ordinary app. It is not a demo-entry claim test, because the required demo does not exist.
- Link/routing checks: `/`, `/privacy/`, `/terms/`, `/robots.txt`, and `/sitemap.xml` returned 200; the checkout link returned 404; `/no-such-route` returned 200 landing HTML. `favicon.ico` returns 404, although an SVG favicon is linked.
- Structure: titles are correctly patterned and one h1 exists on root/privacy/terms. `robots.txt` and `sitemap.xml` exist. Root has no OG/Twitter metadata or apple-touch icon. Privacy and Terms have CSP style errors and no shared footer.

## Required retest for a pass

1. Visit `/demo` and `?demo=1` in a fresh 390 px context: a seeded receipt must already be visible, along with the persistent demo banner, Reset, and Start-for-real controls.
2. Verify reset and isolation: demo storage is only `demo:` data, no real data is read/written, and demo browsing produces no non-allowed network requests.
3. Run every command in the new `.factory/claims.json` from a clean checkout and record all passes.
4. Confirm checkout returns a valid purchase response or remove the paid UI; crawl all links again.
5. Confirm a mistyped URL returns a designed HTTP 404 and that Privacy/Terms load without CSP errors, with the shared skeleton and complete metadata.
