# VEYFRONT SEO & Performance Audit V1.0 — 2026-11-04
**Branch-only scope:** independent implementation + staged verification; do not merge/promote without explicit approval. Production baseline: `main@8067b971` after Contact & Lead Journey release.

## 1. Observed production baseline (not guessed scores)
- `https://veyfront.com` and `/zh` return indexed pages with distinct EN/ZH titles and self-canonical URLs. The Chinese homepage H1 prioritizes helping overseas customers find and inquire; standard offer ¥9,800 with clear indicative scope.
- `/robots.txt` allows production crawling and links to `/sitemap.xml`; current sitemap contains **16** EN/ZH public URLs. Internal design review paths blocked, `/transformations` noindex by meta.
- Independent live scrape of `/`, `/zh`, `/pricing`, `/zh/pricing`, `/transformations`, `/robots.txt`, `/sitemap.xml` and `/zh/contact` confirms metadata, visible copy and meaningful internal navigation. No verified Google indexing or ranking conclusion from a `site:` operator.
- Main indexable pages are home, pricing, how-it-works, contact, launch/rebuild intake, privacy and terms; services is a permanent redirect to pricing.
- **No authoritative field Core Web Vitals data yet**. Vercel Observability exposes speed-insight metric schema but no usable project measurement was retrieved. Google Search Console site/property and exact indexing metrics are not connected. Lighthouse scoring has not been run. Do not invent SEO, Lighthouse or Core Web Vitals scores.
- Sample product image is sourced from an external GitHub-hosted demonstration asset. It is **fictional sample content**, not a real VEYFRONT delivery. Its potential network impact must be measured, not assumed to be the LCP bottleneck.
- No verified customer case studies, legal operator disclosure, client testimonials or external link profile exist in the available evidence. Do not generate fictitious FAQ snippets, ratings, awards, customer results or address.

## 2. Confirmed opportunities and engineering action
| Priority | Problem / risk | Action | Evidence / limits |
| --- | --- | --- | --- |
| P0 | Brand-only English homepage title weak for B2B website services search | More intent-specific bilingual titles and distinct descriptions while keeping the frozen visible brand slogan | Code + SSR metadata test |
| P0 | Share cards/brand knowledge ambiguous | Organization and WebSite JSON-LD with verified public facts only; social OG image in frozen dark/lime palette; locale-specific OG/Twitter metadata | Browser inspection + image response test; no rich-result guarantee |
| P0 | Reciprocal language metadata needs exact parity | Explicit en/zh-CN/x-default hreflang on each page; self canonical; public-only bilingual sitemap; no synthetic lastModified | SSR pair audit and production/Preview separation |
| P0 | Review artifacts accessible at public paths | Noindex explicit on /a, /b and /review/stage-1; demo transformations remains noindex; no internal routes in sitemap | SSR regression + robots checks |
| P1 | Pricing/search intent lacks buyer FAQ | Add concrete, source-consistent service Q&A on cost, launch vs rebuild, redirects/ranking risk, materials, SEO boundaries | Bilingual semantic page with no fabricated claims |
| P1 | External demo illustration may compete for startup bandwidth | Lazy/deferred loading of fictional product demo `<img>` assets; no visual design changes | Browser QA, network measurement needed |
| P1 | Lack of performance baselining | Record local headless Chrome navigation/resource-transfer samples with viewport and URL in CI evidence; values are lab signals **not** CrUX p75 | 1440/390 in CI, follow with external lab+field |
| P2 | Limited content depth and proof | After collecting real buyer questions and authorized delivered cases: compare Launch/Rebuild decision pages, case-study evidence, performance benchmarks | **Content commissioning, not code-faked proof** |
| P2 | China reach and SEO channel unknown | Google Search Console/Bing Webmaster/Baidu verification + accessibility tests from China and overseas, then per-query segment analysis | Requires platform ownership, property access and field data |

## 3. Search-intent map (avoid cannibalization and thin doorway pages)
| Search need | Primary canonical | Intent and next action |
| --- | --- | --- |
| 外贸建站 / B2B独立站建设 / cross-border B2B website | `/zh` (EN `/`) | Service proposition, Launch/Rebuild choice |
| 外贸网站建设报价 / B2B website pricing | `/zh/pricing` (EN `/pricing`) | Inclusions, boundaries, references, quote consultation |
| 外贸建站流程 / B2B build process | `/zh/how-it-works` | Four steps, review and acceptance |
| 新建外贸独立站咨询 | `/zh/start/launch` | Project intake, not a thin SEO doorway page |
| 外贸网站改版升级咨询 | `/zh/start/rebuild` | Existing URL and business goals, not a diagnosis claim |
| 联系 VEYFRONT | `/zh/contact` | WeCom and formal inquiry, independent paths |
| Artificial demo | `/transformations` + `/zh/transformations` | Intentionally noindex until real authorized cases |

## 4. Web performance measurement targets and limitations
Google's field Core Web Vitals at 75th percentile: LCP <=2.5s, INP <=200ms, CLS <=0.1, by mobile/desktop; these are **targets, not measured VEYFRONT results**. Need 28-day field window for meaningful trends and sufficient traffic. Lab mobile Lighthouse is useful for diagnosis but does not prove p75 real-user scores.
- Run mobile+desktop Lighthouse on production/Preview public routes after a stable release, compare LCP element, TTFB, JS bundle cost, fonts, layout shift, image network waterfalls, and actual China access.
- Separate page groups: home (motion/visual), pricing (text/FAQ), contact (QR/form), start forms. Preserve reduced motion and accessible contrast. Do not degrade UX to chase a single lab score.
- Site currently loads Geist/Geist Mono + four Noto Sans SC weights. Assess font-byte cost before changing visual identity; the CJK face is self-hosted, not loaded directly from Google on each page request.
- Review Vercel Speed Insights availability and price before enabling any paid capability. Existing Vercel Analytics event counts are **not** direct SEO clicks, rankings, or Core Web Vitals.
- Client-side privacy: never send contact PII to SEO tools, Web Vitals analytics, public docs or external AI systems.

## 5. Operational SEO acceptance (not yet established)
1. Verify Search Console domain ownership. Submit `https://veyfront.com/sitemap.xml` and inspect sampled canonical/index status for EN/ZH pages. Allow crawlers time; submission does not guarantee indexing.
2. Inspect zero-result / soft-404 / page-with-redirect / discovered-not-indexed and robots exclusions. `/a`, `/b`, `/review/*`, `/transformations`, `/contact/privacy` must not appear as search landing pages.
3. Establish 28-day rolling organic clicks/impressions/query/landing page/CTR, meaningful inquiry and confirmed WeCom contact rate, and field CWV by mobile/desktop. Neither click intent nor form submission alone establishes a new client.
4. Publish verified organization contact/legal identity when available; avoid rich-result markup for unsupported product reviews, ratings, FAQ and fictitious cases.
5. Write original, evidence-led content from authentic buyer scenarios before creating more URLs; publish case studies only with explicit customer approval.
6. English SEO audience and Chinese domestic buyer audience are different; do not assume all traffic comes from Google. Verify Baidu/Bing reach and China site performance with regional measurements.

## 6. Release gates
- CI `pnpm check:seo` + TypeScript/build + full existing bilingual browser QA and new metadata/schema/OG checks must pass at exact HEAD.
- Confirm Vercel Preview READY, production `main` unchanged; do not update production without approval.
- On future production approval: verify actual live robots/sitemap/OG image/headers/hreflang/brand JSON-LD, Search Console inspection, and real-device contact form/QR unaffected.
