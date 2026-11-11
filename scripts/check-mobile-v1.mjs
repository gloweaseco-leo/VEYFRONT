import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const read = path => readFileSync(new URL('../' + path, import.meta.url), 'utf8')
const nav = read('components/veyfront/mobile-quick-nav.tsx')
const layout = read('app/layout.tsx')
const price = read('components/veyfront/pricing-v35.tsx')
const hero = read('components/home/hero.tsx')
const header = read('components/l2m/site-header.tsx')
const brand = read('components/l2m/brand.tsx')
const contact = read('components/veyfront/wecom-contact.tsx')
const form = read('components/veyfront/lead-form.tsx')
const css = read('app/globals.css')
let assertions = 0
function check(description, fn) {
  fn()
  assertions++
  console.log('PASS mobile: ' + description)
}

check('root layout includes quick nav within locale provider', () => {
  assert.match(layout, /<LangProvider[^>]*>[\s\S]*<MobileQuickNav\s*\/>[\s\S]*<\/LangProvider>/)
})
check('nav is mobile-only and respects safe-area', () => {
  assert.match(nav, /data-testid="mobile-quick-nav"/)
  assert.match(nav, /md:hidden/)
  assert.match(nav, /env\(safe-area-inset-bottom\)/)
  assert.match(nav, /aria-label=\{zh \? '手机快捷导航'/)
  assert.match(nav, /aria-current=/)
})
check('project-choice sheet goes to existing intake routes', () => {
  assert.match(nav, /role="dialog" aria-modal="true"/)
  assert.match(nav, /href="\/start\/launch"/)
  assert.match(nav, /href="\/start\/rebuild"/)
  assert.match(nav, /event.key === 'Escape'/)
})
check('contact actions remain grounded in real WeCom URL or contact form', () => {
  assert.match(nav, /WECOM_CONTACT_URL/)
  assert.match(nav, /recordWecomIntent\('mobile_nav'\)/)
  assert.match(nav, /href="\/contact"/)
  assert.doesNotMatch(nav, /checkout|diagnos(e|is)Complete|friendAdded/i)
  assert.match(contact, /order-1 inline-flex/)
})
check('mobile plan switcher keeps all 3 fixed offer prices and maps to lead handoff', () => {
  for (const priceValue of ['3,680','6,680','9,680']) assert.ok(price.includes(priceValue), priceValue)
  assert.match(price, /data-testid="mobile-plan-tabs"/)
  assert.match(price, /data-testid="mobile-plan-detail"/)
  assert.match(price, /'\/contact\?plan=' \+ plan\.id/)
})
check('mobile service comparison uses the same source data as desktop', () => {
  assert.match(price, /data-testid="mobile-service-comparison"/)
  assert.match(price, /group\.rows\.map\(row/)
  assert.match(price, /row\.cells\[index\]/)
  assert.match(price, /hidden overflow-x-auto[^"]*md:block/)
})
check('mobile lead form uses actual validated submission and usable inputs', () => {
  assert.match(form, /fetch\('\/api\/leads'/)
  assert.match(form, /type="email" inputMode="email"/)
  assert.match(form, /type="url" inputMode="url" autoCapitalize="none"/)
  assert.match(form, /min-h-12 w-full items-center justify-center/)
  assert.match(form, /validateContactDetails/)
})
check('small-screen hero and header retain accessible navigation', () => {
  assert.match(hero, /gap-8 px-5 py-10 sm:gap-12/)
  assert.match(header, /aria-expanded=\{open\}/)
  assert.match(brand, /min-\[360px\]:w-\[148px\]/)
})
check('mobile keyboard focus hides fixed bottom actions', () => {
  assert.match(css, /body:has\(input:focus, textarea:focus, select:focus/)
  assert.match(css, /\.vf-mobile-nav-shell/)
})
console.log('Mobile Experience V1 contract: ' + assertions + '/' + assertions + ' PASS')
