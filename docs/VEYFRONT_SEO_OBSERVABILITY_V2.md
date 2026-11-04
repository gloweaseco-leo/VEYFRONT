# VEYFRONT SEO V2 — Search visibility, field performance & lead quality

Baseline: SEO V1 released via PR #17, \`main@5a391160\` (2026-11-04).
This V2 project is **instrumentation and measurement**, not a promise of Google ranking or business results.

## Implemented: lightweight public SEO monitor
- \`node scripts/seo-live-audit.mjs\` checks https://veyfront.com with public HTTP GETs only. It tests bilingual H1, titles, descriptions, canonical URLs, reciprocal hreflang, social cards, brand schema, sitemap (16 URLs), robots, excluded fictional demo, and OG PNG.
- Evidence: \`qa-evidence/seo-live/report.json\`; a GitHub Actions workflow runs once daily at 05:17 UTC and can be manually dispatched. Failures mark the Action red; configure GitHub notifications if you want prompts. Do not assume a red Action proves Google de-indexing.
- Logs contain only aggregate route/status/download-size and synthetic request durations. They never submit an inquiry, crawl customer messages or use private keys.
- These synthetic GET durations are **not** Core Web Vitals, Lighthouse lab scores or field user data. A passing monitor does not establish ranking, index coverage or conversion.

## Missing but required: search platform ownership
1. Create or access a **Domain** property \`veyfront.com\` in Google Search Console at https://search.google.com/search-console. Domain property verification usually requires adding a TXT record at the DNS provider. Do not paste token into chat or commit it; follow Google's provided instructions in the owner's DNS console.
2. Once ownership is verified, submit **exactly** \`https://veyfront.com/sitemap.xml\` in the Sitemaps report. \`robots.txt\` already advertises the sitemap, but explicit submission helps diagnostics and gives processing status. Submission does not guarantee indexing.
3. Inspect \`/\`, \`/zh\`, \`/pricing\`, \`/zh/pricing\`, \`/start/launch\`, \`/zh/start/rebuild\`; record Google-selected canonical, indexed status and errors. Never request indexing for /transformations or /review routes.
4. Read performance by query, page, country, device and date. Record organic impressions, clicks, CTR and average position. Label brand queries (veyfront) separately from non-brand buyer-intent searches (e.g., 外贸独立站建设).
5. Optionally connect Search Console to ChatGPT via an approved analytics connector after the owner grants access. Do not imply the connector is already linked or the property exists.
6. Bing Webmaster Tools and China-access tests should be considered separately; English site users and Chinese export-business buyers have different search behaviors.

## Missing but required: field Core Web Vitals
- Google field pass targets at p75: LCP <= 2.5 seconds, INP <= 200ms, CLS <= 0.1. 28-day rolling field data needs enough real visits, which may not be available on a new site.
- Vercel Speed Insights can measure real-user performance when explicitly enabled in the Vercel project and integrated using the supported \`@vercel/speed-insights\` package. Before enabling, confirm sampling and usage/cost terms. This project currently has **not** been verified as collecting Speed Insights data.
- For a mobile diagnostic baseline, run Google PageSpeed Insights or Lighthouse on home, /zh, pricing, contact; record Lighthouse Performance Score alongside LCP element, total blocking time and waterfall. Lab scores are not field data and vary with network/test run.
- Preserve mobile usability and the first-step Launch/Rebuild + WeCom contact journey rather than stripping meaningful interface elements solely to inflate lab scores.

## Conversion measurement and privacy
- Maintain an evidence ladder:
  1. Search impression/click: Google Search Console.
  2. Landing visits/consultation intent: analytics events (aggregate, no contact data).
  3. Form submissions saved under VF reference: private lead store, with source label; do not count attempts as accepted leads.
  4. Confirmed WeCom contacts: operator-verified records, not QR clicks.
  5. Qualified leads and proposal events: private manual status log (no external CRM required).
- Report: (non-brand organic clicks; valid leads; valid leads by landing page; organic-to-qualified lead rate when attribution is verified; qualified-to-proposal rate). Do not divide differently attributed datasets into a misleading "conversion rate".
- No contact names, phone numbers, WeChat IDs, message transcripts or commercial briefs in web analytics, GitHub Action artifacts or AI services.

## Periodic operations checklist
- Weekly: inspect Search Console URL coverage, top queries, CTR, Core Web Vitals by mobile and desktop; investigate anomalies.
- Monthly: 1-2 evidence-led, original buyer-intent resources (not keyword stuffing or generated fake cases); review analytics from search to validated inquiries.
- Quarterly: use validated customer cases only with permission, quantify on actual project evidence and published scope; review China reach and multi-language indexation.
- SEO outcome should be measured against actual B2B inquiry quality, not arbitrary keyword count, unverified scraped estimates or robots-only "100/100" scores.

## Speed Insights V2 production SDK staging (2026-11-04)
- Installed official pinned `@vercel/speed-insights@2.0.0` with lockfile and build-time Vercel integration; rendered only when `VERCEL_ENV === 'production'` (Preview and local test excluded). Sampling rate 0.25 reduces event volume and cost.
- **Platform activation is still required**: account owner enables Speed Insights for the `veyfront` project from Vercel dashboard after reviewing usage/plan. This SDK alone does not establish active metrics or a successful event receipt. After activation/redeployment, verify the script and dashboard metrics with real visitors; do not infer collection from the `READY` deployment alone.
- Do not enable Speed Insights Plus, paid upgrades or high sample rates without separate business authorization. Inspect privacy disclosures and blocklist any user-identifying URL paths before activation; current public routes use non-PII pathnames.
