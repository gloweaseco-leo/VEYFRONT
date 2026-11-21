'use client'

import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { diagnosisPath, diagnosisReportPath } from '@/lib/diagnosis-preview'

function omitDiagnosisPreview<Event extends { url: string }>(event: Event) {
  const path = new URL(event.url, window.location.origin).pathname.replace(/^\/(?:en|zh)(?=\/)/, '')
  const route = path.replace(/\/$/, '')
  return route === diagnosisPath || route === diagnosisReportPath ? null : event
}

export function DiagnosisPreviewTelemetry() {
  return <>
    {process.env.NODE_ENV === 'production' && <Analytics beforeSend={omitDiagnosisPreview} />}
    <SpeedInsights sampleRate={1} beforeSend={omitDiagnosisPreview} />
  </>
}
