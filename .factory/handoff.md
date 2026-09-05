# Verification 3 handoff — Android Backup Coverage

## Outcome

**FAIL.** Independent verification found five defects and one unlisted public claim. Product code was not changed.

- Implementation reviewed: `abe2cb29fee2d235a3d281caf4a86875189bc5e5`
- Documentation reviewed: `4b4d543568118fbcee68d84e9e809767152337a7`
- Live URL: <https://android-backup-coverage.sociobot.in/>
- Full report: `.factory/verification-3.md`

## Findings to repair

1. File-import labels are not keyboard-focusable, while clipped 1 × 1 px inputs receive invisible focus.
2. Three mobile Lighthouse runs measured CLS 0.196–0.198, above the 0.1 budget.
3. The 36 px home wordmark and 24 px footer actions miss the 44 px touch-target requirement.
4. Privacy says leaving the demo deletes its database, but the app clears only its object store. The sentence is not in the claim registry.
5. The 404 eyebrow **A gap in the path** violates the plain-words rule against metaphorical mood labels.

## Verification completed

- Fresh GitHub clone at `4b4d543`: `npm ci`, `npm test`, `npm run build`, and `npx cap sync android` passed.
- `npm test`: 12 Vitest checks and 50 browser checks passed.
- All 15 exact commands in `.factory/claims.json` passed in both Chromium projects.
- Live desktop and phone checks covered first-screen copy, demo isolation and reset, real-data protection, invalid-input recovery, export, erase, persistence, offline reload, route metadata, 404 behavior, headers, and internal links.
- The worker URL verifier passed. Axe found zero serious or critical issues, including dark and reduced-motion modes.
- Live app assets match the implementation build. The service worker differs only by its generated cache name.
- Lighthouse scores across three cold mobile runs were 90–91 Performance and 100 Accessibility, Best Practices, and SEO. LCP was 1.2–1.5 s; CLS failed at 0.196–0.198.

## Known limit

This remains a static PWA with a synchronized Capacitor Android project. APK signing and distribution belong to a later Android work order.

## Next step

Repair the five findings without weakening the passing demo or claim behavior. Add or correct the privacy claim test, then repeat the verification matrix in `.factory/verification-3.md`.
