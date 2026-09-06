# Repair 3 handoff — Android Backup Coverage

## Outcome

**PASS.** All five verification-3 defects are repaired, the corrected privacy statement is covered by a declared claim, and the implementation is live.

- Live URL: <https://android-backup-coverage.sociobot.in/>
- Implementation and deployed SHA: `8b1283537f1e3b44d0ab352a4f68c046c9258213`
- Documentation SHA: the final repository HEAD containing this handoff
- Previous failed documentation SHA: `562e42ef6f5c4a19b3894c27f24a74e888580e34`
- Evidence: `/work/.evidence/android-backup-coverage-repair-3/`

## Repairs

1. Replaced styled file-input labels with visible buttons. Each button opens its hidden picker with Enter or Space and keeps the 3 px focus ring visible.
2. Preloaded the three first-screen Latin font files and changed them to `font-display: optional`. A 1.5-second delayed-font browser check records CLS below 0.1.
3. Raised the home wordmark, public navigation, footer actions, and legal-page links to at least 44 × 44 CSS px. A 390 px route sweep measures every visible link, button, and select.
4. Changed Privacy to say that starting a real check clears demo data. The expanded `demo-isolation` claim proves the demo `app` record is gone and the real-data sentinel is unchanged.
5. Replaced the 404 label with **Unknown address**. The designed page still returns the expected HTTP 404 and provides a route home.

## Clean verification

A fresh local clone of the implementation SHA completed the documented setup.

- `npm ci`: 151 packages, 0 vulnerabilities.
- Every one of the 15 exact commands in `.factory/claims.json`: passed in desktop Chromium and the 390 px mobile project.
- `npm test`: 12 unit/static checks and 56 browser checks passed.
- `npm run build`: passed and produced `dist/`.
- `npx cap sync android`: passed.
- Build output: 17.69 KB JavaScript (6.65 KB gzip), 18.82 KB CSS (5.16 KB gzip), 61.39 KB fonts, and 56.80 KB hero image.

Playwright axe found zero serious or critical issues on `/`, `/demo`, `/privacy/`, `/terms/`, `/offline.html`, and the designed 404. The worker URL verifier found no console errors on the normal live page and confirmed its title, language, single h1, main landmark, alt text, and labeled buttons.

## Performance

Three cold local mobile Lighthouse 12.8.2 reports scored 99 Performance and 100 Accessibility, Best Practices, and SEO. Each measured CLS 0.000 and LCP about 2.11 seconds.

Three cold live mobile reports scored 100 in all four categories. Each measured CLS 0.000 and LCP 1.51 seconds. Lighthouse wrote complete JSON reports, then this worker's Chromium printed its known post-collection tab-crash warning; the metrics and artifacts were already complete.

## Live outcome checks

- Phone first action ended at 463 px in an 844 px viewport; desktop ended at 569 px in a 900 px viewport.
- First screen states the job **Know every photo and video made it**, names Android backup users, and offers **Try it with sample data**.
- Keyboard activation of **Choose phone files** selected the two-file fixture; the focused button measured 48 px high with a solid 3 px outline.
- `/demo` showed its persistent sample banner, 50% coverage, four rows, two verified files, one missing file, and one changed file.
- **Reset demo** restored the 24-hour window and all sample results. **Start a real backup check** removed the demo record and preserved the real-data sentinel.
- A fresh offline reload retained the sample receipt, then reset and compared it again at 50%.
- A 390 px sweep found no visible link, button, or select below 44 × 44 px on the app, legal pages, offline page, or 404.
- Normal public routes had no console errors. All internal links returned 200; the designed unknown route returned 404.
- Live HTML, JavaScript, CSS, fonts, and hero image match the deployed implementation build byte for byte.

## Earlier finding disposition

All Review 1, Review 2, Verification 1, and Verification 2 repairs listed in `.factory/verification-3.md` remain passing. This repair adds coverage for the five verification-3 findings without removing prior demo, privacy, export, reminder, offline, routing, or Capacitor behavior.

## Known limits

- This work order ships the static PWA and synchronized Capacitor project. APK signing and distribution remain a later Android work order.
- No paid offer existed in the assigned base, so no billing-offer metadata was created or changed.
