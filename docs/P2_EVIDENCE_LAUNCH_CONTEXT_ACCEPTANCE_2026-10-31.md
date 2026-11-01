# P2 business evidence + Launch context candidate — Preview acceptance

Owner scope: P1 stable intake, P2 business analysis only. P3 payments and P4 generation are frozen. Never merge Draft PR or deploy production without new owner approval.

## Implemented
- Existing P1/Rebuild Journey uses a feature-gated L2M `/api/acy_evidence` endpoint only when `ACY_P2_FACTS_ENABLED=true` and only for the owned `https://veyfront.com/` homepage. Old `/api/acy_plan` contract stays available on previous branch, without changing existing approved tests.
- `l2m.acy.commercial-evidence/0.1` is validated against live assessment page SHA, literal excerpt SHA, stable DOM locators, kind/claim status, counts and capability presence labels. Any invalid evidence fails closed, not stored as a completed business diagnosis.
- Same private Journey adds source-linked commercial HTML observations and content digest, displayed as candidate/unverified; existing P2 review questions remain unverified fixed hypotheses. This is NOT a dynamic CBP2 plan and does not execute a model.
- Launch's P1-qualified journey now supports a no-URL, customer-self-reported Context **candidate** and records a source digest. Unknown industry, offerings, buyer roles/tasks and trust material remain explicit. No automatic business plan is claimed. L2M owns the longer-term validated Context/Planner interface.

## Verification
- GitHub Actions workflow `41262160310` completed **SUCCESS** for code head `2547557698dc0915477acd15c76af287bc7680aa`: **18/18 P0/P2 tests PASS**, TypeScript `tsc --noEmit` PASS, full `pnpm build` PASS.
- Separate L2M evidence/Context protected-source regression: **20/20 PASS** in isolated sandbox.
- Vercel manual deployment attempt for the new L2M evidence branch returned **402 api-deployments-free-per-day**. This new endpoint and the paired new VEYFRONT consumer have **NOT** passed current-head real-browser E2E. The older P1→P2-A3 QA E2E succeeded previously but did not test these new facts.
- No public customer domains, real client data, paid AI calls, payment or generated web pages were used. Actual platform costs beyond reported model calls not reconciled.

## Release gate
1. Deploy both exact current PR heads to protected Preview with branch-scoped env flags, HMAC and source whitelist.
2. Run single synthetic QA Rebuild Journey through real `/api/acy_evidence` and inspect observed CTA/contact/candidate/form excerpts, CSS locators, hashes, capability states; validate persistence and one P2 call.
3. Run synthetic QA Launch Journey without URL; check draft-only provenance and Planner blocked state persists after reload.
4. Preserve customer email ownership, privacy, retention, durable abuse controls and operating-owner signoff before inviting real customers.
5. For *dynamic* CBP2: validate real Site IR & Context 2.0, separate customer factual confirmation, permission to transmit data to an approved model and explicit call/cost authorization. Until then dynamic planning remains NOT IMPLEMENTED.

No merge, production update or P3/P4 scope change is approved by this record.
