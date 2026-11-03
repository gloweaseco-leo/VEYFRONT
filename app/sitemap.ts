import type { MetadataRoute } from 'next'
import { isPublicRelease } from '@/lib/seo-release'

const pages = ['/', '/pricing', '/how-it-works', '/contact', '/start/launch', '/start/rebuild', '/privacy', '/terms'] as const

export default function sitemap(): MetadataRoute.Sitemap {
  if (!isPublicRelease) return []
  return pages.flatMap((path, index) => {
    const suffix = path === '/' ? '' : path
    const english = 'https://veyfront.com' + suffix
    const chinese = 'https://veyfront.com/zh' + suffix
    const alternates = { languages: { en: english, 'zh-CN': chinese } }
    return [
      { url: english, alternates, changeFrequency: 'monthly' as const, priority: index === 0 ? 1 : index === 1 ? 0.85 : 0.65 },
      { url: chinese, alternates, changeFrequency: 'monthly' as const, priority: index === 0 ? 0.95 : index === 1 ? 0.8 : 0.6 },
    ]
  })
}
