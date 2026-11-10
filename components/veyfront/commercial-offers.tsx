'use client'
/**
 * Compatibility boundary for legacy pages importing CommercialOffers.
 * V3.5 is implemented in pricing-v35.tsx and is preview-only pending commercial acceptance.
 */
import { PricingTeaserV35, PricingV35 } from '@/components/veyfront/pricing-v35'

export function CommercialOffers({ detail = false }: { detail?: boolean }) {
  return detail ? <PricingV35 /> : <PricingTeaserV35 />
}
