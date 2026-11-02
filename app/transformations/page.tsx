import type { Metadata } from 'next'
import { TransformationsPage } from '@/components/pages/transformations'

export const metadata: Metadata = {
  title: 'Website Transformation Concepts — VEYFRONT',
  description: 'Illustrative before-and-after industrial B2B website design comparisons, showing possible improvements to product discovery and inquiries; not completed customer projects.',
  robots: { index: false, follow: true },
}

export default function Page() {
  return <TransformationsPage />
}
