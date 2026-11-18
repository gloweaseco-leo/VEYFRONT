import { checkUrl } from '@/lib/url'

export const buyerTasks = ['DISCOVER', 'UNDERSTAND', 'TRUST', 'INQUIRE', 'SEARCH_TECHNICAL'] as const
export type BuyerTask = typeof buyerTasks[number]

export type EvidenceView = {
  url: string
  location: string
  excerpt: string
}

export type TaskResult = {
  fact: string
} & (
  | { status: 'OBSERVED'; evidence: EvidenceView }
  | { status: 'ISSUE'; evidence: EvidenceView; buyerImpact: string; rebuild: string }
  | { status: 'UNKNOWN'; nextCheck: string }
)

export type DiagnosisReportView = {
  kind: 'synthetic' | 'released'
  targetUrl: string
  checkedAt: string
  source: string
  pages: readonly { url: string; label: string; outcome: 'reviewed' | 'unknown' }[]
  results: Record<BuyerTask, TaskResult>
  priority: readonly BuyerTask[]
}

export type AddressStatus = 'empty' | 'invalid' | 'unavailable' | 'valid'

// Preview only. Accept a public-looking HTTP(S) URL format without DNS or I/O.
export function diagnosisAddressStatus(value: string): AddressStatus {
  const result = checkUrl(value)
  if (result.state !== 'valid') return result.state
  const raw = value.trim()
  const url = new URL(/^[a-z][a-z\d+.-]*:\/\//i.test(raw) ? raw : 'https://' + raw)
  if (raw.length > 500 || raw.includes('\\') || url.username || url.password || url.port || raw.includes('?') || raw.includes('#')) return 'unavailable'
  return 'valid'
}
