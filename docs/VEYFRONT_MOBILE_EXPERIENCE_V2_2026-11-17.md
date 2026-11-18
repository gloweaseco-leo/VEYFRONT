# VEYFRONT | Mobile Experience V2 | 2026-11-17

Status: **Preview candidate only**. No production merge / DNS / price / service contract change.
Baseline: main 5924d64043b2a8c7b34f22b08b89e39249837c2e.

## Reason for change
Real Android/WeChat mobile screenshot showed excessive whitespace beneath buyer-scenario descriptions, gray-on-gray cards, and low mobile information density. Existing card layout forced 310px minimum height at every breakpoint and used flex-grow on body paragraphs.

## Mobile UX changes
- Buyer-scenario cards have content-driven height under lg; card 1 uses a dark-ink brand surface with lime CTA, other cards white / light mist. Every card keeps a distinct consultation path.
- Mobile hero prioritizes value proposition, concise action pair, pricing and a smaller version of the existing animated preview. Desktop content and product facts are preserved.
- Capabilities, proof, delivery cards, section spacing and mobile transformation viewport reduce wasted vertical space; accessibility and reduced-motion controls remain.
- Three tier tabs display prices prominently; desktop price table, 10/30/50 product cap, three-month service / first-year hosting terms and business restrictions are unchanged.
- WeCom card displays the verified real contact URL first, allows a mobile-only toggle for the existing QR asset, and preserves the inquiry form as fallback. Do not treat link clicks as completed friend adds.
- Bottom nav retains four destinations on all supported public pages, including the intake form; it hides on focused text controls and respects the device safe area.

## Boundaries
No changes to Lead POST API, consent, storage, alerts, the email destination, source ownership promises, actual client evidence, fictional demo facts, SEO canonical strategy, prices, VRAE, L2M, or production domain. No fake service claims.

## Verification
Static guard scripts/check-mobile-v1.mjs now validates V2 contracts; script path intentionally retained for package/build compatibility.
The browser smoke script scripts/check-w0-w1-browser.py has been updated to test the *current* Chinese-root/English-/en canonical architecture and mobile layouts rather than asserting historical /zh, noindex preview or ¥9,800 prices. It does not submit real leads.
Recommended review screens: 320, 360, 390, 430, 768 and 1440 CSS px; include WeChat Android, Chrome Android and iOS Safari where available.
Approval requires successful Vercel Preview build and actual mobile-browser validation before any main merge. The preview must not automatically promote to production.
