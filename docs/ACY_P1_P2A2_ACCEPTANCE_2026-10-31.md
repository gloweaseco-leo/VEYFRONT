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
