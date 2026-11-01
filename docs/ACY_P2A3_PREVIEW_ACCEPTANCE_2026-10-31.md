# VEYFRONT × L2M P2-A3 · Evidence-Bound Context/Plan Preview Acceptance

**Status: FIRST-CANDIDATE PRIVATE PREVIEW E2E PASS; KEEP DRAFT; NO PRODUCTION RELEASE.**  
Verification: 2026-11-01 00:27:44 UTC (2026-10-31, Pacific).

## Scope and architecture

- One explicitly authorized HTTPS homepage: `https://veyfront.com/`; client cannot supply other domains.
- VEYFRONT `/p2a3` and `POST /api/acy/p2a3` are only accessible when `VERCEL_ENV=preview`, branch `feature/acy-p2a3-consumer`, and branch-level `ACY_P2A3_ENABLED=true`.
- Same-origin browser Fetch Metadata / exact branch alias guard, signed 60s HMAC proof, Vercel Trusted Sources OIDC, private upstream `/api/acy_plan`; no shared secret passed to browser.
- L2M branch `feature/acy-p2a3-grounded-plan` extends the single Python exact-route router and reuses P2-A2 authenticated homepage acquisition + `acy_assessment`.
- L2M owns contract `l2m.acy.plan/0.1` and all evidence/context. VEYFRONT checks the actual P2-A2 assessment, plan ID, manifest SHA, page SHA, exact four stage/code/basis combinations and zero-call/review-required gates before display.
- This is a deterministic, evidence-bound review plan. It is **not** generative CBP2 Planner, verified commercial diagnosis, ranking, pricing, automatic redesign, customer permission verification or production-ready product.
- No AI model or G18 generation calls. No arbitrary URL intake. All observations from a single HTML homepage; JS-rendered content and working inquiry channels not verified.

## Real protected-browser acceptance

The protected Preview browser entered `/p2a3`, affirmed website authority and clicked `Build grounded planning draft` once. It rendered both a live source report and a grounded plan with no error or alert.

- Observed title: **VEYFRONT — Building Digital Frontiers for Global Business**
- Evidence page SHA-256: `175c9f7e64a37d1673d7785891296f8b65a346b4e12e323c30e22a51abde1a55`
- Plan contract: `l2m.acy.plan/0.1`
- Plan ID: `plan-95d973a421f89469bcd7`
- 4 explicit `UNVERIFIED_HYPOTHESIS` review prompts: **discover, understand, trust, convert**.
- All include source route and page SHA plus conditional action and customer confirmation question.
- 0 model calls. `plan_ready=false`, `customer_ready=false`, `requires_customer_confirmation=true`.
- Independent Vercel L2M Python function log: `POST /api/acy_plan` **HTTP 200 at 2026-11-01T00:27:44.123Z**, deployment `dpl_K5iaGCJgt7NBzSXGWLN8A6TFTpFx`.
- L2M isolated Python suite: **10 passed**, no failures (6 planner tests and 4 preserved router regressions).
- VEYFRONT protected branch Preview deployment: `dpl_HUbhJbGBS2BfqHt23vi72cuH88pP` **READY**; P2-A3 Node schema/origin tests are included in the Next.js build.
- Ephemeral browser share link revoked; alias inspection showed 0 remaining shareable links.
- Production `veyfront.com` unchanged (SHA `527e86bdc9a13754b45c8b3154ff6953bd6a27eb`).

## Known gates before any broader customer release

1. Extract bounded buyer CTA and trust-signal observations with raw evidence, then distinguish **not observed in supplied scope** from verified absence; do not infer missing features from page counts.
2. Connect the existing L2M CBP2 planner only under typed fact/evidence validation and approved cost budget; reject invented markets, products, certifications, claims or results.
3. Prove replay/idempotency protection, rate limiting, source ownership and general domain controls before accepting non-VEYFRONT URLs.
4. Real commercial gap usefulness and business review still unproven. No price, ROI prediction, website generation, P4 permission or production merge.
