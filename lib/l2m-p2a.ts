/** Narrow L2M / VEYFRONT read contract. No inference is performed here. */
export type L2MP2Assessment = {
  contract_version: 'l2m.acy.assessment/0.1'
  assessment_id: string
  snapshot_id: string
  source: {
    type: 'AUTHORIZED_LOCAL_HTML_SNAPSHOT'
    inventory_schema: 'site-snapshot-inventory/0.2'
    scope: 'SUPPLIED_PAGES_ONLY'
    source_rights: 'NOT_VERIFIED'
    manifest_sha256: string
    network_fetch_performed: false
    evidence_ids: string[]
    pages: Array<{
      route: string
      sha256: string
      title_observed: string
      heading_observed: string
      form_count_observed: number
      nav_destinations_in_snapshot: string[]
    }>
  }
  findings: Array<{
    code: string
    severity: 'review'
    route: string
    source_page_sha256: string
    observation: string
    suggested_next_step: string
    claim_type: 'BOUNDED_OBSERVATION'
    customer_verified: false
  }>
  limitations: string[]
  execution: {
    mode: 'DETERMINISTIC_EVIDENCE_ONLY'
    model_calls: 0
    generation_calls: 0
    customer_ready: false
    review_required: true
  }
}
const record = (v: unknown): v is Record<string, unknown> =>
  !!v && typeof v === 'object' && !Array.isArray(v)
const hex64 = (v: unknown): v is string =>
  typeof v === 'string' && /^[0-9a-f]{64}$/.test(v)

export function p2aPreviewEnabled(env?: { VERCEL_ENV?: string; ACY_P2A_ENABLED?: string }): boolean {
  const e = env ?? { VERCEL_ENV: process.env.VERCEL_ENV, ACY_P2A_ENABLED: process.env.ACY_P2A_ENABLED }
  return e.VERCEL_ENV === 'preview' && e.ACY_P2A_ENABLED === 'true'
}

export function isL2MAssessment(candidate: unknown): candidate is L2MP2Assessment {
  if (!record(candidate)) return false
  const s = candidate.source
  const x = candidate.execution
  if (candidate.contract_version !== 'l2m.acy.assessment/0.1'
      || typeof candidate.assessment_id !== 'string'
      || !/^assessment-[0-9a-f]{20}$/.test(candidate.assessment_id)
      || candidate.snapshot_id !== 'qa-alt-treesite'
      || !record(s) || !record(x)) return false
  if (s.type !== 'AUTHORIZED_LOCAL_HTML_SNAPSHOT'
      || s.inventory_schema !== 'site-snapshot-inventory/0.2'
      || s.scope !== 'SUPPLIED_PAGES_ONLY'
      || s.source_rights !== 'NOT_VERIFIED'
      || s.network_fetch_performed !== false || !hex64(s.manifest_sha256)
      || !Array.isArray(s.pages) || s.pages.length < 1 || s.pages.length > 3
      || !Array.isArray(s.evidence_ids)) return false
  const pages = s.pages
  for (const page of pages) {
    if (!record(page) || typeof page.route !== 'string'
        || !hex64(page.sha256)
        || typeof page.title_observed !== 'string'
        || typeof page.heading_observed !== 'string'
        || !Number.isInteger(page.form_count_observed)
        || !Array.isArray(page.nav_destinations_in_snapshot)) return false
  }
  if (!Array.isArray(candidate.findings) || candidate.findings.length > 8
      || !Array.isArray(candidate.limitations)) return false
  for (const f of candidate.findings) {
    if (!record(f) || typeof f.code !== 'string' || typeof f.observation !== 'string'
        || typeof f.suggested_next_step !== 'string' || typeof f.route !== 'string'
        || !hex64(f.source_page_sha256)
        || !pages.some(p => p.route === f.route && p.sha256 === f.source_page_sha256)
        || f.claim_type !== 'BOUNDED_OBSERVATION' || f.customer_verified !== false) return false
  }
  return x.mode === 'DETERMINISTIC_EVIDENCE_ONLY' && x.model_calls === 0
      && x.generation_calls === 0 && x.customer_ready === false
      && x.review_required === true
}
