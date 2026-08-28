# Adversarial first-read review 2 — Android Backup Coverage

**Review date:** 2026-08-28 UTC  
**Live URL:** <https://android-backup-coverage.sociobot.in/>  
**Verdict:** **FAIL**

The actual comparison and sample flow are clear and work. This is still a fail because three public promises have no individual claim entry/test, the offline route misses the required route metadata and shared navigation, and several copy controls do not meet the stated plain-words contract. No registered claim test failed.

## Cold first read

Fresh Chromium contexts visited `/` before scrolling at 390 × 844 and 1440 × 900.

- **What it does:** checks an Android photo/video folder against a backup copy and shows which files matched, changed, or are missing.
- **For whom:** Android owners who copy photos and videos to another backup copy.
- **What to click first:** **Try it with sample data**.

All three answers are available on the first screen. At 390 px the primary action ends within the 844 px viewport and there is no horizontal overflow. The visual treatment is distinct and matches the documented glacial-ceramic direction; it is not a generic SaaS template.

## Findings

### F-2-1 — BLOCKING — Three public promises are not listed and tested as claims

**Locations and exact text:**

1. Landing, reminder control: `Your next check is scheduled after the first result.`
2. README, **Use the app**: `The app does not create a backup.`
3. Terms, **Price and access**: `All checks, saved history, reminders, and exports are available without an account.`

`.factory/claims.json` has no entry for the reminder schedule or the app's no-write boundary. Its `free-access` entry claims only `Free. No account needed.` and its tagged test checks visible inputs, the absence of paid controls, and CSV export; it does not exercise saved history or the reminder control. The old review's UC11 was therefore only partly repaired: the wording was removed from the landing page but remains a public README/Terms promise without the required test.

**Why this fails:** A visitor can rely on all three statements when deciding whether to use the tool. The claims contract requires each such promise to have a specific observable test, rather than relying on nearby tests or an implementation reading.

**Concrete fix:** Add these entries and clean-state browser tests, or remove/narrow the statements.

- `reminder-schedule`: choose both fixture folders, run a check, and assert the visible next-check date is calculated from the selected reminder interval.
- `does-not-back-up`: compare shipped source/destination fixtures and assert the destination fixture bytes are unchanged after the check; also record that the complete flow makes no write/data request.
- `all-free-features`: open saved history, set a reminder, and export JSON and CSV without sign-in, checkout, or a paid control. Alternatively rewrite the Terms sentence to `This release is free and needs no account.`

### F-2-2 — Minor — The offline route lacks required share metadata and the shared header

**Location/evidence:** Fresh live `GET /offline.html` returns 200 with `Offline — Android Backup Coverage`, one h1, description, favicon, and touch icon. It has no canonical link, Open Graph tags, or Twitter tags. Its header contains only the wordmark, unlike the product header that exposes Demo and Privacy.

**Why this matters:** `/offline.html` is a reachable product route and the service-worker fallback a visitor can see. It should retain product context and route metadata just like the other public pages.

**Concrete fix:** Add its canonical URL and the same self-hosted social-card OG/Twitter metadata used by the other static routes. Add the consistent compact navigation (`Home`, `Demo`, `Privacy`) while retaining the visible recovery action.

### F-2-3 — Minor — The demo exit action does not name its result

**Location/quote:** Demo banner button: `Start for real`.

**Why this matters:** It does not say that it discards the demo and opens the real backup-check flow. This fails the result-naming button rule on the most important safety boundary.

**Concrete fix:** Rename it **`Start a real backup check`** and retain the existing behavior: clear the `demo:` state, navigate to `/#verify`, and focus the real check heading.

### F-2-4 — Minor — The landing uses two names for the compared destination

**Location/quote:** The hero says `a second copy`; the checker, demo, README, scope section, and terminology table call it a `backup copy`.

**Why this matters:** A first-time visitor has to decide whether these are different inputs. The documented terminology says the one name is `backup copy`.

**Concrete fix:** Rewrite the hero sentence to: `For Android photo and video backup users who need clear proof that their files reached a backup copy.`

### F-2-5 — Minor — One heading is vague out of context

**Location/quote:** Scope card heading: `Know what the result means`.

**Why this matters:** In a heading list it does not identify what result or what information follows.

**Concrete fix:** Rewrite it as **`How a backup receipt marks each file`**.

### F-2-6 — Minor — Every public page emits an invalid Permissions-Policy warning

