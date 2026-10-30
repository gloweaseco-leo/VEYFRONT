# VEYFRONT — Building Digital Frontiers for Global Business

**Source-of-truth repository:** `gloweaseco-leo/VEYFRONT` (private).
**Commercial website baseline:** VEYFRONT Visual Identity 1.0 + the inherited L2M Website V1.2 client-journey prototype.
**Status:** Brand conversion in development, **NOT** approved for public production launch.

## Site routes

- `/` — eight-section homepage, with Website Launch and Website Rebuild entry points.
- `/services` — Launch, Rebuild and future Grow service descriptions.
- `/start/launch` — local, copyable project brief; **nothing is submitted**.
- `/start/rebuild` — URL-format-only demo; **no website fetch or AI analysis**.
- `/transformations` — fictional Hartwell Before/After comparison.
- `/how-it-works` — Rebuild journey prototype.
- `/pricing` — sample-only Rebuild pricing interface, not a real quote.
- `/review/stage-1`, `/a`, `/b` — historic design review routes.

**VEYFRONT** is the commercial brand. **L2M** is the underlying website-reconstruction engine, not the public brand or a full enterprise internal platform. Website hosting is optional.

## Development

```bash
corepack enable
pnpm install --frozen-lockfile
pnpm check:demo
node scripts/check-veyfront-brand.mjs
pnpm exec tsc --noEmit
pnpm build
pnpm dev
```

The production build and browser tests have not yet been demonstrated for this brand branch. See `docs/VEYFRONT_BRAND_IMPLEMENTATION_V1.md` for evidence and release blockers.

## Brand assets

Frozen brand colors: Ink `#17262D`, Ivory `#F7F7F2`, Lime `#B8F06B`, Mist `#D9E5E4`.

**The original, approved Open V/VEYFRONT SVGs have not been uploaded to this repository.** The logo is a text-only placeholder. Do not generate an imitation. See `public/brand/README.md`.

## Product truth and ownership

All Hartwell case screens are fictional, hand-built demonstrations **not produced by the L2M engine**. Pricing is SAMPLE-only. No actual login, diagnosis, payment or lead intake service is connected. Website source handover requires compatible hosting and service dependency configuration.

Original source snapshot: `chatgpters6/L2M-Web2` branch `stage-3-visual-final` at `25ca2ef0454228182f65f8912eb326c85ea551fa`. The missing historical screenshot is non-blocking. The user-provided demo valve image remains to be committed to `public/demo/valve.png`; until then the demo renders a SHA-pinned copy from the public source repository.

The original design brief and Stage 1/2 audit artifacts remain under `docs/` as history.
