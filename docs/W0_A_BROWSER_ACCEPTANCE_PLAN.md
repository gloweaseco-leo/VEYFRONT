# W0-A Browser Acceptance Plan & Constraints
Date: 2026-11-02. On feature/w0-w1-commercial-closure-v1.

## Test scope
In GitHub CI: build exact branch commit; launch actual `pnpm start`; run headless Chrome on localhost; test 1440/768/390/360 widths, English and Chinese, routes home/pricing/services/how-it-works/start/launch/start/rebuild. Assert actual offer values, noindex, valid package CTA routes, required intake fields, native empty-form rejection and no viewport horizontal overflow. Do **not** send customer or synthetic contacts to production Blob.

Tooling: Python Playwright driver using existing Chrome binary in GitHub runner; no new JS production dependencies. Save screenshots of home/pricing in English and Chinese plus JSON checks to GitHub Actions artifact `w0-w1-browser-evidence`. CI step fails on any failed assertion.

## Distinction from Vercel protected Preview
Vercel preview deployment currently enforces authentication; unauthenticated reads returned login_required. Local CI browser E2E is legitimate **real browser** acceptance of the exact code commit, but not a replacement for authenticated protected Vercel browser acceptance or live lead backend acceptance.

## W0-A exit gate
CI screenshot and JSON check PASS is required. Still require branch protection/ruleset enforcement, authenticated protected preview smoke and production rollback operator authorization. Only independent reviewer and commercial owner may sign off W0-A as PASS.

## W1-A exit gate
Product/price/scope docs and UX paths can be validated by the browser, but W1-A is not PASS without accountable product + delivery-owner approval and a signed scope freeze. Proposal pricing must not be silently promoted to legally binding amounts.
