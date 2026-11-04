/**
 * Business identity only: avoid unverified legal name/address/telephone,
 * fake review counts, or a search feature that does not exist.
 * This graph describes VEYFRONT's publicly visible brand and website.
 */
export const brandKnowledgeGraph = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': 'https://veyfront.com/#organization',
      name: 'VEYFRONT',
      url: 'https://veyfront.com',
      logo: {
        '@type': 'ImageObject',
        url: 'https://veyfront.com/brand/logo_primary_light.svg',
      },
      description: 'International B2B website design, rebuild and ongoing improvement.',
      contactPoint: [{ '@type': 'ContactPoint', contactType: 'sales', email: 'hello@veyfront.com', availableLanguage: ['zh-CN', 'en'] }],
    },
    {
      '@type': 'WebSite',
      '@id': 'https://veyfront.com/#website',
      name: 'VEYFRONT',
      url: 'https://veyfront.com',
      inLanguage: ['en', 'zh-CN'],
      publisher: { '@id': 'https://veyfront.com/#organization' },
    },
  ],
} as const
