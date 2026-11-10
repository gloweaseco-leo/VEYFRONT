import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const page = readFileSync('components/veyfront/pricing-v35.tsx', 'utf8')
const home = readFileSync('app/page.tsx', 'utf8')
const pricing = readFileSync('app/pricing/page.tsx', 'utf8')
const contact = readFileSync('components/veyfront/intake-pages.tsx', 'utf8')
const form = readFileSync('components/veyfront/lead-form.tsx', 'utf8')

for (const marker of ["price: '3,680'", "price: '6,680'", "price: '9,680'", '¥3,000', '3个月', '3次', '最多3处', '最多20家', '最多5家', '二选一', '30天', '首年', 'V3.5'])
  assert.ok(page.includes(marker), 'V3.5 price/benefit guard missing: ' + marker)

assert.match(home, /<PricingTeaserV35\/>/)
assert.match(pricing, /<PricingV35 \/>/)
assert.doesNotMatch(home + pricing, /¥9,800|CommercialOffers/)
assert.match(page, /'\/contact\?plan=' \+ plan.id/)
assert.match(contact, /candidate === 'start' \|\| candidate === 'sales' \|\| candidate === 'growth'/)
assert.match(contact, /defaultDetails=\{prefill\}/)
assert.match(form, /defaultDetails\?: string/)
assert.match(page, /不保证获得联系人|不承诺获得联系人/)
assert.match(page, /不承诺|不保证/)
console.log('VEYFRONT V3.5 pricing static contract PASS (commercial approval remains separate)')
