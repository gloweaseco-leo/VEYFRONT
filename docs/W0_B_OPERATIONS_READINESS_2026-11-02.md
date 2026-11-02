# W0-B Operational readiness facts — 2026-11-02

**Status: PARTIAL; legal/operations release blocked.** Verified from live Vercel project environment-variable **metadata only**. No secret values were decrypted or copied.

## Reconciled notification baseline

| Server configuration key | Observed target | Conclusion |
|---|---|---|
| BLOB_READ_WRITE_TOKEN | production, preview, development | configured; live receipt persistence had historical synthetic test evidence on 2026-10-30 |
| RESEND_API_KEY | production only | configured; do not infer valid quota or successful delivery |
| VF_ALERT_FROM_EMAIL | production only | configured; sender domain and actual provider acceptance not checked |
| VF_ALERT_TO_EMAIL | production only | configured; actual recipient and human ownership not verified |

Production notifier runs only after successful Blob persistence; alert body contains reference, category and UTC time, no customer PII. Failed alert does **not** roll back receipt. Earlier docs saying "no email configured" were true at earlier milestones, not at 2026-11-02 audit. **No emails were sent during this review.**

## Concrete operational acceptance still required

1. Legal operator (registered legal entity, jurisdiction, invoicing jurisdiction, privacy contact and data retention/cross-border review) must be signed off by authorized human.
2. Name a human lead owner and backup; define access to private Vercel Blob and recorded daily review even if alerting fails.
3. One authorized, non-customer synthetic POST on **production** and authenticated Blob receipt inspection, plus inbox delivery observation. Do not paste personal information or tokens in GitHub. Existing 2026-10-30 synthetic storage proof is historic, not today's Resend proof.
4. Test non-success behavior (invalid origin, invalid consent, outage/503) without saving customer data; review abuse protection and provider cost limits.
5. Retain noindex and Draft PR until formal gate approvals. An environment variable's existence is neither deliverability nor legal compliance.
6. Keep evidence in private operator register; only record non-PII run identifiers and signatures in public PR.

## Non-automatable approvals

Legal operator: PENDING.
Primary lead operator: PENDING.
Backup lead operator: PENDING.
Confirmed email delivery: PENDING.
Retention/deletion/cross-border policy acceptance: PENDING.

**W0-B cannot PASS based on existing code, metadata, previous synthetic storage test or CI alone.**
