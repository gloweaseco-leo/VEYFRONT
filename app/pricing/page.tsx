import type { Metadata } from 'next'
import { releaseRobots } from '@/lib/seo-release'
import { PageShell } from '@/components/site/page-shell'
import { CommercialOffers } from '@/components/veyfront/commercial-offers'

export const metadata: Metadata = {
  title: 'B2B Website Pricing — VEYFRONT',
  description: 'A complete B2B website from ¥9,800: professional design, SEO-Native foundation, structured product content, working inquiries and first-year basic hosting. Final scope confirmed in writing.',
  robots: releaseRobots,
  alternates: { canonical: 'https://veyfront.com/pricing' },
}

export default function PricingPage() {
  return <PageShell><CommercialOffers detail /></PageShell>
}
