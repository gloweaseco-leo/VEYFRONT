# ACY P1 Preview Implementation — 2026-10-31

## Scope & safety
- Branch `feature/acy-p1-preview`, Vercel PREVIEW ONLY; do not merge to main or release to veyfront.com.
- Route `/p1` and API `POST /api/acy/p1` both return 404 unless `VERCEL_ENV=preview` AND `ACY_P1_ENABLED=true`.
- Only `qa@example.invalid` or `hello@veyfront.com` emails are accepted; do not enter real customer data.
- Real production `/api/leads` is left unchanged. P1 data is under `acy-preview/p1/journeys/` within the connected private Blob store. This is a namespace separation, NOT a separately provisioned data store or strong resource isolation; do not promote without separating it.
- `BLOB_READ_WRITE_TOKEN` must be available in the Vercel Preview target; it is never sent to clients. Browser access uses a randomly generated, 48-hour bearer secret: only a hash is stored.
- Optional `ACY_P1_RESEND_KEY` may be set exclusively for the preview branch. If present, only `hello@veyfront.com` is eligible for a QA confirmation containing a resumable secret link. Treat that link as a password. No external customer confirmation emails.
- Do not put test links in public logs, issue discussions, or analytics.

## Implemented
- Durable synthetic inquiry, private storage and reference ID.
- Rules-based detection of missing buyer markets/desired action; automatic next-question interface and deterministic state transition to `qualified`.
- Authenticated read/updates using short-lived bearer proof; idempotency on action ID; conditional Blob writes via ETag; 409 on write contention.
- Channel preference recorded for Email / WeChat / Feishu; NO third-party WeChat or Feishu integrations are claimed.
- Human exception request with event trail; optional internal email QA confirmation.
- Small synthetic test suite in `pnpm check:p1`.

## Explicitly NOT production ready
- Blob overwrites have caching and concurrent update limitations; use a proper transactional system (e.g. PostgreSQL) and a durable workflow/outbox for production autonomous execution.
- No account-level identity verification, independently confirmed customer ownership, durable WAF rate limiting, consent-based marketing, signed callbacks, CRM, payments, AI diagnosis or actual pricing.
- Email confirmation is **best effort**, not a durable retry queue. QA links appear in the preview browser for testability; this must be redesigned before processing real customers.
- No current operations owner/SLA, no legal entity confirmation; keep noindex and no broad advertising.
- Existing real inquiry storage path and production email operations remain untouched.

## Acceptance
1. Vercel Preview deployment READY, TypeScript/build/checks PASS.
2. GET /p1 is 200 on preview; POST /api/acy/p1 unknown or invalid returns 422/400.
3. Synthetic request creates ID; state needs_completion; valid answers advance qualified; duplicate action id doesn't append duplicate event.
4. Preview reload with URL token recovers state; invalid/expired token doesn't reveal record.
5. Optionally QA test to hello@veyfront.com with email send enabled and provider delivery inspected.
6. Reconfirm veyfront.com remains on original main SHA, not this branch.
