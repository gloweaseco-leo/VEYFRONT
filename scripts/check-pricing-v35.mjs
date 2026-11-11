import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const page = readFileSync('components/veyfront/pricing-v35.tsx', 'utf8')
const home = readFileSync('app/page.tsx', 'utf8')
const pricing = readFileSync('app/pricing/page.tsx', 'utf8')
const contact = readFileSync('components/veyfront/intake-pages.tsx', 'utf8')
const offers = JSON.parse(readFileSync('lib/public-offers.json', 'utf8'))
const terms = readFileSync('components/veyfront/policy-pages.tsx', 'utf8')
const form = readFileSync('components/veyfront/lead-form.tsx', 'utf8')

for (const marker of ['publicOffers.plans.start.priceDisplay','publicOffers.plans.sales.priceDisplay','publicOffers.plans.growth.priceDisplay','¥3,000', '3个月', '3次', '最多3处', '最多20家', '最多5家', '二选一', '30天', '首年'])
  assert.ok(page.includes(marker), 'V3.5 price/benefit guard missing: ' + marker)

assert.match(home, /<PricingTeaserV35\/>/)
assert.match(pricing, /<PricingV35 \/>/)
assert.doesNotMatch(home + pricing + page + terms, /¥9,800|SERVICES & PRICING · V3\.5|候选参考价/)
assert.deepEqual([offers.plans.start.price,offers.plans.sales.price,offers.plans.growth.price],[3680,6680,9680])
assert.match(terms, /publicOffers.plans.start.priceDisplay/)
assert.match(page, /'\/contact\?plan=' \+ plan.id/)
assert.match(contact, /candidate === 'start' \|\| candidate === 'sales' \|\| candidate === 'growth'/)
assert.match(contact, /defaultDetails=\{prefill\}/)
assert.match(form, /defaultDetails\?: string/)
assert.match(page, /不保证获得联系人|不承诺获得联系人/)
assert.match(page, /不承诺|不保证/)
const faqSection = page.split('const faqs:')[1]?.split('/** Mobile visitors')[0] || ''
assert.equal((faqSection.match(/\{ q: \[/g) || []).length, 13, 'FAQ count should be exactly 13')
for (const word of ['200多个产品型号','10、30、50条','第二年网站托管','CE、ISO','Google Ads','20家潜在买家'])
  assert.ok(faqSection.includes(word), 'Missing customer FAQ: '+word)
assert.match(page, /<details key=\{i\} className="group h-fit rounded-lg border border-ink\/15 bg-white\/75 p-5 open:bg-mist\/25"/, 'Preserve existing FAQ accordion styling')
console.log('VEYFRONT public three-tier pricing consistency PASS')
