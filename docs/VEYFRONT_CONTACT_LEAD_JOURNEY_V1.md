# VEYFRONT Contact & Lead Journey V1.0 · L1–L3
Status: **Operator QR integration complete in branch. External WeCom friend-add and real lead delivery still require live verification.**

## Decision and boundaries
- Chinese contact: real operator-supplied WeCom QR + official decoded contact URL + independent formal inquiry form + retained email.
- English contact: project form/email retained; no forced WeCom entry.
- Launch and Rebuild intake, existing storage and original VF references preserved. No CRM or SCRM.
- WeCom click/QR reveal **does not mean** scan, friend-add or confirmed contact. Manual operator confirmation is the source of truth for new WeCom contacts.
- L4 API/webhook synchronization, account routing and L5 conversion dashboard are intentionally **not implemented**.
- Never place visitor WeChat handles, phone numbers, raw chats or personal identity in public analytics, GitHub or alerts.

## Go-live prerequisites
1. The operator supplied the actual WeCom contact QR on 2026-11-04. Source JPEG and optimized 1-bit PNG both decode to the same official `work.weixin.qq.com` URL. The PNG is stored in `public/contact/veyfront-wecom.png` with an immutable SHA-256 guard. No additional Vercel QR environment variable is required.
2. Confirm a staffed enterprise WeCom reception account with a named owner/backup and run a real phone-to-WeCom friend-add test. The official URL and mobile browser handling are not guaranteed by a local QR decode or browser mock.
3. Confirm operator, privacy retention and cross-border handling, and monitor the private lead inbox. Do not promise 24/7 or a response time.
4. Keep English site form/email first, maintain distinct Preview and Production environments, and check the actual deployed domain after merge.

## Public website journey
1. Visitor opens `/zh/contact`: the actual WeCom QR is directly visible alongside the independent project inquiry form.
2. Chinese navigation CTA opens the QR panel; homepage, footer, Launch and Rebuild lead to contact. Mobile visitors may use a first-party hosted QR image or the official URL decoded from the operator QR.
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