**Evidence:** Fresh Chromium loads of `/`, `/demo`, `/privacy/`, and `/terms/` emit this console warning: `Error with Permissions-Policy header: Unrecognized feature: 'ambient-light-sensor'.` The live header contains `ambient-light-sensor=()`.

**Why this matters:** The browser ignores an unsupported directive and reports a console warning on every route. This is not a user-visible app error, but it prevents a clean browser-console result.

**Concrete fix:** Remove `ambient-light-sensor=()` from `Permissions-Policy` (or use a directive supported by the deployed Chromium baseline), then add a header/console assertion covering the public routes.

## Copy audit

Counts are whitespace-separated. Fragments used solely as labels, controls, metrics, file names, route names, commands, URLs, and code examples are excluded. Variable date/count output is represented by its fixed sentence shape.

### Landing page

| Words | Sentence |
|---:|---|
| 7 | Demo — sample data, nothing is saved. |
| 7 | Know every photo and video made it. |
| 22 | For Android photo and video backup users who need clear, local proof that their files actually made it to a second copy. |
| 4 | Preview four sample photos. |
| 3 | Free, no account. |
| 5 | Runs entirely in your browser. |
| 5 | Files stay on your device. |
| 2 | Works offline. |
| 5 | 2 of 4 photos verified. |
| 5 | 1 missing and 1 changed. |
| 11 | Files are compared by relative path and size in this browser. |
| 10 | Choose DCIM, Pictures, or another folder your browser can open. |
| 13 | Choose a backup folder you can open, or import its JSON file list. |
| 9 | A missing file is marked late after this window. |
| 9 | Your next check is scheduled after the first result. |
| 2 | You’re offline. |
| 7 | Saved checks and this demo still work. |
| 14 | Use a backup folder your browser can open, or import its JSON file list. |
| 8 | The app has no account or data server. |
| 9 | It sends no file names, sizes, or check results. |
| 11 | A file is verified when its relative path and size match. |
| 8 | Test a real restore before deleting a copy. |
| 11 | Ceramic illustration generated for this product with the factory image model. |
| 2 | Update available. |
| 6 | That folder could not be read. |
| 8 | Check its browser permission, then choose it again. |
| 6 | That file list is not valid. |
| 10 | Import JSON containing a path and size for each file. |
| 4 | Check reminders are off. |
| 6 | Run a fresh backup check now. |
| 3 | No missing files. |
| 13 | Every phone file has a matching path and size in the backup copy. |
| 5 | No files match this filter. |
| 4 | No saved checks yet. |
| 6 | Choose both folders and compare them. |
| 6 | Demo reset to four sample photos. |
| 6 | Saved checks could not be opened. |
| 10 | You can still make a new check in this tab. |

No landing sentence exceeds 22 words and no banned marketing adjective appears. The destination-term inconsistency, vague heading, and non-result demo action are F-2-3 through F-2-5. `JSON` is defined by the nearby `file list` wording and the import documentation, so it is not flagged as unexplained jargon here.

### README

| Words | Sentence |
|---:|---|
| 7 | Know every photo and video made it. |
| 14 | This local web app is for Android owners who copy photos and videos elsewhere. |
| 8 | Compare a phone folder with a backup copy. |
| 7 | See what matches, changed, or is missing. |
| 6 | Try the isolated sample at `/demo`. |
| 9 | Choose a phone folder, such as DCIM or Pictures. |
| 14 | Choose a backup folder your browser can open, or import its JSON file list. |
| 10 | Choose how long a new file may take to arrive. |
| 8 | Compare both folders and review the backup check. |
| 8 | Export a backup check as JSON or CSV. |
| 9 | A match has the same relative path and file size. |
| 6 | The app does not create a backup. |
| 8 | Test a real restore before deleting files. |
| 5 | Runs entirely in your browser. |
| 5 | Files stay on your device. |
| 11 | The app uses no analytics, tracking, account, payment, or data API. |
| 1 | Free. |
| 3 | No account needed. |
| 11 | The sample demo does not read or change real saved checks. |
| 9 | Demo data uses a separate IndexedDB database named `demo:backup-coverage-local`. |
| 5 | Reset restores four sample files. |
| 7 | Starting for real clears the demo data. |
| 5 | Works offline after the first visit. |
| 10 | Open `/demo` online once, then reload it without a connection. |
| 5 | Requires Node.js 22 or newer. |
| 8 | `npm test` builds the app and runs unit and browser checks. |
| 12 | It covers desktop, 390 px mobile, accessibility, privacy, routing, and offline use. |
| 10 | Every public claim and its command are listed in `.factory/claims.json`. |
| 9 | `npm run build` writes the static release to `dist/`. |
| 12 | Import a list of files, or an object containing `files` or `source`. |
| 9 | Each file needs a relative path and byte size. |
| 6 | Name, modified time, and type are optional. |
| 12 | You can import a JSON backup check as the backup file list. |
| 7 | The Capacitor project uses application ID `in.sociobot.androidbackupcoverage`. |
| 5 | Refresh it after web changes. |
| 5 | This release is a static PWA. |
| 8 | APK signing and publishing belong to a later Android work order. |
| 6 | Never commit a keystore or secret. |
| 5 | Deploy `dist/` as a static site. |
| 15 | `staticwebapp.config.json` defines `/demo`, the real 404 response, security headers, MIME types, and cache rules. |

