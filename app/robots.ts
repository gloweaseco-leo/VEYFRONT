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
      // Match only experimental review paths; do not accidentally block /about later.
      disallow: ['/a$', '/a/', '/b$', '/b/', '/review/'],
    },
    sitemap: 'https://veyfront.com/sitemap.xml',
    host: 'https://veyfront.com',
  }
}
