import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
const read=p=>readFileSync(p,'utf8')
const catalog=JSON.parse(read('lib/public-offers.json'))
assert.equal(catalog.status,'PUBLISHED_REFERENCE_PRICES')
assert.deepEqual(['start','sales','growth'].map(id=>catalog.plans[id].price),[3680,6680,9680])
assert.deepEqual(['start','sales','growth'].map(id=>catalog.plans[id].productRecordCap),[10,30,50])
assert.equal(catalog.ongoingService.publishedPrice,null)
for(const p of ['components/veyfront/pricing-v35.tsx','components/veyfront/intake-pages.tsx','components/veyfront/policy-pages.tsx','components/home/hero.tsx','components/home/invitation.tsx','components/home/proof.tsx','components/home/buyer-capabilities.tsx']){
 assert.doesNotMatch(read(p),/¥9,800|候选参考价|V3\.5参考价格|SERVICES & PRICING · V3\.5|仅在有授权来源页面时显示/,p)
}
assert.match(read('components/veyfront/pricing-v35.tsx'),/publicOffers\.plans\.start\.priceDisplay/)
assert.match(read('components/veyfront/policy-pages.tsx'),/publicOffers\.plans\.growth\.priceDisplay/)
assert.match(read('components/veyfront/lead-form.tsx'),/service === 'privacy' \? 20 : 6/)
assert.match(read('app/api/leads/route.ts'),/category === 'privacy' \? 20 : 6/)
// The public-facing site speaks to manufacturing and B2B exporters without
// restricting eligibility to a specific country. Archived planning docs retain
// their original wording and are intentionally outside this rendered-source gate.
import { readdirSync } from 'node:fs'
import { join } from 'node:path'
function assertNeutralPublicCopy(directory) {
 for (const item of readdirSync(directory, { withFileTypes: true })) {
  const location = join(directory, item.name)
  if (item.isDirectory()) { assertNeutralPublicCopy(location); continue }
  if (!item.isFile() || !/\.(?:tsx?|json)$/.test(item.name)) continue
  assert.doesNotMatch(read(location), /\u4e2d\u56fd/, location + ' must not restrict the public client audience by country')
 }
}
for (const directory of ['app', 'components', 'lib']) assertNeutralPublicCopy(directory)
assert.doesNotMatch(read('components/veyfront/wecom-contact.tsx'), /WECOM \/ CHINA/)
console.log('VEYFRONT public commercial copy contract PASS')
