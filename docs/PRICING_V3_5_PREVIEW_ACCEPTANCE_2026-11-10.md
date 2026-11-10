# VEYFRONT Pricing V3.5 — Preview-only acceptance handoff

Date: 2026-11-10
Branch: `feature/pricing-v35-preview-20261110`
Production branch: `main` **not modified**.
Status: **PREVIEW / COMMERCIAL APPROVAL PENDING**.

## Product principle
- Price matrix: ¥3,680 Professional Start; ¥6,680 Sales Expansion (recommended, not "best selling"); ¥9,680 Growth Navigator.
- Standard Launch and regular Rebuild are two paths to the same three tiers.
- All plans: bilingual B2B site, confirmed inquiry receipt, first-year basic commercial hosting, 30-day delivery defect coverage and **three months of benefits** after accepted launch.
- Three months means service eligibility, **not a forced month-by-month schedule**. Continuing checks should be spaced during the term; fixed deliverables may be requested and completed early.
- Growth Navigator chooses either search-growth research or target-buyer research, **not both**. Up to 20 evidence-backed candidates, with at most 5 further screened, does not mean 20 confirmed buyers or actual opportunities.
- Web copy uses verified client evidence; no fake case studies, AI rankings or sales guarantees.
- Standard structured product record counts: 10/30/50 proposed caps, **subject to direct delivery cost validation**.
- Second-year hosting amount and all external costs: signed disclosure required. ¥6,800/year Run is a **candidate reference**, not a mandatory renewal.
- Original W1.6 single-price ¥9,800 is a historical proposal; V3.5 in this branch is a new commercial *candidate*, not a silently approved contract offer.

## Implementation
- `components/veyfront/pricing-v35.tsx` — new Chinese/English pricing page and homepage teaser, editorial brand layout, three plan cards, value upgrade, five comparison groups, three-month entitlement, research track alternatives, delivery evidence, hosting, FAQ and Launch/Rebuild CTAs.
- `app/pricing/page.tsx` — switch to V3.5 and update localized SEO metadata.
- `app/page.tsx` — switch homepage pricing teaser and localized SEO descriptions.
- `components/veyfront/commercial-offers.tsx` — compatibility wrapper prevents legacy single-price copy reappearing when imported.
- No payment API, login, L2M diagnosis trigger, CRM, AI research runtime, external outreach or private customer data is added.

## Build evidence
- Vercel Git Preview from branch: deployment SHA `e9ff63a5048126b86c751b5f4868cfe4a4ca68fb` was `READY` after TypeScript correction.
- Vercel production target is not set; no production domain is assigned.
- Build runs original checks: demo, brand, intake, ops, contact, SEO, security, Next.js compile, TypeScript and static routes.
- Next.js compiled successfully; TypeScript finished; 19 static pages generated.
- Preview URL: https://veyfront-gl85u6x8w-gloweaseco-1757s-projects.vercel.app/zh/pricing
- Preview requires Vercel Authentication due to existing project protection.

## Remaining acceptance (not claimed passed)
- Browser access through protected preview by authorized owner: validate desktop 1440, tablet 768, mobile 390/360; scrollable table, text wrapping, visual overlap, no horizontal page overflow; EN/ZH labels; FAQ expansion and responsive accessibility.
- Inspect actual inquiry flow by authorized tester; test plan selection in real conversations, and confirm support capacity.
- Cost: measure three projects for each service tier or sufficiently representative cases, including 3-month support and 20-candidate research hours.
- Business: approve hosting supply, year-two renewal, domain registration allowance, structured product limits and the exact scope of "3 small edits"/"2 optimization cycles".
- Legal/privacy/tax/operating entity and real commercial offer signoff.
- After signoff only: decide whether to merge and separately deploy main. **This branch must never auto-promote or cover veyfront.com.**

## Notes
The original historical `lib/commercial-offers.json` and W1.6 cost documents remain untouched on purpose. They are **not** the runtime V3.5 source. A follow-up merge-preparation refactor can migrate the new product contract into a validated shared data module after commercial signoff, without changing the Preview's business meaning.
