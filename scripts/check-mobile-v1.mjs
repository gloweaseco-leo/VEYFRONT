import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const read = path => readFileSync(new URL('../' + path, import.meta.url), 'utf8')
const nav = read('components/veyfront/mobile-quick-nav.tsx')
const layout = read('app/layout.tsx')
const cards = read('components/home/customer-scenarios.tsx')
const capabilities = read('components/home/buyer-capabilities.tsx')
const hero = read('components/home/hero.tsx')
const journey = read('components/veyfront/journey-steps.tsx')
const price = read('components/veyfront/pricing-v35.tsx')
const publicOffers = JSON.parse(read('lib/public-offers.json'))
const header = read('components/l2m/site-header.tsx')
const brand = read('components/l2m/brand.tsx')
const contact = read('components/veyfront/wecom-contact.tsx')
const intake = read('components/veyfront/intake-pages.tsx')
const form = read('components/veyfront/lead-form.tsx')
const css = read('app/globals.css')

let assertions = 0
function check(description, fn) {
  fn()
  assertions++
  console.log('PASS mobile-v2: ' + description)
}

check('mobile navigation stays inside locale provider with safe area', () => {
  assert.match(layout, /<LangProvider[^>]*>[\s\S]*<MobileQuickNav\s*\/>[\s\S]*<\/LangProvider>/)
  assert.match(nav, /data-testid="mobile-quick-nav"/)
  assert.match(nav, /md:hidden/)
  assert.match(nav, /env\(safe-area-inset-bottom\)/)
  assert.match(nav, /aria-current=/)
})
check('four stable mobile navigation actions survive form routes', () => {
  assert.match(nav, /<button type="button" ref=\{triggerRef\}/)
  assert.doesNotMatch(nav, /!inForm/)
  assert.match(nav, /href="\/pricing"/)
  assert.match(nav, /href="\/start\/launch"/)
  assert.match(nav, /href="\/start\/rebuild"/)
  assert.match(nav, /role="dialog" aria-modal="true"/)
  assert.match(nav, /event.key === 'Escape'/)
})
check('verified WeCom QR opens in-site without old direct URL', () => {
  assert.match(nav, /href="\/contact#wechat"/)
  assert.doesNotMatch(nav, /WECOM_CONTACT_URL/)
  assert.match(nav, /recordWecomIntent\('mobile_nav'\)/)
  assert.match(contact, /useState\(true\)/)
  assert.doesNotMatch(contact, /WECOM_CONTACT_URL/)
  assert.match(contact, /aria-expanded=\{showQr\}/)
  assert.match(contact, /setShowQr/)
  assert.match(contact, /vf-wecom-qr/)
  assert.match(contact, /src=\{qr\}/)
  assert.doesNotMatch(nav, /friendAdded\s*=\s*true|paymentCompleted|diagnosisComplete/)
})
check('buyer cards are compact on mobile and retain large-screen sizing', () => {
  assert.match(cards, /data-testid="mobile-scenario-card"/)
  assert.match(cards, /data-testid="mobile-scenario-description"/)
  assert.match(cards, /data-testid="mobile-scenario-action"/)
  assert.match(cards, /lg:min-h-\[310px\]/)
  assert.doesNotMatch(cards, /flex min-h-\[310px\]/)
  assert.match(cards, /index === 0 \? 'border-ink bg-ink text-ivory/)
})
check('mobile hero has two clear actions and preserves original demo', () => {
  assert.match(hero, /gap-6 px-4 py-8 sm:gap-12/)
  assert.match(hero, /grid grid-cols-2 gap-2\.5 sm:flex/)
  assert.match(hero, /h-\[245px\]/)
  assert.match(hero, /data-testid="hero-hybrid-panel"/)
  assert.match(hero, /data-testid="hero-site-before"/)
  assert.match(hero, /data-testid="hero-site-after"/)
})
check('mobile capability and delivery cards shorten reading flow', () => {
  assert.match(capabilities, /flex items-start gap-4 rounded-xl/)
  assert.match(journey, /items-start gap-4 rounded-xl/)
  assert.match(journey, /md:flex-col/)
})
check('all three published offers and buyer-facing rules are unchanged', () => {
  for (const [tier,amount,cap] of [['start',3680,10],['sales',6680,30],['growth',9680,50]]) {
    assert.equal(publicOffers.plans[tier].price, amount)
    assert.equal(publicOffers.plans[tier].productRecordCap, cap)
  }
  assert.equal(publicOffers.hostingMonthsIncluded,12)
  assert.equal(publicOffers.serviceMonthsIncluded,3)
  assert.match(price, /data-testid="mobile-plan-tabs"/)
  assert.match(price, /data-testid="mobile-plan-detail"/)
  assert.match(price, /data-testid="mobile-service-comparison"/)
  assert.match(price, /row\.cells\[index\]/)
  assert.match(price, /'\/contact\?plan=' \+ plan\.id/)
})
check('contact form uses validated real API, not simulated submissions', () => {
  assert.match(intake, /<LeadForm service="general" defaultDetails=\{prefill\}/)
  assert.match(form, /fetch\('\/api\/leads'/)
  assert.match(form, /validateContactDetails/)
  assert.match(form, /type="email" inputMode="email"/)
  assert.match(form, /type="url" inputMode="url" autoCapitalize="none"/)
  assert.match(form, /min-h-12 w-full items-center justify-center/)
})
check('language and keyboard/safe-area protection stay intact', () => {
  assert.match(header, /aria-expanded=\{open\}/)
  assert.match(brand, /min-\[360px\]:w-\[148px\]/)
  assert.match(css, /body:has\(input:focus, textarea:focus, select:focus/)
  assert.match(css, /\.vf-mobile-nav-shell/)
})
console.log('Mobile Experience V2 static contract: ' + assertions + '/' + assertions + ' PASS')
