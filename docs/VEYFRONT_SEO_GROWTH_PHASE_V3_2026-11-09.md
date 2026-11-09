# VEYFRONT SEO Growth Phase V3 — index readiness → buyer intent → verified inquiry
Baseline date: 2026-11-09
Scope: veyfront.com, production only. This is an evidence/acceptance plan, not a claim of search ranking.

## 1. Evidence boundaries
- Source of truth for **Google index status**: authenticated Google Search Console URL Inspection/Page Indexing reports.
- Source of truth for **Google organic impressions/clicks/CTR/query/page/country/device**: GSC Performance report.
- Source of truth for **technical reachability**: production HTTP monitoring and live public page checks. These are **not** Google indexing.
- Source of truth for **form receipt**: private Vercel Blob record with VF receipt. A submit attempt or email click is not a valid lead.
- Source of truth for **WeCom contact**: operator-confirmed contact, not QR display/click.
- Source of truth for **qualified opportunity**: reviewed, privately recorded qualification/proposal outcome. No fabricated case, conversion or ROI.

Evidence currently available:
- 2026-11-09 GSC owner screenshots show `https://veyfront.com/` indexed, and `https://veyfront.com/zh` then reported not discovered. No verified post-fix update from Google.
- The sitemap was submitted on 2026-11-09 and GSC initially showed "Couldn't fetch"; independent public fetch and the 2026-11-08 production SEO monitor confirmed a publicly reachable sitemap with 16 intended URLs. Do not say that this establishes Google's own successful fetch.
- 2026-11-09 independent live inspection read all 16 bilingual pages: index/follow and matching self-canonical metadata. **Technical eligibility: 16/16; Google index coverage: unknown beyond known owner screenshots.**
- The English/Chinese navigation links and review noindex rules were corrected in previous production PR #22.

## 2. Search-facing URL inventory

| Buyer task | English | Chinese | Commercial priority |
| --- | --- | --- | --- |
| B2B new website / rebuild discovery | / | /zh | P0 |
| Price, scope, procurement due diligence | /pricing | /zh/pricing | P0 |
| Delivery / timeline / acceptance | /how-it-works | /zh/how-it-works | P1 |
| Contact | /contact | /zh/contact | P0 (conversion) |
| New website intake | /start/launch | /zh/start/launch | P1 (conversion) |
| Existing website rebuild intake | /start/rebuild | /zh/start/rebuild | P1 (conversion) |
| Privacy notice | /privacy | /zh/privacy | Legal; index eligible, not acquisition KPI |
| Website terms | /terms | /zh/terms | Legal; index eligible, not acquisition KPI |

12 buyer-facing URLs and 4 legal URLs. Deliberately non-indexable: `/transformations`, `/zh/transformations` (fictional demo), `/contact/privacy`, `/zh/contact/privacy` (personal data request), `/a`, `/b`, `/review/stage-1` (review).

## 3. SEO search-intent focus, to validate in GSC before publishing new pages

Chinese core service intent (VEYFRONT sells to Chinese export B2B enterprises):
- 外贸独立站建设 / B2B 外贸网站建设 → `/zh`
- 外贸网站建设报价 / 外贸独立站费用 → `/zh/pricing`
- 外贸网站改版 / 外贸网站重建 → `/zh/start/rebuild`, decision guidance to `/zh/pricing`
- 外贸网站建设流程 / 交付验收 → `/zh/how-it-works`

English core service intent (international brand/service exposure):
- international B2B website design and rebuild → `/`
- B2B website pricing/scope → `/pricing`
- B2B website redesign/migration inquiry → `/start/rebuild`

These are **intent hypotheses**, not observed Google keyword volume or rankings. Do not create near-duplicate doorway pages, claims of delivered results, or unsupported customer stories.

## 4. Measurement ladder and responsible operator
| Funnel stage | Metric | Authoritative evidence | Current status |
| --- | --- | --- | --- |
| Technical | 16 canonical pages are technically crawlable and self canonical | Public live monitor | Baseline 16/16 checked, continuous CI monitor expanded in V3 |
| Index | 12 buyer-facing URLs indexed by Google / 12; EN vs ZH | GSC URL Inspection or Page Indexing filtered by sitemap | Not yet measured |
| Search | Non-brand impressions/clicks, top queries, country, device, CTR | GSC Performance | Not yet connected for API use |
| Engagement | Landing page → contact/form/WeCom intent | Approved first-party aggregate analytics | Partial; not a verified organic cohort |
| Inquiry | Valid saved VF form receipt and separately confirmed WeCom contact | Private lead records, operator verification | Existing mechanism; search channel is unverified |
| Sales | Qualified opportunities and approved proposals | Private status events, operator confirmation | Manual, do not invent |

