# Speed Insights mounting correction candidate (November 7, 2026)

Read-only CI against real production on November 8 UTC found no Speed Insights injected script on /zh or /zh/pricing. The installed vendor SDK source injects in a React effect if mounted and the route is not null; headless filtering occurs in loaded client code, not this injection function.

Existing production JSX used a custom VERCEL_ENV === production gate. This is a strong suspected cause but the exact false condition is not yet proved.

Candidate follows official Vercel integration: mount SpeedInsights with rate 0.25 without custom VERCEL_ENV guard. The deployment platform selects proper endpoint.

Run CI on a production-mode Next.js server in Chrome, asserting script injection and data attributes. Localhost cannot accept actual /vitals events, so this is not a real-user ingestion test.

Keep draft until CI and Vercel Preview pass. Do not merge or publish without release approval. After eventual production release, rerun independent browser probe, and confirm at least one legitimate dashboard metric, without synthetic forged events.