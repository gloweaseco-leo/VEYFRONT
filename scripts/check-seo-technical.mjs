import assert from 'node:assert/strict'
import { readFileSync, existsSync } from 'node:fs'
const read = file => readFileSync(file,'utf8')
const metadata=read('lib/locale-metadata.ts')
const schema=read('lib/seo-schema.ts')
const sitemap=read('app/sitemap.ts')
const img=read('app/opengraph-image.tsx')
for (const keyword of ['canonical','x-default','zh-CN','en: english','openGraph','summary_large_image','images: [']) {
  assert.ok((metadata+sitemap+img).includes(keyword), 'Missing SEO intent '+keyword)
}
assert.match(metadata,/locale: chinese \? 'zh_CN' : 'en_US'/)
assert.match(schema,/'@type': 'Organization'/)
assert.match(schema,/'@type': 'WebSite'/)
assert.match(schema,/hello@veyfront\.com/)
assert.doesNotMatch(schema,/aggregateRating|reviewCount|telephone:|legalName:|streetAddress:/)
assert.match(read('app/layout.tsx'),/type="application\/ld\+json"/)
assert.match(read('app/layout.tsx'),/JSON\.stringify\(brandKnowledgeGraph\)/)
assert.match(img,/ImageResponse/)
assert.match(img,/1200, height: 630/)
assert.match(sitemap,/if \(!isPublicRelease\) return \[\]/)
assert.doesNotMatch(sitemap,/new Date\(/)
assert.doesNotMatch(sitemap,/return \[.*(?:changeFrequency|priority|lastModified)/)
for (const name of ['app/a/page.tsx','app/b/page.tsx','app/review/stage-1/page.tsx','app/transformations/page.tsx','app/contact/privacy/page.tsx']) {
  assert.match(read(name),/index: false/,name+' must not be indexed')
}
for (const name of ['app/page.tsx','app/pricing/page.tsx','app/start/launch/page.tsx','app/start/rebuild/page.tsx','app/how-it-works/page.tsx']) {
  assert.match(read(name),/localizedMetadata\(/,name+' needs bilingual titles')
}
const faq=read('components/veyfront/commercial-offers.tsx')
assert.match(faq,/外贸网站建设常见问题/)
assert.doesNotMatch(faq,/aggregateRating|reviewCount|FAQPage/)
assert.ok(existsSync('docs/VEYFRONT_SEO_PERFORMANCE_AUDIT_2026-11-04.md'))
console.log('VEYFRONT SEO structural guard PASS (not a field ranking, CWV or indexing test)')
