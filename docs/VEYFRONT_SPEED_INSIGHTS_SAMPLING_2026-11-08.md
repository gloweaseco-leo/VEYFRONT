# VEYFRONT low-traffic Speed Insights sampling adjustment — 2026-11-08

## Grounded facts
- Actual production Chrome read-only probe matched Vercel SDK by `data-sdkn=@vercel/speed-insights/next` across EN/ZH home and pricing routes and verified the dynamically routed SDK script was HTTP 200. Script and endpoint URLs are randomized under Vercel Speed Insights 2.x. A URL substring-only probe previously produced false negatives and was corrected in diagnostic PR #19.
- Vercel Hobby team plan confirmed by project connector, and official Hobby Speed Insights allowance is 10,000 datapoints per month. At the free-tier limit recording pauses; no paid plan/feature is enabled as part of this change.
- The original 25% sample rate makes a small number of real visitors statistically unlikely to produce early metrics. Automated headless tests are excluded by vendor script; they cannot validate actual metric ingestion.

## Minimal correction
- Increase SpeedInsights sampleRate from 0.25 to 1.0, keeping the same first-party SDK, Vercel dynamic endpoint, existing website and contact flows.
- No synthetic performance events, no billing plan upgrade, no new tracking provider or PII collection. Only real visitors will produce eligible samples.
- Verify 100% sample attribute in built Next.js Chrome, full bilingual browser regression, and production `data-sample-rate` after release.

## Acceptance boundary
- Script load and dataset in real production: verifiable automatically by read-only Chrome.
- Verified real-user metric intake and dashboard data: only confirmed when a real human visit generates sampled events and Vercel shows nonzero datapoints. Browser automation cannot establish this. Do not claim it's complete merely because injection/network GET is 200.
- Monitor Hobby usage and lower sample rate if sustained traffic approaches free allocation.