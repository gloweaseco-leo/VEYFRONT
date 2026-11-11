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
console.log('VEYFRONT public commercial copy contract PASS')
