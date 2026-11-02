# VEYFRONT W0 — Production and Commercial Baseline V1.0

2026-11-02. Status: CANDIDATE, NOT CLOSED. This document is a review artifact, not authorization to launch.

## Git/hosting baseline (verified from connector)

- VEYFRONT main SHA: 527e86bdc9a13754b45c8b3154ff6953bd6a27eb.
- Last observed Vercel production READY deployment dpl_1HfoWx9jJhbhEb7PgzKGQnsLGnqE was linked to that SHA. READY alone is not complete browser acceptance.
- L2M master SHA: ee718a68c2d57942886b641d9795014cb0eb39ee. Experimental Draft chain cannot be inferred from master.
- T-RAS main SHA: 3d7d611bf5075c55ff9e205158fb222e3c64dc30.
- VEYFRONT has 6 open Draft PRs (#5-#10), L2M has 21 open PRs. Each dependent PR requires its own exact-head review.
- Branch protection was NOT enabled on these defaults at audit; a GitHub administrator must configure and verify required PR review and CI. Current connector may lack repo administration permission.
- Production noindex stays enabled pending legal/operator/marketing gate.
- Domain veyfrond.com is attached in Vercel; do not assume redirect or ownership approval.

## Release policy

1. main is the only live VEYFRONT code baseline. This work is on a separate Draft PR; no production release by default.
2. Required checks: demo guard, brand guard, commercial/security/ops guards, W0/W1 catalog guard, TypeScript and full Next production build.
3. Pre-promotion QA: EN/ZH, viewport widths 1440/768/390/360, all navigation and CTA paths, /pricing, /start/launch, /start/rebuild, positive/negative submission, storage and human intake, source/dependency handover.
4. Document and test rollback to prior accepted READY production deployment. Do not release without an identified recovery operator.
5. P1/P2 remain preview-gated and cannot be advertised as customer-complete without exact-head browser E2E.
6. P3/P4 online quotation, payment, auto-generation and auto-delivery remain frozen. Humans may legally quote and deliver under signed contracts.
7. No automated SEO/GEO ranking, inquiry-volume or sales promises.

## Operations truth

- Live inquiry POST writes PRIVATE Vercel Blob and returns a reference only on success.
- Alert code is optional; verified sender + configured variables + test message delivery are not proven by source code. Assign primary and backup lead owner; until then, private storage daily inspection is required.
- Main domain legal operator, privacy retention/deletion/cross-border policies and consent notice need approval.
- Real production browser acceptance, noindex removal and acquisition campaign activation require independent approval.
- Hartwell is fictional; T-RAS case publication requires client authorization and attribution checking.

## Exit gates (start PENDING)

W0-A VERSION: exact git/production SHA, PR governance, CI run, browser QA and rollback evidence. PENDING.
W0-B OPS: approved operator, privacy/retention, lead primary/backup, authentic intake and exception handling. PENDING.
W1-A PRODUCT: signed Launch/Rebuild/Run specs, scope/change/acceptance and delivery responsibility. PENDING.
W1-B ECONOMICS: cost review, price and tax signoff, actual quote/contract template approved. PENDING.
W1-C DRY RUN: synthetic lead → assigned intake → scoped quote → written agreement/milestones (no real payment) → handover checklist, all with owner and reference. PENDING.

CLOSE W0 only after W0-A and W0-B both PASS. CLOSE W1 only after W1-A, W1-B and W1-C all PASS. Wide public promotion requires all five evidence-backed approvals.
