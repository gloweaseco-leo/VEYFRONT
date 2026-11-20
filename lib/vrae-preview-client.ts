// Server only. The browser never supplies an upstream host, service credentials, or path.
import { request } from 'node:https'
import { createHash } from 'node:crypto'
import type { IncomingHttpHeaders } from 'node:http'
import type { BuyerTask } from './diagnosis-presentation.ts'

export const vfContract = 'vf-vrae-r0.1-vfb.1'
export const diagnosisVersion = 'vrae.diagnosis-api.v1'
export const reportContract = 'vrae.report-authority.v1'
export const reportProfile = 'VERIFIED_HUMAN_CUSTOMER_REPORT'
export const auditRefPattern = /^aref-[0-9a-f]{32}$/
export const privateTokenPattern = /^[A-Za-z0-9._~-]{16,512}$/
export const digestPattern = /^[0-9a-f]{64}$/
const diagnosisMedia = `application/vnd.vrae.launch+json; profile="${vfContract}"`
const reportMedia = `application/vnd.vrae.report+json; profile="${reportContract}"`
const jsonMedia = 'application/json'
const targetCookie = '__Host-vrae-targets'
const intakeContract = 'vrae.target-intake.v1'
const diagnosisPath = '/v1/diagnoses'
const resultPath = '/v1/audits/{audit_ref}/diagnosis'
const automaticConsentVersion = 'VRAE-AUTO-DIAGNOSIS-1'
const automaticConsentText = 'I am authorized to permit bounded read-only diagnosis of this HTTPS website and its public same-origin pages, including processing minimized typed evidence by Alibaba Bailian qwen4-max in cn-beijing. Raw HTML and PII are excluded from model input. Automated conclusions and suggestions may be returned to me; they are not human-certified findings. No login, write or form submission is authorized.'

export type ServiceConfig = {
  origin: URL
  sourceSha: string
  ca: string
  cert: string
  key: string
  bearer: string
}
export type DiagnosisSession = { cookie: string; csrf: string; expiresAt: number }
export type DiagnosisConsent = { version: string; text: string; hash: string }
type Wire = { status: number; body: Record<string, unknown>; headers: IncomingHttpHeaders }
type FailureStatus = 403 | 404 | 409 | 429 | 503
export class VraeFailure extends Error {
  readonly status: FailureStatus
  readonly retryAfter?: number

  constructor(status: FailureStatus, retryAfter?: number) {
    super('VRAE request unavailable')
    this.status = status
    this.retryAfter = retryAfter
  }
}

export function object(value: unknown): Record<string, unknown> | undefined {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown> : undefined
}

function requireMatch(value: unknown, pattern: RegExp): string {
  if (typeof value !== 'string' || !pattern.test(value)) throw new VraeFailure(503)
  return value
}

function transport(config: ServiceConfig, profile: 'diagnosis' | 'report') {
  return (path: string, expected: number | readonly number[], media: string, raw?: string, privateHeaders?: Record<string, string>) =>
    new Promise<Wire>((resolve, reject) => {
      const headers: Record<string, string | number> = {
        Accept: media,
        Authorization: 'Bearer ' + config.bearer,
        ...privateHeaders,
      }
      if (profile === 'report') headers['X-Report-Profile'] = reportProfile
      if (raw !== undefined) {
        headers['Content-Type'] = media
        headers['Content-Length'] = Buffer.byteLength(raw)
      }
      const connection = request(config.origin, {
        path, headers, method: raw === undefined ? 'GET' : 'POST',
        ca: config.ca, cert: config.cert, key: config.key,
        rejectUnauthorized: true, minVersion: 'TLSv1.2', agent: false,
        signal: AbortSignal.timeout(8000),
      }, response => {
        const meta = response.headers
        const scope = profile === 'diagnosis' ? meta['x-vrae-api-version'] === diagnosisVersion
          : meta['x-vrae-scope'] === reportProfile
        const status = response.statusCode ?? 0
        const ok = typeof expected === 'number' ? status === expected : expected.includes(status)
        const expectedMedia = meta['content-type'] === media ||
          (profile === 'diagnosis' && media === jsonMedia && !ok &&
            meta['content-type'] === diagnosisMedia)
        if (
          !expectedMedia || meta['x-vrae-source-sha'] !== config.sourceSha || !scope ||
          !/(?:^|,\s*)no-store(?:,|$)/i.test(meta['cache-control'] ?? '')
        ) {
          response.destroy()
          reject(new VraeFailure(503))
          return
        }
        let size = 0
        const chunks: Buffer[] = []
        response.on('data', (chunk: Buffer) => {
          size += chunk.byteLength
          if (size > 2_000_000) response.destroy(new VraeFailure(503))
          else chunks.push(chunk)
        })
        response.on('error', () => reject(new VraeFailure(503)))
        response.on('end', () => {
          try {
            const body = object(JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(Buffer.concat(chunks))))
            if (!body) throw new VraeFailure(503)
            if (!ok) {
              if (status === 403 || status === 404 || status === 409) throw new VraeFailure(status)
              if (status === 429) {
                const seconds = Number(meta['retry-after'] ?? body.retry_after_seconds)
                throw new VraeFailure(429, Number.isInteger(seconds) && seconds >= 1 && seconds <= 900 ? seconds : 60)
              }
              throw new VraeFailure(503)
            }
            resolve({ status, body, headers: meta })
          } catch (error) {
            reject(error instanceof VraeFailure ? error : new VraeFailure(503))
          }
        })
      })
      connection.on('error', () => reject(new VraeFailure(503)))
      connection.end(raw)
    })
}

