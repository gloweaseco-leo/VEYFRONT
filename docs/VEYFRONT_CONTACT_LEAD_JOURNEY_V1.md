# VEYFRONT Contact & Lead Journey V1.0 · L1–L3
Status: **Preview implementation; not a claim of configured WeCom or completed production acceptance.**

## Decision and boundaries
- Chinese contact: WeCom QR (when configured) + independent formal inquiry form + retained email.
- English contact: project form/email retained; no forced WeCom entry.
- Launch and Rebuild intake, existing storage and original VF references preserved. No CRM or SCRM.
- WeCom click/QR reveal **does not mean** scan, friend-add or confirmed contact. Manual operator confirmation is the source of truth for new WeCom contacts.
- L4 API/webhook synchronization, account routing and L5 conversion dashboard are intentionally **not implemented**.
- Never place visitor WeChat handles, phone numbers, raw chats or personal identity in public analytics, GitHub or alerts.

## Go-live prerequisites
1. Set up a real enterprise WeCom account with a named owner and backup.
2. Obtain permission to publish its true external-contact QR image, add an optimized raster asset at `public/contact/<approved-name>.png`, and test an actual add in WeChat on mobile.
3. Set `NEXT_PUBLIC_VF_WECOM_QR_PATH=/contact/<approved-name>.png` for the relevant Vercel environment. Without the setting, **no QR is displayed, and the navigation uses '联系顾问' rather than promising WeCom service**. Setting the variable without the file is a broken configuration; review both together.
4. Confirm operator, privacy data retention and cross-border arrangements, actual staffing and alert monitoring before public promotion. Do not promise 24/7 or a response time.
5. Preview/production flags are separate; inspect the Preview first, then authorize any main/production promotion explicitly.

## Public website journey
1. Visitor opens `/zh/contact`: WeCom card (if configured) and a general project form are independent paths.
2. Navigation CTA opens a compact QR panel only when QR is configured. Header, footer, homepage and Launch/Rebuild links lead to contact otherwise.
3. Form asks for name, at least one contact method (WeChat ID/phone/email), company, site details, and explicit privacy consent. A preferred method can be selected but its corresponding field must be filled. Privacy data requests continue to require verified-by-follow-up **email entry**; the form itself does not establish the requester's identity.
4. Server validates all fields again, writes private Blob, returns reference. Email acknowledgment only attempted when an email was supplied and the prior explicit email-confirmation feature flag allows it. Alerts contain reference only.

## Operator-only manual WeCom intake and follow-up
This helper requires a securely provisioned `BLOB_READ_WRITE_TOKEN`; run only in an authorized operator environment, not a public Vercel route or browser. Supply JSON through private stdin, not CLI flags or tracked files. Do not copy chat transcripts, secrets or identities into project notes.

- `node scripts/contact-ops.mjs register-wecom` accepts JSON from stdin with `confirmedContact:true`, `service:"general"|"launch"|"rebuild"`, `owner`, `summary` (10–1200 chars), and optionally `name`, `company`, `wechat`, `phone`, `email`, `nextAction`, `followupDueAt` (ISO date). The operator must actually have contacted the client, not merely seen a QR click.
- The receipt is stored under the **same private `inquiries/YYYY/MM/UUID.json` namespace** and returns a `VF-` reference. Its `source` is `wecom-manual`; it does not falsely assert website form consent.
- `node scripts/contact-ops.mjs transition` takes `reference`, `status` (`contacted`, `qualified`, `proposal`, `won`, `lost`, `followup`), `owner`, optional `nextAction`, `followupDueAt`. This appends a private `inquiry-events/YYYY/MM/UUID.json` status event. Events are **not** a transactional CRM or a validated update of a parent record; manually verify references and keep access restricted.
- For example, use `node scripts/contact-ops.mjs register-wecom < /secure/operator/wecom-lead.json`. Never commit the input file; restrict its permissions and remove it after use. Use a secret-aware operational environment, not GitHub Actions.
- Existing `scripts/lead-ops.mjs list` lists inquiry metadata only, including manually registered WeCom leads. Its deletion command covers inquiry records, **not** sidecar follow-up events. Before fulfilling verified deletion rights, identify and remove all related private records according to the approved retention workflow; sidecar event deletion needs separate controlled handling. Do not claim comprehensive deletion from one command.

## Metrics and truth levels
| Metric | Evidence | Status |
| --- | --- | --- |
| WeCom interest | `wecom_contact_intent` non-PII Vercel Analytics custom event, only when supported/enabled | Event emitted; reporting setup/provider support must be verified |
| Confirmed contacts | Operator-confirmed manual WeCom lead receipts | Private records; not automatically inferred from clicks |
| Qualified leads | Manual `qualified` status events in private store | Requires disciplined operator review |
| Proposal conversion | Manual `proposal` status events divided by qualified leads | No automatic dashboard |

Existing WAF/rate-limit and data handling operational gates still apply. QR and form access must be checked on real iOS/Android devices for save/scan behavior, particularly in WeChat's embedded browser.
