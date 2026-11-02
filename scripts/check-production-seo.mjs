#!/usr/bin/env node
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
const read=p=>readFileSync(p,'utf8')
const seo=read('lib/seo-release.ts'),robots=read('app/robots.ts'),sitemap=read('app/sitemap.ts')
assert.match(seo,/VERCEL_ENV === 'production'/)
assert.match(seo,/index: true, follow: true/)
assert.match(seo,/index: false, follow: false/)
assert.match(robots,/if \(!isPublicRelease\)/)
assert.match(robots,/disallow: '\\/'/)
for(const p of ['\\/a','\\/b','\\/review\\/'])assert.ok(robots.includes(p.replaceAll('\\','/')))
assert.match(sitemap,/if \(!isPublicRelease\) return \[\]/)
for(const p of ['pricing','services','how-it-works','contact','start/launch','start/rebuild'])assert.ok(sitemap.includes(p))
assert.match(read('app/pricing/page.tsx'),/robots: releaseRobots/)
assert.match(read('app/page.tsx'),/robots: releaseRobots/)
assert.match(read('app/transformations/page.tsx'),/index: false/)
console.log('Production SEO index policy and preview isolation guards PASS')
