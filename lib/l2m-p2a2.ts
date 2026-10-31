/** Separate live-homepage contract: not the earlier synthetic P2-A v0.1. */
export type LiveHomeAssessment = {
  contract_version: 'l2m.acy.assessment/0.2'
  assessment_id: string
  snapshot_id: string
  source: {
    type: 'AUTHORIZED_PUBLIC_URL_CAPTURE'
    scope: 'CAPTURED_PUBLIC_HOMEPAGE_ONLY'
    source_rights: 'USER_ASSERTED_NOT_INDEPENDENTLY_VERIFIED'
    network_fetch_performed: true
    canonical_url: string
    captured_at_utc: string
    manifest_sha256: string
    pages: Array<{
      route: string; sha256: string; title_observed: string
      heading_observed: string; form_count_observed: number
      nav_destinations_in_snapshot: string[]
    }>
  }
  findings: Array<{
    code: string; severity: 'review'; route: string; source_page_sha256: string
    observation: string; suggested_next_step: string
    claim_type: 'BOUNDED_OBSERVATION'; customer_verified: false
  }>
  limitations: string[]
  execution: {
    mode: 'DETERMINISTIC_LIVE_HOMEPAGE_ONLY'
    model_calls: 0; generation_calls: 0; customer_ready: false; review_required: true
  }
}
const obj = (v: unknown): v is Record<string, unknown> =>
  !!v && typeof v === 'object' && !Array.isArray(v)
const hex64 = (v: unknown) => typeof v === 'string' && /^[a-f0-9]{64}$/.test(v)
export function p2a2Enabled(env?: { VERCEL_ENV?: string; ACY_P2A2_ENABLED?: string }): boolean {
  const e = env ?? { VERCEL_ENV: process.env.VERCEL_ENV, ACY_P2A2_ENABLED: process.env.ACY_P2A2_ENABLED }
  return e.VERCEL_ENV === 'preview' && e.ACY_P2A2_ENABLED === 'true'
}
export function isLiveAssessment(v: unknown): v is LiveHomeAssessment {
  if (!obj(v) || !obj(v.source) || !obj(v.execution)) return false
  const s = v.source, x = v.execution
  if (v.contract_version !== 'l2m.acy.assessment/0.2'
      || typeof v.assessment_id !== 'string' || !/^assessment-[a-f0-9]{20}$/.test(v.assessment_id)
      || typeof v.snapshot_id !== 'string' || !/^public-[a-f0-9]{20}$/.test(v.snapshot_id)
      || s.type !== 'AUTHORIZED_PUBLIC_URL_CAPTURE'
      || s.scope !== 'CAPTURED_PUBLIC_HOMEPAGE_ONLY'
      || s.source_rights !== 'USER_ASSERTED_NOT_INDEPENDENTLY_VERIFIED'
      || s.network_fetch_performed !== true
      || s.canonical_url !== 'https://veyfront.com/'
      || typeof s.captured_at_utc !== 'string' || !Number.isFinite(Date.parse(s.captured_at_utc))
      || !hex64(s.manifest_sha256)
      || !Array.isArray(s.pages) || s.pages.length !== 1
      || !Array.isArray(v.findings) || v.findings.length > 8
      || !Array.isArray(v.limitations) || !v.limitations.every(z => typeof z === 'string')
      || x.mode !== 'DETERMINISTIC_LIVE_HOMEPAGE_ONLY' || x.model_calls !== 0
      || x.generation_calls !== 0 || x.customer_ready !== false || x.review_required !== true)
    return false
  const p = s.pages[0]
  if (!obj(p) || p.route !== '/' || !hex64(p.sha256) ||
      typeof p.title_observed !== 'string' || typeof p.heading_observed !== 'string' ||
      !Number.isSafeInteger(p.form_count_observed) || !Array.isArray(p.nav_destinations_in_snapshot) ||
      !p.nav_destinations_in_snapshot.every(z => typeof z === 'string')) return false
  return v.findings.every(f => obj(f) && typeof f.code === 'string' && f.severity === 'review'
    && f.route === '/' && f.source_page_sha256 === p.sha256
    && typeof f.observation === 'string' && typeof f.suggested_next_step === 'string'
    && f.claim_type === 'BOUNDED_OBSERVATION' && f.customer_verified === false)
}
