# P0 Unified Intake + Journey Ledger · Development and Acceptance Record

**Review baseline: 2026-10-31 Pacific / 2026-11-01 UTC.**
**Current verdict: ISOLATED IMPLEMENTATION AND SIMULATED API PASS; DEPLOYED END-TO-END NOT ACCEPTED.**
**Branch:** `feature/p0-unified-journey-ledger`; stacked on P2-A3 Preview. **Draft PR #9. Do not merge/publish production.**

## What is actually implemented

- Existing Launch/Rebuild form `POST /api/leads` switches to `receiveP0()` **only** in `VERCEL_ENV=preview`, `VERCEL_GIT_COMMIT_REF=feature/p0-unified-journey-ledger`, `ACY_P0_ENABLED=true`. In production, the pre-existing private inquiry handler remains unchanged.
- In the Preview, new submissions use **one canonical private Blob object**, `acy-p0/preview/journeys/<id>.json`. No second `inquiries/` copy and no separate P1 record. Old P1 QA route is retained for compatibility, but is not part of the new P0 journey.
- Stored P1 status policy mirrors frozen P1 rules: missing `markets` or `desiredAction` → `needs_completion`; completed fields → `qualified`; exception → `human_review`. This is **automated intake validation**, not independently verified sales qualification.
- A 48-hour opaque access token, stored only as SHA-256, is needed for read/update. The resume URL places the token in a **URL fragment**, not an HTTP query. Recovery uses authenticated POST, no public GET record endpoint.
- Unique client idempotency key and server-side HMAC-derived record identity prevent retries creating extra inquiries. Conditional ETag overwrite prevents silent concurrent update; stable action IDs avoid duplicate transitions.
- `/journey` shows missing information, channel preferences and current blocker, a hash-linked event timeline, source self-report hashes, P1–P4 gates and cost ledger. Event-chain integrity is revalidated on every read. Hash chaining detects accidental tampering of the record **but is not immutable third-party notarization**.
- Current event/usage contract: model_calls=0, generation_calls=0, actual currency/cost **unknown/not reconciled**; no fabricated $0 Blob or email expenses. P2/P3/P4 explicitly `NOT_STARTED`/`LOCKED`, not phantom workflow completions.
- Branch Preview anti-abuse gates: Vercel Authentication + exact branch/Origin/Fetch Metadata, internal QA email allowlist (`qa@example.invalid` or `hello@veyfront.com`), consent/URL/JSON/max body/honeypot, 48h token, 50-event cap, idempotency/conflict checks. This is **not** durable public traffic rate limiting or verified email identity.
- Operational Resend alert is isolated to a branch Preview key, sends only to `hello@veyfront.com`, and never includes PII or resume credentials. Event status `provider_accepted` means the provider returned success, **not proven inbox delivery**; `failed/disabled/pending` stay distinct. No external customer mail sent in the validation.

## Tests completed

1. Node 24 isolated deterministic status/idempotency/security/evidence tests: **9/9 PASS**.
2. Isolated in-memory Blob API emulator (private `put/get/head`, conditional `ifMatch`) initial integration: `CREATE 201 → DUPLICATE 200 → CONFLICT 409 → complete qualified → channel=wechat → human_review`, 6 material events; a separate mocked provider acceptance emits no PII/token and returns `provider_accepted`.
3. Post-hardening rerun verified the **event SHA hash chain** alongside duplicate recovery, private storage CAS, and qualified transition; **PASS**. The first attempt used a two-character market code and correctly remained incomplete; using `European Union` passed the frozen minimum-length rule.
4. QA provider smoke attempted directly to `hello@veyfront.com` from a restricted no-client-data sandbox. The HTTP response was **403, body `error code: 1010`**, indicative of upstream network/bot blocking. Neither Resend provider acceptance nor mailbox delivery was demonstrated. Do not infer invalid credentials from this result.
5. Vercel manual `create_deployment` returned **402 `api-deployments-free-per-day`** after over 100 daily deployment requests. Automatic branch deployments exist only for early commits and predate the integrated route, UI and final tests. **Full Next build and protected-browser E2E for this current P0 head remain unverified.**
6. No real customer data were used. No production change, merge, real customer signup, paid L2M call, order or generation occurred.

## Unmet release gates (blocking genuine customers)

- Verify a current-head Vercel Preview build and browser flow across `/start/rebuild`, `/journey`, plus the existing Production `/api/leads` legacy fallback. The Vercel quota needs to clear or user-authorized billing/plan adjustment.
- **Mailbox ownership confirmation** must be enforced before trusting identity or issuing customer recovery grants. A person can currently enter another address while receiving a browser grant; acceptable only on QA-allowlisted protected Preview, not a public customer workflow. Implement customer email-bound magic link + explicit consent before production.
- Verify actual Resend API acceptance and message delivery independently, with receipt correlation, retry/outbox, and non-delivery escalation. Current email is best-effort.
- Durable abuse protection/WAF, source verification, safe retention/erasure (current private Blob records do not expire automatically), a separate non-production storage resource, and an operations owner/SLA and legal/privacy signoff.
- For high concurrency and durable automation beyond pilot, migrate from conditional-Blob event overwrites to a transactional journey/event store and an outbox; do not promote the Preview prototype as fully reliable.
- Bind verified customer identities and future P2 source evidence, P3 quotes and P4 delivery results as authorized events, with measured cost import/attribution before claiming cross-stage end-to-end completeness.

## What this work establishes

**The P0 architecture and implementation path are viable in controlled tests**, and the legacy official Launch/Rebuild submission UI has a branch-gated path to the same Journey v2 source of truth. **It does not yet prove that real customers can securely complete and resume this journey on a deployed production site.**
