import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { p1Enabled } from '@/lib/acy-p1'
import { AcyP1Experience } from '@/components/veyfront/acy-p1'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = {
  title: 'ACY P1 · Preview Only — VEYFRONT',
  description: 'Restricted synthetic-data preview of the VEYFRONT autonomous customer journey.',
  robots: { index: false, follow: false }
}
export default function Page() {
  if (!p1Enabled()) notFound()
  return <AcyP1Experience />
}