No README sentence exceeds 22 words. Developer-only terms (`Node.js`, `JSON`, `Capacitor`, `PWA`, `APK`, and `keystore`) are scoped to development, format, Android-wrapper, or deployment sections. The unlisted product boundary sentence is F-2-1.

## Demo, privacy, claims, and routing checks

- Fresh `/demo` and `/?demo=1` both loaded directly into a realistic four-file receipt: 2 verified, 1 missing, 1 changed, and 50% coverage. The persistent banner read `Demo — sample data, nothing is saved` and exposed Reset demo and Start for real.
- Reset restored the sample result. In a fresh context the only demo database was `demo:backup-coverage-local`. After an explicit navigation wait, Start for real returned to `/#verify`; the demo record was cleared and no real-state record was read or changed during the demo test.
- Request capture over the complete demo flow contained same-origin GETs only: document, hashed app CSS/JS, image, and self-hosted fonts. No sample file data was posted. The live site has no runtime third-party request.
- A clean `--no-local` clone at the reviewed commit installed successfully (`npm ci`, 0 vulnerabilities). `npm test` passed 12 Vitest and 38 Playwright tests. `npm run build` passed and wrote `dist/`; initial app JavaScript was 17.43 KB raw / 6.62 KB gzip.
- Every exact command from `.factory/claims.json` passed from that clean clone: `compare-folders`, `complete-receipt`, `receipt-statuses`, `demo-isolation`, `local-only`, `offline-reload`, `destination-inputs`, `path-and-size`, `json-csv-export`, `free-access`, and `network-boundary` (two browser-project passes each).
- Fresh live checks confirmed `/`, `/demo`, `/privacy/`, `/terms/`, and `/offline.html` return 200; an unknown path returns the designed 404 with HTTP 404. Crawled internal links returned 200. `/`, `/demo`, Privacy, Terms, and 404 have a patterned title, one h1, main landmark, description, canonical, favicon/touch icon, OG/Twitter card, and self-hosted social image. The exception is F-2-2.
- The live landing and demo had zero horizontal overflow at 390 px and no JavaScript/page errors. The designed 404 naturally produces the browser's failed-navigation 404 console message. All regular public routes emit the policy warning in F-2-6.

## Earlier findings retest

| Earlier finding | Current result |
|---|---|
| B1 — no one-click isolated demo | Fixed: direct `/demo` and `?demo=1`, sample receipt, persistent banner, reset, exit, and separate namespace all verified. |
| B2 / UC1–UC10, UC12–UC16 — registry absent/unlisted claims | Mostly fixed: the registry and its 11 commands pass. UC11 remains as F-2-1 because the no-backup limitation remains public without a specific entry/test. |
| B3 — dead paid action | Fixed: paid UI and checkout link are absent; free access is visible. |
| B4 — no designed 404 | Fixed: unknown live route is designed and returns HTTP 404. |
| M1 — legal CSP/skeleton issue | Fixed for Privacy and Terms: shared legal stylesheet, header/footer, cross-links, and no CSP style error. |
| M2 — share/device metadata | Fixed for landing, demo, Privacy, Terms, and 404. Offline fallback remains F-2-2. |
| M3 — terminology and unclear copy | Partly fixed. The primary terminology is improved, but F-2-3 through F-2-5 remain. |

## What would make this perfect

Add the three missing claim tests, bring the offline fallback to the same route metadata/navigation standard, remove the unsupported policy directive, and make the three remaining words/heading changes. Then repeat this complete fresh-context and clean-clone review; a pass requires zero findings and zero untested claims.
