import type { AutomaticResult } from '@/lib/vrae-preview-client'

type ResultState = 'diagnosed' | 'ai-unavailable'
type CompletedResult = AutomaticResult & { state: ResultState; address: string }

export type DiagnosisReply = Partial<Omit<AutomaticResult, 'state'>> & {
  state: string
  address?: string
  consentText?: string
  consentHash?: string
  code?: string
  delay: number
}

export function isReportReady(reply: DiagnosisReply): reply is DiagnosisReply & CompletedResult {
  return (reply.state === 'diagnosed' || reply.state === 'ai-unavailable') &&
    Boolean(reply.address && reply.pages && reply.insights &&
      (reply.pages.some(page => page.observed) || reply.buyerTasks?.length || reply.insights.length))
}

export async function callDiagnosis(action?: string, fields: Record<string, string | boolean> = {}): Promise<DiagnosisReply> {
  try {
    const response = await fetch('/api/website-diagnosis/v1', {
      credentials: 'same-origin', cache: 'no-store',
      ...(action && { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action, ...fields }) }),
    })
    const reply: Omit<DiagnosisReply, 'delay'> = await response.json()
    const seconds = Number(response.headers.get('Retry-After'))
    return { ...reply, delay: response.status === 429 ? (seconds >= 1 && seconds <= 900 ? seconds : 60) : 0 }
  } catch {
    return { state: 'unavailable', delay: 0 }
  }
}
