import { headers } from 'next/headers'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { CustomerDiagnosisReport } from '@/components/veyfront/diagnosis/customer-report'
import { diagnosisPreviewEnabled } from '@/lib/diagnosis-preview'
import { isAutomaticPreviewHost, previewConfig } from '@/lib/vrae-preview'
import './print-report.css'

export async function generateMetadata(): Promise<Metadata> {
  const en = (await headers()).get('x-vf-page-locale') === 'en'
  return {
    title: en ? 'Buyer Experience Report | VEYFRONT' : '采购体验预诊断报告｜VEYFRONT',
    robots: { index: false, follow: false },
    referrer: 'no-referrer',
  }
}

export default async function Page({ searchParams }: { searchParams: Promise<{ example?: string }> }) {
  if (!diagnosisPreviewEnabled || !isAutomaticPreviewHost(process.env.VERCEL_URL ?? null) || !previewConfig()) notFound()
  const example = (await searchParams).example === '1'
  return <CustomerDiagnosisReport key={example ? 'example' : 'task'} example={example} />
}
