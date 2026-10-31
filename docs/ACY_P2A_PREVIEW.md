# VEYFRONT × L2M ACY P2-A Preview

Branch: `feature/acy-p2a-preview` (stacked on P1 Preview, **not main**).

## Integration
- `/p2` is a preview-only UI; `POST /api/acy/p2a` is a same-origin server proxy.
- Preview gate: `VERCEL_ENV=preview` **and** branch-scoped `ACY_P2A_ENABLED=true`.
- The browser only sends `{"snapshot":"qa-alt-treesite"}`; arbitrary URLs, private customer data and additional fields are refused.
- The server uses `L2M_ACY_P2A_URL`, `L2M_ACY_P2A_SERVICE_TOKEN` and optional `L2M_ACY_P2A_BYPASS` (Vercel protection header). These must NEVER have `NEXT_PUBLIC_` prefixes.
- Upstream is the independent L2M Preview service, running its existing `local_ingest` and new `acy_assessment` contract. This is real cross-repo service integration, but the underlying input is a synthetic local fixture. It is not live website analysis.
- Response must validate the narrow L2M contract: no model call, no generated site, no customer-ready claim, traceable SHA-256 on the observed pages and findings.
- Fail closed on invalid API input, missing backend configuration, non-HTTPS/non-Vercel endpoint, failed fetch, or contract mismatch.
- Never fall back to invented mock business findings, never call L2M G18.

## Tests & release constraints
`pnpm check:p2a`, `pnpm build`. An independent L2M test suite validates the upstream contract.
P2-A does not infer commercial value or deliver client sites. Customer URL crawling, SSRF
protection, licensing, prompt-injection defense, business-context/planner, data privacy and
customer report UX require separate acceptance before public access.
The production `veyfront.com` domain and the existing `/api/leads` contract are untouched.

## Status for review
P2-A1 = authenticated synthetic service and viewer. P2-A2 = secure approved public-URL
collection & truth-bound diagnosis (future). P2-B = Launch Blueprint (future).
