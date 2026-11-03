import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
const read=(p)=>readFileSync(p,'utf8')
for(const p of [
 'app/services/page.tsx','app/start/launch/page.tsx','app/start/rebuild/page.tsx',
 'app/contact/page.tsx','app/contact/privacy/page.tsx','app/privacy/page.tsx',
 'app/terms/page.tsx','app/transformations/page.tsx','app/how-it-works/page.tsx','app/pricing/page.tsx',
])assert.ok(existsSync(p),'missing route: '+p)
const brand=read('components/l2m/brand.tsx')
assert.match(brand,/logo_primary_dark\.svg/)
assert.match(brand,/logo_primary_light\.svg/)
const nav=read('components/l2m/site-header.tsx')
assert.match(nav,/href="\/contact"/)
assert.match(nav,/\/pricing/)
assert.doesNotMatch(nav,/href: '\/services'/)
const hero=read('components/home/hero.tsx')
assert.match(hero,/\/start\/launch/)
assert.match(hero,/\/start\/rebuild/)
const footer=read('components/home/invitation.tsx')
assert.match(footer,/href="\/privacy"/)
assert.match(footer,/href="\/terms"/)
assert.doesNotMatch(footer,/href="\/review\/stage-1"/)
const api=read('app/api/leads/route.ts')
assert.match(api,/access: 'private'/)
const pricing=read('components/pages/pricing.tsx')
assert.match(pricing,/complex\.length > 0/)
console.log('VEYFRONT brand/commercial routing guard PASS')
