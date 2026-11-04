import type { MetadataRoute } from 'next'
import { isPublicRelease } from '@/lib/seo-release'

export default function robots(): MetadataRoute.Robots {
  if (!isPublicRelease) {
    return { rules: { userAgent: '*', disallow: '/' } }
  }
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/a },
    sitemap: 'https://veyfront.com/sitemap.xml',
    host: 'https://veyfront.com',
  }
}
, '/a/', '/b },
    sitemap: 'https://veyfront.com/sitemap.xml',
    host: 'https://veyfront.com',
  }
}
, '/b/', '/review/'] },
    sitemap: 'https://veyfront.com/sitemap.xml',
    host: 'https://veyfront.com',
  }
}
