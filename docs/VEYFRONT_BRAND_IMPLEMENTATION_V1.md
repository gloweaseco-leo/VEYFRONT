# VEYFRONT Website Brand Implementation V1.0 — engineering review

**Date:** 2026-10-30
**Source:** `gloweaseco-leo/VEYFRONT/main` at `15465aa299308973f52f25ddb5c5d31b8602d403` (snapshot from `chatgpters6/L2M-Web2/stage-3-visual-final`, `25ca2ef`).
**Work branch:** `feature/veyfront-brand-v1`.

## Design freeze preserved

- Editorial Product / Interactive Product design direction; no replacement of the original eight home sections.
- Brand palette: #17262D, #F7F7F2, #B8F06B, #D9E5E4.
- Existing Before/After state, product-page demo, visual evidence sections, desktop/mobile device toggles.
- Hartwell remains a fictional, hand-crafted demo, not an authorized customer case or AI-generation output.

## Implemented on this branch

1. VEYFRONT external wordmark placeholder, bilingual brand messaging, header, footer and route metadata.
2. Two prominent Launch/Rebuild actions on homepage Hero and Invitation, plus /services service hierarchy and future Grow positioning.
3. /start/launch local-only brief with copy-to-clipboard; /start/rebuild URL-format-only flow. No backend or data transmission.
4. Design primitives (Frontier Lines / Open Frame / Evidence layout) with reserved official SVG paths. No imitation of the approved Open V.
5. Clarifies compatible deployment, third-party dependencies and excluded complex requirements; demo estimator displays a dash when out-of-scope complexity is selected.
6. Pinned remote demo image fallback from the public source until the user-uploaded PNG is actually committed.

## Verification not yet completed

- Build/TypeScript/CI and full interactive browser QA must be run against the final branch commit.
- Confirm EN/ZH, 1440/768/390/360 widths, navigation, responsive breakpoints, keyboard interaction, clipboard fallback, hero, sample pricing and Before/After.
- Verify legal/privacy terms and support identity before collecting real leads.
- Verify official brand identity SVG (dark/light/mark/favicons) and guidelines before visual brand sign-off.
- Do not publish prototype signup, payment or analysis as functional.
- Official pricing and authorized real case are still required for public launch.

## Binary migration

- `docs/stage-2r/screenshots/en-1440-full.png` may remain absent (historical screenshot only).
- The user provided `valve.png` for `public/demo/valve.png`; this connector cannot directly upload container bytes. Once uploaded, update `lib/demo-facts.ts` image URL back to `/demo/valve.png`, verify rendering and build.
- Current SHA-pinned public source image is a temporary, working dependency, not a finished portable asset handoff.

**DESIGN STRUCTURE:** frozen; **BRAND GRAPHIC ASSETS:** pending; **ENGINEERING HANDOFF:** conditional; **PUBLIC COMMERCIAL LAUNCH:** blocked.
