import type { Metadata } from 'next'
import { HowItWorksPage } from '@/components/pages/how-it-works'

export const metadata: Metadata = {
  title: 'How Engagements Work — VEYFRONT',
  description: "Explore VEYFRONT’s B2B website delivery process: discuss your business, agree a complete scope, review the website, then launch and receive source handover.",
}

export default function Page() {
  return <HowItWorksPage />
}