function diagnosisHeaders(session: DiagnosisSession) {
  if (session.expiresAt <= Date.now()) throw new VraeFailure(403)
  return { Cookie: `${targetCookie}=${session.cookie}`, 'X-CSRF-Token': session.csrf }
}

function diagnosisSession({ body, headers }: Wire): DiagnosisSession {
  const lines = headers['set-cookie']?.filter(line => line.startsWith(targetCookie + '=')) ?? []
  if (body.restored !== true || lines.length !== 1) throw new VraeFailure(503)
  const [pair, ...rawAttributes] = lines[0].split(';').map(part => part.trim())
  const attributes = rawAttributes.map(part => part.toLowerCase())
  const age = attributes.filter(attr => /^max-age=[1-9]\d*$/.test(attr))
  if (
    ['path=/', 'secure', 'httponly', 'samesite=strict'].some(attr => !attributes.includes(attr)) ||
    attributes.some(attr => /^domain\s*=/.test(attr)) || age.length !== 1
  ) throw new VraeFailure(503)
  return {
    cookie: requireMatch(pair.slice(targetCookie.length + 1), privateTokenPattern),
    csrf: requireMatch(headers['x-csrf-token'], privateTokenPattern),
    expiresAt: Date.now() + 1000 * Math.min(Number(age[0].slice(8)), 3600),
  }
}

type SourcePage = { id: string; url: string; observed: boolean; checkedAt?: string }
type BuyerInsight = { task: BuyerTask; explanation: string; rebuild: string[]; checks: string[]; sources: string[] }
export type AutomaticResult = {
  state: 'running' | 'analyzing' | 'failed' | 'diagnosed' | 'ai-unavailable'
  pages: SourcePage[]
  insights: BuyerInsight[]
}

const taskNames: readonly string[] = ['DISCOVER', 'UNDERSTAND', 'TRUST', 'INQUIRE', 'SEARCH_TECHNICAL']
const snapshotPattern = /^page-[a-f0-9]{64}$/

function list(value: unknown): unknown[] {
  return Array.isArray(value) ? value : []
}

function evidenceUrl(value: unknown) {
  if (typeof value !== 'string' || value.length > 1024) return
  try {
    const url = new URL(value)
    if (url.protocol === 'https:' && !url.username && !url.password && !url.search && !url.hash) return url.href
  } catch {
    return
  }
}

function customerText(value: unknown): string {
  return typeof value === 'string' && value.length <= 600 ? value.trim() : ''
}

