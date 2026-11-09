/**
 * Privacy-minimized acquisition hint.
 * Store ONLY the category, never the referrer URL, query string, search terms or IP.
 * Browser-origin information may be missing or spoofed, so this is NOT verified attribution.
 */
export const ACQUISITION_SESSION_KEY = 'vf:acquisition-channel-v1'
export const LANDING_PAGE_SESSION_KEY = 'vf:first-public-landing-v1'
const canonicalPaths = [
  '/', '/zh', '/pricing', '/zh/pricing', '/how-it-works', '/zh/how-it-works',
  '/contact', '/zh/contact', '/start/launch', '/zh/start/launch',
  '/start/rebuild', '/zh/start/rebuild', '/privacy', '/zh/privacy',
  '/terms', '/zh/terms',
] as const
export function safeAcquisitionLandingPage(value: unknown): string | null {
  return typeof value === 'string' && (canonicalPaths as readonly string[]).includes(value)
    ? value
    : null
}
export const acquisitionChannels = [
  'google-referrer', 'bing-referrer', 'baidu-referrer', 'other-search-referrer',
  'external-referral', 'unknown',
] as const
export type AcquisitionChannel = typeof acquisitionChannels[number]

const googleDomains = new Set([
  'google.com', 'google.co.uk', 'google.de', 'google.fr', 'google.ca',
  'google.com.au', 'google.com.hk', 'google.com.sg', 'google.co.jp',
  'google.co.in', 'google.com.tw', 'google.com.br', 'google.co.kr',
])
const otherSearchDomains = new Set(['duckduckgo.com', 'search.yahoo.com', 'yahoo.com', 'ecosia.org', 'yandex.com', 'yandex.ru'])

// Earlier short-lived release used "organic" labels although referrer alone cannot
// distinguish an ad click from unpaid search. Normalize legacy session values.
const legacyAliases: Record<string, AcquisitionChannel> = {
  'google-organic': 'google-referrer',
  'bing-organic': 'bing-referrer',
  'baidu-organic': 'baidu-referrer',
  'other-search': 'other-search-referrer',
}
export function safeAcquisitionChannel(value: unknown): AcquisitionChannel {
  if (typeof value !== 'string') return 'unknown'
  const normalized = legacyAliases[value] ?? value
  return (acquisitionChannels as readonly string[]).includes(normalized)
    ? normalized as AcquisitionChannel
    : 'unknown'
}

export function classifyAcquisitionReferrer(referrer: string, ownHostname: string): AcquisitionChannel {
  if (!referrer) return 'unknown'
  try {
    const url = new URL(referrer)
    if (url.protocol !== 'https:' && url.protocol !== 'http:') return 'unknown'
    const host = url.hostname.toLowerCase().replace(/\.$/, '')
    const own = ownHostname.toLowerCase().replace(/\.$/, '')
    if (host === own || (own === 'veyfront.com' && host === 'www.veyfront.com')) return 'unknown'
    const bare = host.startsWith('www.') ? host.slice(4) : host
    if (googleDomains.has(bare)) return 'google-referrer'
    if (bare === 'bing.com' || bare === 'cn.bing.com' || bare === 'bing.com.cn') return 'bing-referrer'
    if (bare === 'baidu.com' || bare === 'm.baidu.com' || bare === 'baidu.com.cn') return 'baidu-referrer'
    if (otherSearchDomains.has(bare)) return 'other-search-referrer'
    return 'external-referral'
  } catch {
    return 'unknown'
  }
}
