import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const read = path => readFileSync(path, 'utf8')
const hero = read('components/home/hero.tsx')
const homeCopy = read('lib/home-copy.ts')
const pageCopy = read('lib/pages-copy.ts')
const pricing = read('components/veyfront/pricing-v35.tsx')
const transformations = read('components/pages/transformations.tsx')
const lang = read('components/l2m/brand.tsx')

// Avoid displaying defensive "not a real case" paragraphs in the live sales funnel.
// Keep source-level provenance for the fictional interaction specimen; never claim client delivery.
for (const [surface, source] of [['homepage visual', hero], ['pricing', pricing]]) {
  assert.doesNotMatch(source, /非真实客户案例|非真实客户交付案例|Illustrative concept, not a client|ILLUSTRATIVE|不代表已有真实客户增长案例/i, surface)
}
assert.match(hero, /网站升级前后对比/)
assert.match(homeCopy, /caption: '看三个变化：找产品更方便/)
assert.doesNotMatch(homeCopy, /caption: '设计效果对比示意|caption: 'Illustrative design comparison/)
assert.match(pageCopy, /stageTitle: '工业企业官网 · 改版前后对比'/)
assert.match(pageCopy, /stageTitle: 'Industrial B2B · Product & Inquiry Journey'/)
assert.doesNotMatch(pageCopy, /stageMeta: '.*非真实客户交付案例|lede: '.*这不是已交付客户案例/)
assert.match(transformations, /\{p\.tr\.stageTitle\}/)
assert.match(lang, /inline-flex h-9 min-w-11 shrink-0 items-center justify-center rounded-full/)
assert.match(lang, /<a key=\{o\.value\} href=\{href\}/, 'Preserve SEO crawlable language toggle')
assert.match(lang, /hrefLang=\{o\.value === 'zh' \? 'zh-CN' : 'en'\}/)
assert.match(read('app/page.tsx'), /<Transformation\/>/)
assert.match(read('app/pricing/page.tsx'), /<PricingV35 \/>/)
console.log('VEYFRONT public-facing copy + language-button contract PASS')
