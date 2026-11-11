import type { MetadataRoute } from 'next'
import { isPublicRelease } from '@/lib/seo-release'

/** Search-facing canonical URLs only. Exclude review experiments, privacy request form and fictional demo. */
export const publicSitemapPaths = [
  '/', '/pricing', '/how-it-works', '/contact',
  '/start/launch', '/start/rebuild', '/privacy', '/terms',
] as const

export default function sitemap(): MetadataRoute.Sitemap {
  if (!isPublicRelease) return []
  return publicSitemapPaths.flatMap(path => {
    const suffix = path === '/' ? '' : path
    const english = 'https://veyfront.com/en' + suffix
    const chinese = 'https://veyfront.com' + suffix
    const alternates = { languages: { en: english, 'zh-CN': chinese, 'x-default': chinese } }
    // Do not synthesize update dates or assign priority/changeFrequency: Google's crawl
    // systems derive these from content/history, not declarations of desired ranking.
    return [{ url: chinese, alternates }, { url: english, alternates }]
  })
}
