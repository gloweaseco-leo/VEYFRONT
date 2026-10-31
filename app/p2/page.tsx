import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { p2aPreviewEnabled } from '@/lib/l2m-p2a'
import { AcyP2Preview } from '@/components/veyfront/acy-p2a'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title:'L2M × VEYFRONT P2-A · Preview Only', robots:{index:false,follow:false} }
export default function Page() {
  if(!p2aPreviewEnabled()) notFound()
  return <AcyP2Preview />
}
