# W1.7.1 Hybrid Hero micro-refinement — Preview-only

Approved scope: only two changes to existing Hero RIGHT visual; no left content, other pages, branding, pricing or production changes.

1. **Outer frame breathing:** 9.6-second alternate cycle subtly transitions lime border opacity and surrounding box shadow, offset 5.7s from opening sequence and 10s ambient glow. No geometry/layout changes, no new dependencies or JavaScript timers. Runs only after first viewport trigger and while the panel is visible.
2. **Arrow safety:** shorten the green SVG arrow from fixed width 80–96px to 15% of visual width, move to 12–13% from left and 49–50% from top, narrow stroke and glow. Its right bound ends before the After mockup begins, keeping the After product text and lower descriptive/CTA row clear.

Accessibility: mobile and desktop, no flashing, reduced-motion disables panel-level breathing and descendants. Arrow is decorative only; Before/After remain labeled.

Acceptance: EN/ZH at 1440, 768, 390 and 360px. Confirm hero frame animation CSS present, arrow doesn't overlap After mockup or lower CTA, no horizontal overflow; reduced motion CSS disables frame animation. Visual sign-off required; Draft PR #14 / Vercel Preview only.
