# VEYFRONT Locale Architecture V2.0 — Preview handoff

Date: 2026-11-10
Scope: default Chinese for public commercial site, explicit English /en paths.
Status: **Preview branch only — not merged or deployed to veyfront.com**.

## Route contract

| Screen | Current production | Proposed preview |
| --- | --- | --- |
| Chinese home | `/zh` | `/` |
| English home | `/` | `/en` |
| Chinese price | `/zh/pricing` | `/pricing` |
| English price | `/pricing` | `/en/pricing` |
| Chinese contact | `/zh/contact` | `/contact` |
| English contact | `/contact` | `/en/contact` |

All other allowlisted public paths use the same convention. The brand and bilingual page contents are retained. There are no language auto-redirects based on IP, browser-language or cookies.

## Implementation

- `proxy.ts`: /en rewrites to the shared app page with English request locale; historical /zh paths receive 308 to unprefixed canonical Chinese; no rewrites for APIs, unknown paths, review or assets.
- `app/layout.tsx` and `lib/i18n.tsx`: root server render and client default to Chinese; English explicit paths render English.
- `components/l2m/localized-link.tsx`, `brand.tsx` and `site-header.tsx`: preserved page context on EN/ZH switch; links and active navigation scoped to locale.
- `lib/locale-metadata.ts`, `app/sitemap.ts`: Chinese unprefixed self canonical, English /en self canonical; reciprocal hreflang, Chinese x-default. Preview remains noindex via existing VERCEL_ENV guard.
- `lib/acquisition-channel.ts`: acquisition allowlist extended to /en, while historical /zh entries remain read-compatible.
- `scripts/seo-live-audit.mjs`: updated planned production verification of new canonical inventory and legacy 308 redirects.
- `scripts/check-locale-v2.mjs`: static route and SEO contract integrated into build. Existing V3.5 pricing, inquiry forms and operational checks remain.

## Migration risks & acceptance gate

1. **Important:** the existing production root and `/pricing` are already English canonical URLs. Reassigning these paths to Chinese cannot be a 301 of old English URL to `/en`, because the URLs are being repurposed. Existing Google indexation and external links may take time to adapt. Review GSC baseline and plan resubmission before production merge.
2. Existing `/zh/*` URLs redirect 308 to the Chinese canonical, preserving query parameters. Validate redirects with GET/HEAD and their `Location` values.
3. Validate HTML `lang`, Chinese and English page titles, descriptions, open graph, self canonical and reciprocal hreflang on every public page.
4. Validate the search sitemap in a *staged production* environment; previews deliberately serve no sitemap and noindex.
5. Validate home, pricing, Launch, Rebuild, contact and privacy links in two languages; test FAQ, price-to-contact plan selection, and inquiry confirmation with authorization.
6. Check desktop and 390px mobile layouts, switch and nav active states; no cross-language client hydration flashes.
7. Monitor GSC: new Chinese-root and English-/en indexes, redirects, and organic query trend. Do not assert equivalent Google rankings or automatic reindexing.
8. Preserve production until explicit merge authorization; this branch should only create an authenticated Vercel Preview.

## Release scope
No VRAE/L2M or Vey2GE changes; no automatic outreach; no changes to payment, hosting, databases or customer records.
