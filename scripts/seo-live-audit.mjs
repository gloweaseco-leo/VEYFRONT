#!/usr/bin/env node
/**
 * Public, read-only SEO availability monitor.
 * It does not access customer data, private forms, or third-party analytics.
 * Fetch timings are synthetic request durations, NOT Core Web Vitals.
 */
import { mkdir, writeFile } from 'node:fs/promises'

const ORIGIN = 'https://veyfront.com'
// Canonical sitemap inventory: six buyer-intent pairs and two legal pairs.
const PUBLIC_PATHS = [
  '/', '/pricing', '/how-it-works', '/contact',
  '/start/launch', '/start/rebuild', '/privacy', '/terms',
]
const NON_INDEXABLE = [
  '/transformations', '/zh/transformations', '/contact/privacy', '/zh/contact/privacy',
]
const INTERNAL_REVIEW_PATHS = ['/a', '/b', '/review/stage-1']
const report = { version: 'SEO-LIVE-V3', checkedAt: new Date().toISOString(),
  origin: ORIGIN, mode: 'public-get-only', results: [], failures: [],
  technicalIndexReadiness: {
    buyerIntentUrls: 12, legalUrls: 4, assessedPublicUrls: PUBLIC_PATHS.length * 2,
    googleIndexedUrls: null, // Requires authenticated Search Console reporting.
  },
  caveat: 'Technical eligibility and synthetic HTTP timings are NOT Google index coverage, ranking, field CWV, or lead conversions.' }

