# Visual thesis — glacial minimal ceramics

## Direction and rationale

Backup coverage is evidence, not movement. The product uses a glacial landscape of matte ceramic plates, ice-blue channels, and small mineral markers: each calm, durable object represents a file accounted for in two places. Fine hairline cracks and one separated marker make a coverage gap legible without alarmist “cyber” imagery. The interface is deliberately quiet and instrument-like, with generous bare space and precise status marks.

## Palette

- `frost-0 #F7F8F5` — warm glacial background, less clinical than pure white.
- `porcelain #FFFFFF` and `porcelain-2 #EFF2EF` — working surfaces and inset wells.
- `ink #172522` — primary copy; 13.4:1 on frost.
- `slate #53635F` — secondary copy; 5.9:1 on frost.
- `fjord #126C72` — primary action and focus; 5.5:1 on frost.
- `ice #CFE9E8` — selected and verified wash, never the only status signal.
- `lichen #287451` — verified text with check icon.
- `ochre #8B5A0A` — waiting/late text with clock icon.
- `clay #A13D32` — missing/error text with explicit labels.
- Dark treatment: `night #111B1A`, `night-surface #192624`, `night-ink #F1F5F1`, and brighter semantic tones. It follows the device preference while preserving the ceramic material through thin highlights instead of shadows.

All status states pair icon, wording, and color. Focus is a 3 px fjord/ice double ring with at least 3:1 contrast.

## Type and spacing

The display face uses **Fraunces**, self-hosted variable WOFF2, for the one product heading and important numbers; its softened, cut-serif shapes echo hand-thrown ceramics. Interface copy uses **Atkinson Hyperlegible Next**, self-hosted WOFF2, for robust small-screen recognition. If either font fails, Georgia and system UI are the respective fallbacks. Body text is 16–18 px at 1.55; tabular results use tabular figures.

Spacing is an 8 px rhythm with 4 px optical adjustments: `4, 8, 12, 16, 24, 32, 48, 72`. Corners are 10 px for controls, 18–28 px for ceramic surfaces. Thin asymmetrical borders and restrained, low shadows create physical depth.

## Interaction grammar

- Primary actions are dark fjord lozenges; secondary actions are porcelain buttons with an ink border.
- Setup is a numbered linear sequence: source, evidence, review. The current step has a blue ceramic inset rather than a generic card grid.
- Coverage is expressed as one large percentage, a segmented mineral bar, and a plain-language receipt. Tables collapse to stacked labeled records at 390 px.
- Selecting a directory immediately shows scanning progress and then a receipt. File contents never leave the device.
- Destructive reset requires a named confirmation; reversible row filtering does not.
- The campaign first screen pairs the ceramic transfer scene with a three-stage path: phone folder, local comparison, and backup receipt.
- A compact receipt preview uses the same percentage, status colors, and ruled metrics as the working checker, so the promise and product remain visually continuous.
- Flow symbols use Lucide's open-source `FolderOpen`, `ScanSearch`, `ReceiptText`, and `ArrowRight` icons. Buttons remain text-led because their labels are already unambiguous.

## Motion policy

Transitions last 180–240 ms and move with transforms only: panels settle upward by 6 px, the coverage marker slides to its measured position, and notices enter from their edge. Text remains fully opaque throughout, so contrast never drops during motion. No decorative loops. With `prefers-reduced-motion: reduce`, transform and smooth-scroll motion are removed and state changes are instant.

The landing introduction reveals once with an 8 px upward settle. The sample coverage bar fills once after entry. Neither animation loops, and reduced-motion collapses both to an immediate state.

## Original asset plan and provenance

The hero uses one generated still-life illustration rather than a generic dashboard mockup. It shows a ceramic phone slab bridging two backup vessels with mineral file tokens; one isolated ochre token quietly explains “a gap found.” Icons, progress marks, and the logo are hand-authored SVG/CSS primitives in the repository.

### Prompt sheet

- **Use case:** stylized-concept
- **Asset:** landing/product hero illustration
- **Subject:** abstract Android phone-shaped ceramic slab, two shallow archive vessels, a trail of small file-like mineral tiles, exactly one separated ochre tile
- **World/materials:** hand-thrown matte porcelain, translucent glacial glass, faint crazing and stone grain, ice shelf studio plinth
- **Composition:** editorial isometric still life, centered with calm negative space, no interface screenshot
- **Light/lens:** diffuse polar daylight, soft long shadows, orthographic 55 mm feeling
- **Palette words:** warm frost, porcelain white, deep fjord teal, pale ice blue, tiny lichen and ochre accents
- **Negative list:** no people, no hands, no text, no letters, no numbers, no logos, no brand marks, no watermark, no cables, no clouds, no generic shield/checkmark, no glossy plastic, no neon gradient

Generated with the factory Azure image model (`factory-image`) on 2026-08-27 using `/opt/fleet/lib/gen-image.sh`. The output is original for this product; generated imagery is disclosed in the footer. Source PNG and prompt sidecar live in `assets/src/`; the optimized WebP in `src/assets/` is emitted with a content fingerprint, making it safe for immutable caching.

The 1200×630 social preview in `public/social-card.webp` is a centered crop of that original generated still life. It was composed locally with ImageMagick on 2026-08-28; no new source imagery or text was added.