function projectResult(body: Record<string, unknown>, status: number, ref: string): AutomaticResult {
  if (body.contract !== 'vrae.automatic-diagnosis.v1' || body.audit_ref !== ref ||
      body.formal_human_review !== false || body.publication !== 'UNPUBLISHED') throw new VraeFailure(503)
  const states = {
    CAPTURE_PENDING: 'running', AI_PENDING: 'analyzing', CAPTURE_FAILED: 'failed',
    DIAGNOSED: 'diagnosed', AI_UNAVAILABLE: 'ai-unavailable',
  } as const
  const wireState = body.state
  if (typeof wireState !== 'string' || !Object.hasOwn(states, wireState)) throw new VraeFailure(503)
  const state = states[wireState as keyof typeof states]
  if ((status === 202) !== (state === 'running' || state === 'analyzing') ||
      body.diagnosis_complete !== (state === 'diagnosed')) throw new VraeFailure(503)

  const pages = new Map<string, SourcePage>()
  for (const value of list(body.evidence)) {
    const item = object(value)
    const url = evidenceUrl(item?.url)
    const id = item?.snapshot_ref
    const checkedAt = item?.observed_at
    if (typeof id === 'string' && snapshotPattern.test(id) && url &&
        typeof checkedAt === 'string' && Number.isFinite(Date.parse(checkedAt))) {
      pages.set(id, { id, url, checkedAt, observed: item?.status === 'OBSERVED' })
    }
  }
  const knownUrls = new Set(Array.from(pages.values(), page => page.url))
  for (const value of list(body.coverage)) {
    const item = object(value)
    const url = evidenceUrl(item?.url)
    if (item?.scope === 'PAGE' && url && !knownUrls.has(url) && pages.size < 24) {
      knownUrls.add(url)
      const id = 'coverage-' + pages.size
      pages.set(id, { id, url, observed: false })
    }
  }
  const insights: BuyerInsight[] = []
  if (state === 'diagnosed') {
    const model = object(body.model)
    if (model?.verification_realm !== 'REAL_PROVIDER' || model.real_model_calls !== 1 ||
        model.state !== 'AI_CANDIDATES_FOR_HUMAN_REVIEW' ||
        object(model.usage)?.usage_origin !== 'PROVIDER_REPORTED') throw new VraeFailure(503)
    for (const value of list(body.claims)) {
      const claim = object(value)
      if (!claim) continue
      const task = claim.task
      const explanation = customerText(claim.explanation)
      if (typeof task !== 'string' || !taskNames.includes(task) || !explanation ||
          claim.status !== 'HUMAN_REVIEW_REQUIRED' || claim.guard_semantic_approval !== false) continue
      const bindings = object(claim.source_bindings)
      const sources = new Set<string>()
      for (const key of [...list(claim.refs), ...list(claim.counter_refs)]) {
        if (typeof key !== 'string' || !bindings || !Object.hasOwn(bindings, key)) continue
        const binding = object(bindings[key])
        const citation = object(object(object(binding?.fact)?.source)?.citation)
        const id = citation?.snapshot_ref
        const page = typeof id === 'string' ? pages.get(id) : undefined
        if (binding?.type === 'GUARD_LITERAL' && page?.observed && evidenceUrl(citation?.url) === page.url) {
          sources.add(page.id)
        }
      }
      const rebuild = list(claim.rebuild).map(customerText).filter(Boolean)
      const checks = [...list(claim.uncertainties), ...list(claim.questions)].map(customerText).filter(Boolean)
      if (sources.size && rebuild.length) insights.push({ task: task as BuyerTask, explanation, rebuild, checks, sources: [...sources] })
    }
    if (!insights.length) throw new VraeFailure(503)
  }
  return { state, pages: [...pages.values()], insights: insights.slice(0, 3) }
}

