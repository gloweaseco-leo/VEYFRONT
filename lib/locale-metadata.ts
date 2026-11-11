import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { releaseRobots } from '@/lib/seo-release'

const origin = 'https://veyfront.com'

/** Single source for bilingual indexable metadata. Self canonical, reciprocal hreflang and x-default. */
export async function localizedMetadata(
  path: string, englishTitle: string, chineseTitle: string,
  englishDescription: string, chineseDescription: string,
  robots: Metadata['robots'] = releaseRobots,
): Promise<Metadata> {
  const chinese = (await headers()).get('x-vf-page-locale') !== 'en'
  const suffix = path === '/' ? '' : path
  const canonical = origin + (chinese ? '' : '/en') + suffix
  const title = chinese ? chineseTitle : englishTitle
  const description = chinese ? chineseDescription : englishDescription
  const english = origin + '/en' + suffix
  const zh = origin + suffix
  const image = origin + '/opengraph-image'
  return {
    title,
    description,
    robots,
    alternates: {
      canonical,
      languages: { en: english, 'zh-CN': zh, 'x-default': zh },
    },
    openGraph: {
      type: 'website',
      url: canonical,
      title,
      description,
      siteName: 'VEYFRONT',
      locale: chinese ? 'zh_CN' : 'en_US',
      alternateLocale: chinese ? ['en_US'] : ['zh_CN'],
      images: [{ url: image, width: 1200, height: 630, alt: 'VEYFRONT — Building Digital Frontiers for Global Business' }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
  }
}
