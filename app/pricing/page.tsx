import type { Metadata } from 'next'
import { PricingPage } from '@/components/pages/pricing'

export const metadata: Metadata = {
  title: 'Pricing & Delivery — VEYFRONT (design prototype)',
  description: 'VEYFRONT Rebuild: scope and total price confirmed before payment, independent source-code delivery. SAMPLE PRICE only.',
}

export default function Page() {
  return <PricingPage />
}
