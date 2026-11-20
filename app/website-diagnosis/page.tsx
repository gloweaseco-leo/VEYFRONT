import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { DiagnosisPreview } from '@/components/veyfront/diagnosis/preview'
import { diagnosisPreviewEnabled } from '@/lib/diagnosis-preview'
import { localG1Enabled } from '@/lib/vrae-g1-local'
import { isAutomaticPreviewHost, previewConfig } from '@/lib/vrae-preview'

export async function generateMetadata(): Promise<Metadata> {
  const en = (await headers()).get('x-vf-page-locale') === 'en'
  return {
    title: en ? 'Free B2B Website Check Preview | VEYFRONT' : '外贸独立站免费预诊断预览｜VEYFRONT',
    robots: { index: false, follow: false },
    referrer: 'no-referrer',
  }
}

export default async function Page() {
  if (!diagnosisPreviewEnabled) notFound()
  const connectedPreview = isAutomaticPreviewHost((await headers()).get('host')) && Boolean(previewConfig())
  return <DiagnosisPreview offlineG1={localG1Enabled()} connectedPreview={connectedPreview} />
}
