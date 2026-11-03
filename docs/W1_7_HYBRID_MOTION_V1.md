# VEYFRONT W1.7 Intelligent Conversion Motion V1.0 — preview candidate

Date: 2026-11-03. Scope: homepage Hero right visual only. Left headline, Launch/Rebuild buttons, brand, navigation, prices, other routes and services remain unchanged. Draft PR #14, no main merge.

## Behavioral implementation

- Before enters once at 0–0.95s, After at 0.65–1.9s, arrow at 1.6–2.7s.
- Orbital signal reveal 2.1–3.9s; 4 buyer nodes light sequentially 2.25–4.7s.
- Following 5.5s, 2 slow SVG dash routes (12/15 seconds) and ambient pulse (10 seconds) run only while visible.
- IntersectionObserver triggers once on entry with no clocks, requestAnimationFrame, WebGL or third-party assets.
- If JavaScript is disabled or IntersectionObserver unavailable, fully composed static markup is present by default.
- Reduced-motion preferences disable animation and transitions. Hover styling is minor and not required for comprehension.
- All visual examples and signal paths are conceptual illustrations, not client results, verified online analysis or measured visitor activity.

## Acceptance / release

Test 1440/768/390/360 px desktop/mobile and EN/ZH, no overflow or JS errors, no CTA blockage, motion triggered after panel reaches viewport. Verify the reduced-motion static fallback and mobile reading if possible. Vercel Preview only; production veyfront.com remains unchanged pending owner inspection.
