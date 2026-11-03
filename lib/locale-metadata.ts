import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { releaseRobots } from '@/lib/seo-release'

export async function localizedMetadata(
  path: string, englishTitle: string, chineseTitle: string,
  englishDescription: string, chineseDescription: string,
  robots: Metadata['robots'] = releaseRobots,
): Promise<Metadata> {
  const chinese = (await headers()).get('x-vf-page-locale') === 'zh'
  const base = 'https://veyfront.com'
  const suffix = path === '/' ? '' : path
  return {
    title: chinese ? chineseTitle : englishTitle,
    description: chinese ? chineseDescription : englishDescription,
    robots,
    alternates: {
      canonical: base + (chinese ? '/zh' : '') + suffix,
      languages: { en: base + suffix, 'zh-CN': base + '/zh' + suffix },
    },
  }
}
