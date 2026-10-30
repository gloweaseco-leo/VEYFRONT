import type { Metadata } from 'next'
import { TransformationsPage } from '@/components/pages/transformations'

export const metadata: Metadata = {
  title: 'Transformations — VEYFRONT (design prototype)',
  description: 'Before and after website transformations with their source, authorization and verification evidence. Fictional demo only.',
}

export default function Page() {
  return <TransformationsPage />
}