**Never divide GSC clicks by all saved form inquiries and label it an organic conversion rate.** The datasets have different attribution, time windows and channels. If attribution is unknown, label it unknown.

## 5. Short-cycle operating protocol

**Immediately (0–7 days)**
1. GSC: inspect /zh, /zh/pricing, /pricing and / (indexed? canonical? crawl result?), and the *details* for sitemap "Couldn't fetch". Do not mark index coverage as 16/16 based on HTTP.
2. GSC Performance: export query and page tables for the earliest available range; explicitly state date range, low traffic/no-data caveat, and brand vs non-brand.
3. Inspect high-intent landing page titles/snippets for relevance; preserve existing successful Chinese sales funnel and verified ¥9,800 reference price.
4. Ensure production SEO monitor runs at intended cadence and GitHub Actions runner availability is healthy. CI failure with zero steps is not a passing quality gate.

**After real GSC data exists (7–30 days)**
1. Analyze non-brand queries by country and language; optimize *existing* landing pages first, not a content farm.
2. Review 4 categories: discoverability, buyer consideration, content trust, contact conversion. Validate client service questions with real sales conversations.
3. Only publish a new guidance page if it answers a clearly distinct validated buyer question. Link to the corresponding Launch or Rebuild path, and include author-approved factual scope.
4. For any SEO lead attribution implementation, store only approved, coarse-grained non-PII signals and mark uncertain provenance. Update privacy disclosure and test first; do not ingest raw search terms/referrer URLs/customer data into analytics.
5. Treat Baidu/Bing separately for Chinese buyer acquisition: China customer attention and Google international search are not interchangeable.

## 6. Release gates
- Changes to `main` only after build/TypeScript/SEO and lead-flow safety tests pass and production post-deploy checks complete.
- Daily public GET checks are not GSC API checks. Preserve `noindex` on fictional demos and protected-review workflows.
- Don't buy a paid SEO suite, authorize Google OAuth, send email, or spend on advertising without explicit operator action.
- Grow verified B2B leads rather than vanity indexing counts.

## 7. V3B — first-party inquiry source hints (privacy-first)

Implementation after the technical 16-URL baseline:
- On the first page of a browser session, record only a coarse `google-organic`, `bing-organic`, `baidu-organic`, `other-search`, `external-referral` or `unknown` classification plus the first **allowlisted public landing-page path** in first-party sessionStorage. No full referrer URL, query string, search term, IP, device fingerprint or persistent marketing cookie.
- Only after a visitor explicitly consents and the normal non-privacy form is **successfully saved** does its private record receive `acquisition.channel`, `acquisition.landingPage` and provenance `unverified-browser-referrer-category`. Older inquiries remain `unknown`. Privacy requests never receive source attribution.
- The server revalidates both fields against closed lists; forged, unknown or invalid browser input becomes `unknown`/null. User-visible design, contact channels and successful form receipt behavior are unchanged.
- No public route exposes this private metadata. `node scripts/seo-lead-report.mjs --since=YYYY-MM-DD` works only in an authorized operator environment with `BLOB_READ_WRITE_TOKEN`. It reads saved private receipts, refuses partial pagination/fetch failures and emits **aggregate counts only** for service, channel and landing page. It never prints individual lead names, emails, phone numbers, customer briefs, raw URLs or search terms.
- The operator may use the aggregates to prioritize follow-up and page improvements; **do not label these as GSC-verified organic conversions**. Referrer data may be stripped, spoofed or incomplete; Google Search Console clicks use different attribution windows. A qualified buyer must still be manually verified.
- The bilingual public Privacy Notice discloses the coarse category/session source and landing page. No third-party analytics source gets individual contact data.
- QA covers known search referrers, malformed/spoofed domains, allowed landing paths, privacy exclusions and aggregate PII non-disclosure using synthetic test records. There is no live synthetic customer form submission in production.
