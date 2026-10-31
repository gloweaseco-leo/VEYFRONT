# VEYFRONT Commercial Closure V1.0 — operational handoff

**Status:** First production intake implemented and validated on 2026-10-30; not a full L2M diagnosis/payment service. Broad public promotion is NOT approved.

## Customer journeys

- `/start/launch`: true project inquiry for creating a new B2B website
- `/start/rebuild`: true project inquiry for upgrading an existing website; requests a public URL, **not** an AI diagnosis
- `/contact`: general business inquiries
- `/contact/privacy`: data-access or deletion requests
- `/privacy` and `/terms`: bilingual legal-notice drafts. Both MUST be reviewed and supplemented with the actual operating entity's details before wider public acquisition.

On successful submission, the server writes a private JSON blob and returns a short `VF-XXXXXXXX` reference. On failure it returns 4xx/503; the browser does not display success.

## Infrastructure and data protection

- Vercel project: `veyfront`
- Private Vercel Blob store: `store_UEpSGWp9TlSF4niP`, region `iad1`
- `BLOB_READ_WRITE_TOKEN` is connected as an **encrypted server-side environment variable**. Never expose it through `NEXT_PUBLIC_*`, page markup, or client-side code.
- Files saved to `inquiries/YYYY/MM/<randomUUID>.json`. The object path contains **no personal identifiers**.
- Data fields: contact name, email, company, public website address, target markets, request, consent version, date, reference, service and 'new' status. IP/browser fingerprints are not deliberately saved.
- **No public API exists for listing or downloading incoming inquiries**. Admins inspect private blobs using Vercel project Storage dashboard or authenticated `vercel blob list/get` with the project's server credentials.
- No email or Slack alert is currently connected. The operations owner must actively check the private store for new inquiries; do not promise automatic notifications.
- Storage usage can incur charges on Vercel. Monitor store volume and usage; do not collect files or attachments.
- Do not place customer details in GitHub issues or application logs.

## Intake operations (until notifications are enabled)

1. Sign into Vercel, select project `veyfront` → Storage → `veyfront-leads-private`.
2. Review new `inquiries/` objects at least once each business day.
3. Match the `reference` to the private JSON contents, triage to Launch, Rebuild, General or Privacy.
4. Reply to the contact using the provided email, confirm scope explicitly. Record the status in your private operations system; the JSON's stored `status:'new'` is just initial state.
5. Handle deletion/correction requests with an authorized owner, including removing corresponding blobs.
6. Track anti-spam activity and enable durable rate limiting/CAPTCHA/WAF before large traffic campaigns. Current controls are input limits, same-origin checks, and a honeypot, **not a full abuse-prevention system**.
7. No automated lifecycle expiry or SLA has been implemented. Do not imply otherwise.

## Verification before merging or indexing

- `pnpm install --frozen-lockfile`
- `pnpm exec tsc --noEmit`, `pnpm build`, brand static guard, new intake guard
- 1440/768/390/360 browsers, EN/ZH, menu, links, consent
- Verify GET `/api/leads` is blocked, invalid email/URL/consent rejected, live test POST stores private blob and returns reference.
- Verify **no API exposes uploaded details**; verify failed backend request cannot show success.
- Confirm registered operating entity, privacy request handling, applicable cross-border rules, and Vercel usage cost budget.
- Keep `noindex` and Draft PR until commercial operator + legal/privacy approvals.
- Existing Hartwell fictional demo and SAMPLE pricing remain clearly labeled; do not equate the inquiry endpoint with actual L2M generation or a purchase.

No project, contract, paid conversion, business results, customer references or completed L2M generation are implied by this feature.


## Actual online acceptance evidence (2026-10-30)

- Source: `feature/veyfront-commercial-closure-v1`, SHA `3a10a7f3ea82d6e29a10075dd0c39926c850a80d`.
- Vercel preview build: READY; strict TypeScript validation PASS.
- Vercel production deployment: `dpl_H7bvYN36tsfez2YMJsmH6PMdh6gd`, READY, `veyfront.com`.
- Live GET: `/`, `/contact`, `/privacy`, `/terms`, `/contact/privacy`, `/start/launch`, `/start/rebuild` returned HTTP 200.
- GET `/api/leads` returned 405.
- POST invalid email returned 422, invalid origin returned 403, missing consent returned 422.
- POST of fictional QA-only Rebuild request returned HTTP 201 and reference `VF-DAE82C80`. Vercel authenticated PRIVATE Blob list showed exactly one `inquiries/2026/10/*.json` object (430 bytes). No real customer's information was used.
- These tests confirm private persistence. They do NOT prove human email notifications, CRM routing, durable rate limiting or automated deletion, none of which is connected.
- `noindex` retained pending verified legal operating entity and privacy-compliance sign-off.


## Operations hardening extension (2026-10-31)

Optional no-PII email alert, safe local/private Blob metadata review and explicit deletion helper are implemented on an **ops hardening branch**. These controls require configuration and human validation: no mail provider credentials are installed by this commit, and no legal operator has been chosen. See `docs/VEYFRONT_INQUIRY_OPERATIONS_V1.md`. Vercel WAF rate limiting remains an unactivated recommendation pending pricing/traffic observation.
