import type { Metadata } from 'next'
import { PageShell } from '@/components/site/page-shell'
import { CommercialOffers } from '@/components/veyfront/commercial-offers'

export const metadata: Metadata = {
  title: 'Service Scope & Reference Pricing — VEYFRONT',
  description: 'Launch, Rebuild, optional Run: reference service scope, exclusions and proposed prices. Confirm written quote before commitment.',
  robots: { index: false, follow: false },
}

export default function PricingPage() {
  return <PageShell><CommercialOffers detail /></PageShell>
}
