import type { Metadata } from 'next'
import { HowItWorksPage } from '@/components/pages/how-it-works'

export const metadata: Metadata = {
  title: 'How Engagements Work — VEYFRONT',
  description: 'Real inquiry, written scope and quote, supervised production, acceptance and handover. Demo artifacts are illustrative.',
}

export default function Page() {
  return <HowItWorksPage />
}
