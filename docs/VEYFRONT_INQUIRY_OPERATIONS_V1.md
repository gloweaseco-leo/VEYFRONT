# VEYFRONT Inquiry Operations V1.0
Status: **operational readiness, not full legal/commercial go-live**. Legal operating entity confirmation pending.

## Source of truth and notification
- Private Vercel Blob is the only durable receipt. Existing `/api/leads` stores first, then returns a reference.
- Optional alert through Resend is **disabled until all three server-side settings are provided**: `RESEND_API_KEY`, `VF_ALERT_TO_EMAIL`, `VF_ALERT_FROM_EMAIL`.
- Verified sender domain is required by the email provider. Configure these in Vercel project settings; never use `NEXT_PUBLIC_*`.
- Alerts contain only service category, non-PII reference, UTC receipt time, and an instruction to check private Blob. They do **not** contain names, email addresses, URLs, or project details.
- Alert delivery is best-effort, bounded to four seconds. No alert or a failed alert must **never** mark an unsaved inquiry as received. Conversely, an email alert is not proof of a stored inquiry.
- Until alert configuration and an end-to-end email delivery test succeed, inspect Vercel private Blob **every business day**, regardless of whether alerts appear.
- Monitor email-provider spending, alert quota and rate-limit events before campaigns.

## Safe private records review
Use the Vercel dashboard: project `veyfront` > Storage > `veyfront-leads-private`.
The CLI script `scripts/lead-ops.mjs` requires a locally provisioned server-side `BLOB_READ_WRITE_TOKEN`. The token is **never** checked into GitHub.
- `node scripts/lead-ops.mjs list` enumerates inquiry object metadata only (path, date, size); not private customer fields.
- Handle an actual client data rights request only after independent identity verification and legal review. After finding and verifying the exact object pathname in the secure dashboard, run:
  `node scripts/lead-ops.mjs delete --path=inquiries/YYYY/MM/UUID.json --confirm=inquiries/YYYY/MM/UUID.json`
- Deletion is irreversible. The script explicitly refuses paths outside the inquiry namespace. Confirm completion with a second listing, and note action and requester identity privately. Do not automate deletion based on unverified email alone.
- If a request covers multiple records, identify all relevant records; one deletion does not fulfill a multi-record request.
- Do not place inquiry contents or server tokens in GitHub issues, email alerts, public analytics or console logs.

## Human handling
Assign a real owner and a backup; roles are **unassigned** until the operator selects them.
Record the following in a private tracker: `reference`, `service`, `receivedAt`, `owner`, `firstViewedAt`, `firstReplyAt`, `status`, `followupDueAt`, `deletionRequestId` if relevant. Never expose the private tracker publicly.
Minimum process: check daily on working days → identify new inquiry → reply privately → confirm scope and price in writing → record outcome → follow-up. Do not promise a particular response SLA unless an owner accepts it.
The stored JSON is an **initial receipt**, not a mutable CRM record.

## Spam and costs
Current API uses size checks, consent, field validation, Origin check and honeypot. These are not durable rate limits and can be bypassed by non-browser clients.
Vercel WAF supports a path-and-method rule for `POST /api/leads`, with fixed-window per-IP limiting. Recommend **10 requests / 60 seconds / IP** as an initial ceiling, but do not enable without reviewing Vercel rate limiting pricing and testing an initial log-only rule. This is a recommended configuration, **not active**.
Do not leak customer data in WAF logs. Keep notification billing and Blob usage under review.
For sustained bot attacks, consider provider-supported CAPTCHA/Turnstile and formal incident response.

## Release gate
- Legal registered operator / governing jurisdiction / privacy retention / cross-border transfers: PENDING.
- Ops owner and alternate: PENDING.
- Optional alert credentials: NOT CONFIGURED until confirmed in project settings.
- Website indexing and large-scale acquisition: STILL BLOCKED; leave robots noindex.
- Current forms should be treated as a monitored business pilot; no automatic website diagnosis, price acceptance or online purchase is implied.

## Verification
Run `pnpm check:commercial && pnpm check:ops && pnpm exec tsc --noEmit && pnpm build`. On a Vercel preview, verify GET /api/leads=405 and validation failures; do not create a live test lead unless needed, and do not accidentally delete real customer data.
