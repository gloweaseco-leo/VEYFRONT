import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { p2a2Enabled } from '@/lib/l2m-p2a2'
import { AcyLivePreview } from '@/components/veyfront/acy-live-preview'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = {
  title: 'VEYFRONT × L2M P2-A2 · Restricted Live Homepage QA',
  robots: {index:false,follow:false},
}
export default function Page() {
  if (!p2a2Enabled()) notFound()
  return <AcyLivePreview/>
}