export function createDiagnosisClient(config: ServiceConfig) {
  const send = transport(config, 'diagnosis')
  const post = (path: string, expected: number, raw: string, session: DiagnosisSession) =>
    send(path, expected, diagnosisMedia, raw, diagnosisHeaders(session))
  return {
    async ready() {
      const { body } = await send('/health/ready', 200, jsonMedia)
      return body.api_version === diagnosisVersion && body.status === 'READY' && body.source_sha === config.sourceSha
    },
    async openapi() {
      const { body } = await send('/v1/openapi.json', 200, jsonMedia)
      const paths = object(body.paths)
      if (!object(object(paths?.[diagnosisPath])?.post) || !object(object(paths?.[resultPath])?.get)) {
        throw new VraeFailure(503)
      }
    },
    async intake(): Promise<DiagnosisConsent> {
      const { body } = await send('/v1/target-intake-contract', 200, jsonMedia)
      const automatic = object(body.automatic_diagnosis)
      if (body.contract !== intakeContract || automatic?.method !== 'POST' || automatic.path !== diagnosisPath ||
          automatic.result_path !== resultPath || automatic.consent_version !== automaticConsentVersion ||
          automatic.consent_text !== automaticConsentText) throw new VraeFailure(503)
      const hash = createHash('sha256').update(JSON.stringify(automaticConsentText)).digest('hex')
      return { version: automaticConsentVersion, text: automaticConsentText, hash }
    },
    async exchange(kind: 'invitation' | 'return', token: string) {
      if (!privateTokenPattern.test(token)) throw new VraeFailure(403)
      const path = kind === 'invitation' ? '/v1/invitation-session' : '/v1/return-sessions'
      const field = kind === 'invitation' ? 'invitation_token' : 'return_token'
      return diagnosisSession(await send(path, 200, diagnosisMedia, JSON.stringify({ [field]: token })))
    },
    async submit(raw: string, session: DiagnosisSession) {
      const { body } = await post(diagnosisPath, 202, raw, session)
      if (body.contract_version !== vfContract || body.run_status !== 'CREATED' || body.diagnosis_complete !== false) throw new VraeFailure(503)
      return requireMatch(body.audit_ref, auditRefPattern)
    },
    async result(ref: string, session: DiagnosisSession) {
      const path = resultPath.replace('{audit_ref}', requireMatch(ref, auditRefPattern))
      const { status, body } = await send(path, [200, 202], diagnosisMedia, undefined, diagnosisHeaders(session))
      return projectResult(body, status, ref)
    },
    async issueReturn(ref: string, session: DiagnosisSession) {
      const { body } = await send('/v1/audits/' + requireMatch(ref, auditRefPattern) + '/return-tokens',
        201, diagnosisMedia, '{"ttl_seconds":300}', diagnosisHeaders(session))
      if (body.contract !== 'vrae.task-return-token.v1') throw new VraeFailure(503)
      return requireMatch(body.return_token, privateTokenPattern)
    },
  }
}

/** Private customer read boundary. Connect a trusted per-person MFA/grant handoff before using from the website. */
export function createReportClient(config: ServiceConfig) {
  const send = transport(config, 'report')
  const call = async (path: string, raw?: string, headers?: Record<string, string>) => {
    const result = await send('/v1/report-authority' + path, 200, reportMedia, raw, headers)
    if (result.body.contract !== reportContract) throw new VraeFailure(503)
    return result
  }
  return {
    async ready() {
      const { body } = await call('/health')
      return body.ready === true && body.customer_release === true
    },
    async challenge() {
      const { body } = await call('/challenge', '{}')
      return { nonce: requireMatch(body.nonce, privateTokenPattern), csrf: requireMatch(body.csrf, privateTokenPattern) }
    },
    async exchange(responsibleBearer: string, challenge: { nonce: string; csrf: string }) {
      if (!/^Bearer [\w-]+\.[\w-]+\.[\w-]+$/.test(responsibleBearer) || responsibleBearer.length > 16_000) throw new VraeFailure(403)
      const { body } = await call('/session', JSON.stringify({
        responsible_bearer: responsibleBearer,
        nonce: requireMatch(challenge.nonce, privateTokenPattern),
        csrf: requireMatch(challenge.csrf, privateTokenPattern),
      }))
      return requireMatch(body.report_session, privateTokenPattern)
    },
    async read(ref: string, authority: { session: string; grant: string; token: string }) {
      const { body, headers } = await call('/audits/' + requireMatch(ref, auditRefPattern) + '/report', undefined, {
        'X-Report-Session': requireMatch(authority.session, privateTokenPattern),
        'X-Report-Grant': requireMatch(authority.grant, privateTokenPattern),
        'X-Report-Token': requireMatch(authority.token, privateTokenPattern),
      })
      const version = object(body.report_version)
      const decision = object(body.review_decision)
      const hash = requireMatch(body.display_hash, digestPattern)
      if (
        body.scope !== reportProfile || body.formal_human_review !== true || body.external_release !== true ||
        !object(body.report) || !version || version.status !== 'APPROVED' || !decision ||
        decision.action !== 'APPROVE' || typeof version.report_version_id !== 'string' ||
        decision.report_version_id !== version.report_version_id || decision.version !== version.version ||
        headers.etag !== '"' + hash + '"'
      ) throw new VraeFailure(403)
      return body
    },
  }
}
