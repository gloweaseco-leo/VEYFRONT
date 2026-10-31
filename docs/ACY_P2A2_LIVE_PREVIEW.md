# VEYFRONT × L2M P2-A2 live homepage QA

Stacked on `feature/acy-p2a-preview`. Preview-only; **never merge to main or release to veyfront.com without separate authorization**.

`/p2a2` and `POST /api/acy/p2a2` require `VERCEL_ENV=preview` and branch-scoped `ACY_P2A2_ENABLED=true`. They accept exactly `https://veyfront.com/` with an explicit rights confirmation. No arbitrary URL, no contact data, no AI model calls, price/offer, or generation.

The same-origin server route sends the request to L2M's protected `/api/acy_url_assess` using server-only `L2M_ACY_P2A2_URL`, `L2M_ACY_P2A2_SERVICE_TOKEN`, optional `L2M_ACY_P2A2_BYPASS`. Never use NEXT_PUBLIC_ prefixes. The L2M service independently enforces its Preview flag and approved-host allowlist. A strict version 0.2 contract validator rejects source mismatch and fabricated commercial readiness.

`pnpm check:p2a2`, `pnpm build`. Verification must include authenticated browser POST plus server-to-server live POST, not just GET or Vercel READY. Vercel Authentication must remain on.

Pending gates: branch-scoped preview secrets and flags, deployment build/CI, independently authenticated POST, 1-page HTML sample evidence, P1 create/resume/status browser E2E, abuse/rate control, owner identity validation and full context/planner truth gates. P4 generation remains locked.
