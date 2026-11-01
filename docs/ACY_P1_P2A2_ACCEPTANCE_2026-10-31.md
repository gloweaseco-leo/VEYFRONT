# Current P2-A2 outcome — LIVE E2E PASS (2026-11-01 00:15 UTC)

The earlier 401 and blocked conclusions below are retained as **historical investigation notes**, not the current release verdict.

**Verified real protected-browser journey:** authorized checkbox -> VEYFRONT POST -> server-side OIDC + HMAC -> L2M Python handler -> real HTTPS homepage fetch -> evidence contract 0.2 -> strict VEYFRONT validator -> rendered report. L2M Vercel runtime log independently records `POST /api/acy_url_assess` **HTTP 200** at `2026-11-01T00:15:21.590Z` on deployment `dpl_EZYFbZbLUXHmSEmZZjKNMnd958Jh`.

Observed report:
- Canonical homepage: `https://veyfront.com/`; one live page.
- Contract: `l2m.acy.assessment/0.2`.
- Homepage title: `VEYFRONT — Building Digital Frontiers for Global Business`.
- Page SHA-256 evidence: `175c9f7e64a37d1673d7785891296f8b65a346b4e12e323c30e22a51abde1a55`.
- Model calls: **0**; generation calls not asserted from browser UI.
- Content rights are user asserted, not independently confirmed; one homepage observation is **not** a customer-ready commercial diagnosis.

**Confirmed root cause of historical 401:** `pyproject.toml` specified the single Vercel Python entrypoint `api.acy_assess:handler`, which routed even `/api/acy_url_assess` to the original P2-A1 synthetic-fixture API with a different bearer credential. The 401 never reached the new HMAC handler. Correction: `api.acy_router:handler` with exact P2-A1/P2-A2 paths; 4 isolated Python routing regression tests passed before the production-like Preview request.

Temporary runtime/auth diagnostic headers and proxy error classifiers were removed after successful proof. The ephemeral Vercel share link was revoked. No production merge, production deploy, customer URL scanning or paid model execution occurred. **P2-A2 only is accepted for one-domain Preview E2E; P2 broader Context/Planner, public access, pricing and generation remain gated.**

---

# VEYFRONT × L2M · P1/P2-A2 Engineering Acceptance — 2026-10-31

Status: **PREVIEW ONLY / DO NOT MERGE / DO NOT PUBLISH**.

## P1 confirmed by authenticated real HTTP POST to the deployed Preview
- Synthetic QA create: HTTP 201; initially `needs_completion`.
- Signed continuation bearer (stored hashed): correct read HTTP 200; invalid bearer HTTP 404.
- `complete_brief` with a 3+ character market name: HTTP 200, `qualified` persisted on subsequent read.
- Idempotent action replay HTTP 200 with duplicate flag, no new event.
- `choose_channel=feishu` saved the communication preference, NOT an external Feishu message.
- `request_human` saved `human_review`, recovered on later read.
- All test submissions synthetic, no real customer details; no email sent; production unchanged.

## P2-A2 newly implemented
- Restricted, one-domain/one-homepage URL collection. L2M remains sole owner of evidence inventory; VEYFRONT consumes strict `l2m.acy.assessment/0.2` output.
- Pre-existing service authentication via HTTP header returned application 401 in actual cross-project POST.
- Replaced raw service credential transfer with HMAC-SHA256 over fixed URL, explicit consent, timestamp and nonce, bound to a 60-second skew, plus independent Vercel Trusted Sources Preview-to-Preview OIDC.
- Node-side cryptographic cross-language vector matched expected `4e49e44bc1c7bc3424ac8b85b354d156bbab03a000e0c1769e1418a298780c7d`.
- Independently ran the actual Python API module in an offline, no-network sandbox with its network collector replaced by a local test double. Positive signature 200, tampered 401, expired 401, production 404, missing domain allowlist 503. **This is not a successful live crawl.**
- Browser E2E using the protected share link exposed an additional VEYFRONT `Origin not allowed` denial. A Preview-only fallback was added requiring browser-controlled `Sec-Fetch-Site: same-origin` and a non-simple `x-acy-preview-request: p2a2` header when Origin is missing. Production remains strict. The branch also accepts only its explicitly configured exact alias when Origin is present and Next's internal URL differs.
- After these fixes, VEYFRONT latest Preview and L2M latest Preview both reached READY. The final browser POST was **not verified**, because a further protected browser run was stopped by a tool safety check; therefore P2-A2 remains **E2E NOT ACCEPTED**.
- No AI model calls, G18 generation, client URL expansion, price, quote, or production deployment.

## Security follow-up requiring attention
- The expiring shareable Preview link used for browser QA was revoked and alias inspection confirmed zero active shareable-link bypasses on the P2-A2 branch alias.
- Two temporary project-level automation bypass credentials used in prior tests were reported revoked. However **one additional project-level automation bypass credential**, created with note `Temporary P2A2 error-category check; revoke automatically`, could not have its revocation verified after the Vercel action was blocked by tool safety checks. Because it was generated server-side and not retained in the conversation, the known connector action cannot target it without the secret.
- **Security action:** review VEYFRONT Vercel project → Settings → Deployment Protection → Protection Bypass for Automation and revoke the credential with that note. Keep Vercel Authentication enabled. Do not reuse or send bypass tokens in chat.
- Treat this as an unresolved QA access credential until confirmed removed.

## Release decision
P1 = partial functional E2E confirmed, not production-ready; P2-A2 = implementation + security tests pass, real browser-to-L2M report E2E unaccepted. P3 pricing isolated. P4 blocked by L2M quality gates. Main production domain remains SHA `527e86bdc9a13754b45c8b3154ff6953bd6a27eb`.

## Follow-up after project-owner credential revocation (Oct 31 PDT)

- The project owner explicitly confirmed deleting the outstanding Vercel automation bypass credential with label `Temporary P2A2 error-category check; revoke automatically`. Do not recreate the bypass.
- Browser E2E on the protected branch alias now passes VEYFRONT's Origin/Fetch Metadata gate and POSTs to L2M. L2M executes the Python route but returns HTTP **401**: therefore no versioned evidence report is yet accepted.
- A no-secret HMAC classification confirmed `P2A2_QA_SIGNATURE_MISMATCH` (not `Request expired.`). Both control-plane service environment variables were replaced with the same fresh 64-character cryptographic secret and equal values were confirmed; after forcing both Preview deployments the 401 persisted.
- One isolated Preview runtime probe showed VEYFRONT's runtime matched the newly rotated credential; L2M did not return the expected probe field (`upstream_rotated=null`). This is **inconclusive about the actual L2M runtime key**. Do not infer that Vercel changed the body or assert a root cause without observing the actual L2M function response at the deployment revision.
- Cross-language Node/Python static signing vector and Python local handler checks passed; the actual deployed server-to-server HMAC path **did not pass**.
- Short-lived preview share links generated for browser E2E were revoked after tests. No customer URL expansion or model execution occurred.
- All temporary error classifiers, embedded probe markers and credential diagnostics have been removed from both source branches.

**NEXT P0:** Reproduce the L2M 401 on an isolated authorized request with direct response status/body/header evidence, validate exactly which deployment serves it and which runtime secret configuration is loaded, then prove a real one-page assessment with matching SHA-256 evidence. Keep everything private, branch-bound and Draft until that proof succeeds. Do not merge or publish `veyfront.com`.
