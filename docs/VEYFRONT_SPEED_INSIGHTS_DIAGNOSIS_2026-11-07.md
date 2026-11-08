# VEYFRONT Speed Insights: no-event diagnosis (2026-11-07)
This independent branch adds **read-only** CI validation of *the current production deployment*, not a replacement analytics collector.

Evidence from owner PDF (November 7): Speed Insights UI says **No events collected**, 0 entries, despite the prior Enable and redeploy. There is no evidence the owner's browser caused the issue.

Current production code on main (verified):
- \`@vercel/speed-insights@2.0.0\` dependency installed in package.json.
- \`<SpeedInsights sampleRate={0.25} />\` appears in \`app/layout.tsx\` under \`process.env.VERCEL_ENV === 'production'\`.
- Vercel production deployment READY at commit \`1fb6c7abdac83f362db5e33bb3e473134324f734\`.
- Public \`/_vercel/speed-insights/script.js\` returns JavaScript via read-only fetch.
- A **GET** to \`/_vercel/speed-insights/vitals\` returned 404; this does not prove the actual POST intake fails. Vercel v2 can use dynamic intake URLs.

Important limitations:
- \`navigator.webdriver\` and Headless user agents can trigger filtering in the vendor's client script; headless CI must **NOT** be used to assert that \`vitals\` collection works or fails.
- Only a legitimate, sampled real-user visit with a 2xx payload POST and corresponding Vercel count can confirm a complete ingest chain.
- \`sampleRate={0.25}\` means an independent visitor may not produce events; low traffic and ad-blockers are possible, but currently not proven causes. Do not silently change to 100% or incur extra metrics fees.
- Vercel's Observability API queried for Speed Insights event counts returned HTTP 400, so it cannot independently verify metrics through the available connector. The dashboard PDF is the strongest current evidence of zero collected events.
- Independent paid cloud browser run was blocked by insufficient TinyFish wallet balance; no browser session was started or charged.

This branch's Playwright diagnostic reads public content, checks actual script injection, records HTTP 200 for script, JavaScript errors, webdriver flags and resource timing. It does not send forged metrics or identify customers.
Next decision: if live script is not injected, prioritize server/component gate. If script injected and loaded, verify with a natural authorized real visit or the officially supported platform ingestion telemetry; don't attribute the failure to the user's computer.
