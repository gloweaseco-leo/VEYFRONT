import type { MetadataRoute } from 'next'
import { isPublicRelease } from '@/lib/seo-release'

const pages = ['/', '/pricing', '/services', '/how-it-works', '/contact', '/start/launch', '/start/rebuild'] as const

export default function sitemap(): MetadataRoute.Sitemap {
  if (!isPublicRelease) return []
  return pages.map((path, index) => ({
    url: 'https://veyfront.com' + (path === '/' ? '' : path),
    changeFrequency: 'monthly' as const,
    priority: index === 0 ? 1 : index === 1 ? 0.85 : 0.65,
  }))
}
