# Updated Scope Freeze: P1 + P2 only (after owner direction)

**The next deliverable is a stable P1-to-P2 customer-facing journey, not P3/P4.** All pricing, payment, ordering, AI site generation, delivery workflows and their execution endpoints are excluded. The Journey view now tracks only the active `P1` and `P2` stages; excluded later-phase capabilities are listed as out of scope rather than promised milestones.

## New source-linked P1→P2 integration

- P1 `qualified` + service `rebuild` + explicit new read-only source authorization + current private Journey bearer proof are required.
- Pilot source is **only** the approved `https://veyfront.com/` homepage. A recorded third-party URL, non-root path, Launch request or unqualified inquiry cannot initiate scanning.
- The same authenticated `/api/acy/p0` supports `op=assess_p2`. This uses a conditional private-Blob reservation before the bounded external call, with 45-second lease and failure categorization. Duplicate/concurrent action attempts return a conflict rather than silently sending additional scans.
- Reuses the already-proven L2M private branch `/api/acy_plan` signed envelope, Trusted Sources/OIDC, actual homepage observation and deterministic four-stage evidence-bound review. It does **not** invoke CBP2 generative planning or paid model services.
- Both L2M contracts are independently checked: `l2m.acy.assessment/0.2` and `l2m.acy.plan/0.1`; version/plan/manifest/page hashes, fixed-stage unverified hypotheses and zero model/generation calls must match. Invalid/rejected source proof fails closed and records an explicit reason.
- The verified metadata and four **unverified** review prompts are written to the existing Journey v2 record. A new P2 ledger event links to the captured page SHA-256, with an independent `VEYFRONT-READONLY-HOMEPAGE-2026-10-31` source-authorization marker.
- Recovery rechecks the event hash chain **and** the typed P2 provenance, and displays the P2 report and customer-review questions from that same private record. Never equate an HTML snapshot with site ownership verification or commercial effectiveness.

## New evidence and gate

- **13 isolated Node tests PASS** before final standalone CI, covering P1 parity, P2 authorization/lease/failure, HMAC envelope, bounded domain, forged page SHA, invented verified claims, rejected model usage, and source-bound plan linkage. Post-hardening tests also verify P2 consent marker and typed persistence.
- The GitHub workflow was updated to run `pnpm check:p0`, `pnpm exec tsc --noEmit` and a full `pnpm build` on branch pushes. An earlier workflow run (41259791252) **completed successfully**. Later patch series is undergoing the same checks; do not claim this final head passed until the corresponding run finishes.
- Preview branch has server-only `L2M_ACY_P0_SERVICE_TOKEN` and exact `L2M_ACY_P0_UPSTREAM_URL`, copied from the already approved L2M Preview key and allowlisted branch endpoint. Secrets are never committed, reflected to browsers or published in this report.
- Vercel manually creating a fresh deployment still returns **402 `api-deployments-free-per-day`**. The latest actual P0 Preview deployment predates the integrated source-code changes. Hence **current-head real browser P1→P2 E2E is still blocked, not accepted.**
- Customer email ownership, durable WAF rate limiting, independently verified provider/inbox delivery, transactional outbox, separate non-production storage and privacy/legal checks still block any real-customer launch. QA-only mail recipients remain enforced.

---

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