function verify(condition, label, detail = '') {
  if (!condition) report.failures.push({ check: label, detail: String(detail).slice(0,180) })
}
function attributes(tag) {
  const values = {}
  for (const m of tag.matchAll(/([:\w-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g)) {
    values[m[1].toLowerCase()] = m[2] ?? m[3]
  }
  return values
}
function tags(html, tagName) {
  const re = new RegExp('<' + tagName + '\\b[^>]*>', 'gi')
  return [...html.matchAll(re)].map(m => attributes(m[0]))
}
function headValue(html, tagName, key, value, field) {
  const item = tags(html, tagName).find(entry => entry[key] === value)
  return item ? item[field] : undefined
}
async function get(path, kind = 'html') {
  const started = performance.now()
  const response = await fetch(ORIGIN + path, {
    headers: { 'User-Agent': 'VEYFRONT-SEO-Monitor/2.0 (+https://veyfront.com)' },
    signal: AbortSignal.timeout(20000),
    redirect: 'follow',
    cache: 'no-store',
  })
  const body = kind === 'image' ? await response.arrayBuffer() : await response.text()
  const measured = Math.round(performance.now() - started)
  report.results.push({ path, status: response.status,
    fetchDurationMs: measured, contentType: response.headers.get('content-type'),
    bytesRead: kind === 'image' ? body.byteLength : Buffer.byteLength(body) })
  verify(response.ok, path + ' HTTP 2xx', response.status)
  return { response, body }
}
async function page(path, indexable) {
  let body
  try { ({ body } = await get(path)) } catch (error) {
    report.failures.push({ check: path + ' fetch', detail: String(error).slice(0,180) })
    return
  }
  const canonicalPath = path === '/' ? '' : path
  const canonical = ORIGIN + canonicalPath
  const suffix = path === '/zh' ? '' : path.startsWith('/zh/') ? path.slice(3) : path === '/' ? '' : path
  const expectedEn = ORIGIN + suffix
  const expectedZh = ORIGIN + '/zh' + suffix
  const lang = path === '/zh' || path.startsWith('/zh/') ? 'zh-CN' : 'en'
  const languageAnchors = tags(body, 'a')
  const enHref = suffix || '/'
  const zhHref = '/zh' + suffix
  verify(languageAnchors.some(a => a.href === enHref && a.hreflang === 'en'), path + ' crawlable EN link', enHref)
  verify(languageAnchors.some(a => a.href === zhHref && a.hreflang === 'zh-CN'), path + ' crawlable ZH link', zhHref)
  const htmlLang = attributes((body.match(/<html\b[^>]*>/i) ?? [''])[0]).lang
  const title = (body.match(/<title[^>]*>([^<]*)<\/title>/i) ?? [,''])[1]
  const description = headValue(body, 'meta', 'name', 'description', 'content')
  const robots = headValue(body, 'meta', 'name', 'robots', 'content') ?? ''
  const canonicalValue = headValue(body, 'link', 'rel', 'canonical', 'href')
  const hreflang = {}
  for (const link of tags(body, 'link')) {
    if (link.rel === 'alternate' && link.hreflang) hreflang[link.hreflang] = link.href
  }
  verify(htmlLang === lang, path + ' document language', htmlLang)
  verify(title.length >= (indexable ? (lang === 'zh-CN' ? 10 : 18) : 5) && title.length <= 110, path + ' meaningful title', title)
  verify(!indexable || (Boolean(description) && description.length >= (lang === 'zh-CN' ? 15 : 35)), path + ' description')
  verify(canonicalValue === canonical, path + ' self canonical', canonicalValue)
  verify(hreflang.en === expectedEn, path + ' en hreflang', hreflang.en)
  verify(hreflang['zh-CN'] === expectedZh, path + ' zh-CN hreflang', hreflang['zh-CN'])
  verify(hreflang['x-default'] === expectedEn, path + ' default hreflang', hreflang['x-default'])
  verify(indexable ? !robots.includes('noindex') : robots.includes('noindex'),
    path + ' index policy', robots)
  verify(headValue(body, 'meta', 'property', 'og:title', 'content') === title,
    path + ' OG title parity')
  verify(headValue(body, 'meta', 'property', 'og:image', 'content') === ORIGIN + '/opengraph-image',
    path + ' branded OG image')
  verify(Boolean(body.match(/<h1\b/i)), path + ' semantic H1')
  if (path === '/' || path === '/zh') {
    verify(body.includes('https://schema.org') && body.includes('"@type":"Organization"'),
      path + ' published Organization structured data')
  }
}
async function reviewNoindex(path) {
  try {
    const { body } = await get(path)
    const metaRobots = headValue(body, 'meta', 'name', 'robots', 'content') ?? ''
    verify(metaRobots.includes('noindex'), path + ' intentionally noindex', metaRobots)
  } catch (error) {
    report.failures.push({ check: path + ' fetch', detail: String(error).slice(0, 180) })
  }
}

async function main() {
  try {
    const robots = (await get('/robots.txt')).body
    const sitemapResult = await get('/sitemap.xml')
    const sitemap = sitemapResult.body
    verify((sitemapResult.response.headers.get('content-type') ?? '').includes('xml'), 'sitemap XML content type')
    verify(sitemap.includes('<urlset'), 'sitemap XML document')
    verify(robots.includes('Sitemap: ' + ORIGIN + '/sitemap.xml'), 'robots points to public sitemap')
    verify(!/Disallow:\s*\/\s*$/m.test(robots), 'production is not globally blocked')
    verify(!sitemap.includes('/transformations'), 'fictional demo excluded from sitemap')
    verify(!sitemap.includes('/review/'), 'internal review excluded from sitemap')
    const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/gi)].map(x => x[1])
    verify(urls.length === 16, 'public sitemap has 16 bilingual canonical URLs', urls.length)
    verify(new Set(urls).size === urls.length, 'public sitemap URLs unique')
    for (const base of PUBLIC_PATHS) {
      const path = base === '/' ? '' : base
      verify(urls.includes(ORIGIN + path), 'sitemap EN ' + path)
      verify(urls.includes(ORIGIN + '/zh' + path), 'sitemap ZH ' + path)
    }
    for (const path of PUBLIC_PATHS) {
      await page(path, true)
      await page('/zh' + (path === '/' ? '' : path), true)
    }
    for (const path of NON_INDEXABLE) await page(path, false)
    for (const path of INTERNAL_REVIEW_PATHS) await reviewNoindex(path)
    // Old public links must remain canonicalized to the single commercial pricing route.
    const oldServices = await fetch(ORIGIN + '/services', {
      redirect: 'manual', cache: 'no-store',
      signal: AbortSignal.timeout(20000),
    })
    report.results.push({ path: '/services', status: oldServices.status, redirectTarget: oldServices.headers.get('location') })
    verify([301, 308].includes(oldServices.status), '/services permanent redirect', oldServices.status)
    const redirectTarget = new URL(oldServices.headers.get('location') ?? '/', ORIGIN)
    verify(redirectTarget.origin === ORIGIN && redirectTarget.pathname === '/pricing',
      '/services redirects to canonical pricing', redirectTarget.href)
    const image = await get('/opengraph-image', 'image')
    const magic = new Uint8Array(image.body.slice(0, 8))
    verify(image.response.headers.get('content-type')?.includes('image/png'), 'OG image PNG MIME')
    verify(magic.length === 8 && magic[0] === 137 && magic[1] === 80 && magic[2] === 78 && magic[3] === 71,
      'OG image valid PNG header')
  } catch (error) {
    report.failures.push({ check: 'monitor top-level execution', detail: String(error).slice(0,180) })
  } finally {
    report.status = report.failures.length === 0 ? 'PASS' : 'FAIL'
    report.pagesChecked = report.results.length
    await mkdir('qa-evidence/seo-live', { recursive: true })
    await writeFile('qa-evidence/seo-live/report.json', JSON.stringify(report, null, 2) + '\n')
    console.log(JSON.stringify({
      status: report.status,
      checkedAt: report.checkedAt,
      pagesChecked: report.pagesChecked,
      failures: report.failures,
      evidence: 'qa-evidence/seo-live/report.json',
      caveat: report.caveat
    }, null, 2))
    if (report.failures.length) process.exitCode = 1
  }
}
await main()
