import type { MetadataRoute } from 'next'
import { isPublicRelease } from '@/lib/seo-release'

export default function robots(): MetadataRoute.Robots {
  if (!isPublicRelease) {
    return { rules: { userAgent: '*', disallow: '/' } }
  }
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // Non-public review URLs are excluded by page-level noindex. Do not block
      // their crawling here: crawlers need to read the noindex directive.
    },
    sitemap: 'https://veyfront.com/sitemap.xml',
    host: 'https://veyfront.com',
  }
}
