# ACY protected Preview E2E acceptance log — 2026-10-31

**Policy:** Never merge or publish to `veyfront.com` on the strength of this log. Synthetic-only, Preview protected, no paid model calls. Vercel SSO was not disabled. Temporary test credentials were revoked after each completed attempted run.

## Verified
- P1 synthetic `create`: HTTP **201**, persistent journey created with `needs_completion`.
- P1 `read` with invalid token: HTTP **404**. With original bearer: HTTP **200**, same journey recovered.
- P1 `complete_brief` operation: HTTP **200**. A test value `markets=EU` remained `needs_completion` because the validation rule requires at least 3 characters; therefore **qualified transition remains unaccepted**.
- P1 repeat action using the same action ID: HTTP **200** with `duplicate:true`; idempotency confirmed.
- P1 `choose_channel=feishu`: HTTP **200**, channel preference persisted; this is a preference only, not a live Feishu message delivery.
- P1 `request_human`: HTTP **200**, `human_review` state persisted and recovered by a final `read`.
- P2-A2: real VEYFRONT `POST /api/acy/p2a2` reached the L2M Preview app route via Trusted Sources preview-to-preview OIDC, but L2M returned **401**. VEYFRONT correctly surfaced **502**, not a fabricated assessment.
- L2M public homepage preflight: https://veyfront.com/ returned HTML HTTP **200**, `/robots.txt` returned **404** from the tested sandbox. This is not the same as successful L2M live acquisition.

## Known open gates
1. Diagnose L2M application-level 401 for the independent `X-L2M-Service-Token` header. Stored secret values were compared and matched via secured project settings, but a real request still received 401; do not infer the reason. Maintain protected OIDC and an independent service credential.
2. Run protected HTTP E2E for valid P1 `needs_completion -> qualified` with a compliant 3+ character market name, then full browser-driven test with authorized Vercel account.
3. Add durable rate limits, stronger identity/domain authorization, external fetch anti-abuse limits and operational monitoring before customer URL testing.
4. Validate true captured homepage, SHA-256 evidence and controlled findings; only then consider adding evidence-constrained Context/Planner and a model-spend gate.

## Current state
P1: **partial live HTTP E2E verified, not production-ready**. P2-A2: **deployed and routed, upstream application authentication blocked**. P3/P4: remain gated. Production main remains unchanged.
