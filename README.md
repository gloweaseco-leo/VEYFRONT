# VEYFRONT — Building Digital Frontiers for Global Business

**Source-of-truth repository:** `gloweaseco-leo/VEYFRONT` (private).
**Commercial website baseline:** VEYFRONT Visual Identity 1.0 + the inherited L2M Website V1.2 client-journey prototype.
**Status:** Brand site live on Vercel with working inquiry intake. **Not approved for broad commercial promotion or automatic L2M services.**

## Site routes

- `/` — eight-section homepage, with Website Launch and Website Rebuild entry points.
- `/services` — Launch, Rebuild and future Grow service descriptions.
- `/start/launch` — real server-side inquiry form; successful submissions stored privately.
- `/start/rebuild` — real project inquiry with existing website URL; **no automatic fetch or AI diagnosis**.
- `/contact` — live general contact inquiry; `/contact/privacy` — data-rights request.
- `/privacy` and `/terms` — bilingual pages; legal-operator details still to be confirmed.
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
pnpm check:brand
pnpm check:commercial
node scripts/check-veyfront-brand.mjs
node scripts/check-brand-assets.mjs
pnpm exec tsc --noEmit
pnpm build
pnpm dev
```

Production Next.js build and TypeScript passed on `3a10a7f`. A synthetic POST returned HTTP 201; authenticated private store listing confirmed one inquiry object. Final marketing/legal acceptance remains blocked. See `docs/VEYFRONT_COMMERCIAL_CLOSURE_V1.md`.

## Brand assets

Frozen brand colors: Ink `#17262D`, Ivory `#F7F7F2`, Lime `#B8F06B`, Mist `#D9E5E4`.

**Original VEYFRONT Visual V1.0 SVG lockups and Open V mark have been supplied and integrated without redrawing.** Header and footer use the exact source lockups; favicon and Apple/Android icons derive from the original mark. Brand tokens and Chinese guidelines are preserved in the repository. See `public/brand/README.md`. Trademark clearance remains separate.

## Product truth and ownership

All Hartwell case screens are fictional, hand-built demonstrations **not produced by the L2M engine**. Pricing is SAMPLE-only. Real inquiry intake is connected; no account login, automatic diagnosis, payment or website generation is connected. Website source handover requires compatible hosting and service dependency configuration.

Original source snapshot: `chatgpters6/L2M-Web2` branch `stage-3-visual-final` at `25ca2ef0454228182f65f8912eb326c85ea551fa`. The missing historical screenshot is non-blocking. The user-provided demo valve image remains to be committed to `public/demo/valve.png`; until then the demo renders a SHA-pinned copy from the public source repository.

The original design brief and Stage 1/2 audit artifacts remain under `docs/` as history.


## Operational readiness extension

An optional, minimal-data email alert can be enabled only when Resend credentials and a verified sender are configured in server-side Vercel settings. Until that time a human must inspect the private store every working day. `node scripts/lead-ops.mjs list` provides metadata-only review; destructive deletion requires an explicit exact-path confirmation. See `docs/VEYFRONT_INQUIRY_OPERATIONS_V1.md`.
