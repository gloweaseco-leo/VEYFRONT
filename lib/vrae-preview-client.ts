// Server only. The browser never supplies an upstream host, service credentials, or path.
import { request } from 'node:https'
import { createHash } from 'node:crypto'
import type { IncomingHttpHeaders } from 'node:http'

export const vfContract = 'vf-vrae-r0.1-vfb.1'
export const diagnosisVersion = 'vrae.diagnosis-api.v1'
export const reportContract = 'vrae.report-authority.v1'
export const reportProfile = 'VERIFIED_HUMAN_CUSTOMER_REPORT'
export const targetIdPattern = /^[A-Za-z0-9][A-Za-z0-9_.-]{2,127}$/
export const auditRefPattern = /^aref-[0-9a-f]{32}$/
export const privateTokenPattern = /^[A-Za-z0-9._~-]{16,512}$/
export const digestPattern = /^[0-9a-f]{64}$/
const diagnosisMedia = `application/vnd.vrae.launch+json; profile="${vfContract}"`
const reportMedia = `application/vnd.vrae.report+json; profile="${reportContract}"`
const jsonMedia = 'application/json'
const targetCookie = '__Host-vrae-targets'
const intakeContract = 'vrae.target-intake.v1'
const applicationContract = 'vrae.target-application.v1'
const applicationPath = '/v1/target-applications'
const authorisationPath = applicationPath + '/authorize'
const diagnosisPath = '/v1/diagnoses'

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
type Wire = { body: Record<string, unknown>; headers: IncomingHttpHeaders }
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
  return (path: string, expected: number, media: string, raw?: string, privateHeaders?: Record<string, string>) =>
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
        const status = response.statusCode
        const expectedMedia = meta['content-type'] === media ||
          (profile === 'diagnosis' && media === jsonMedia && status !== expected &&
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
            if (status !== expected) {
              if (status === 403 || status === 404 || status === 409) throw new VraeFailure(status)
              if (status === 429) {
                const seconds = Number(meta['retry-after'] ?? body.retry_after_seconds)
                throw new VraeFailure(429, Number.isInteger(seconds) && seconds >= 1 && seconds <= 900 ? seconds : 60)
              }
              throw new VraeFailure(503)
            }
            resolve({ body, headers: meta })
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

export function createDiagnosisClient(config: ServiceConfig) {
  const send = transport(config, 'diagnosis')
  const get = (path: string, session: DiagnosisSession) => send(path, 200, diagnosisMedia, undefined, diagnosisHeaders(session))
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
      if (![applicationPath, authorisationPath, diagnosisPath].every(path => object(object(paths?.[path])?.post))) {
        throw new VraeFailure(503)
      }
    },
    async intake(): Promise<DiagnosisConsent> {
      const { body } = await send('/v1/target-intake-contract', 200, jsonMedia)
      if (body.contract !== intakeContract || object(body.application)?.path !== applicationPath ||
          object(body.authorization)?.path !== authorisationPath || object(body.diagnosis)?.path !== diagnosisPath) {
        throw new VraeFailure(503)
      }
      const version = requireMatch(body.consent_version, /^[A-Za-z0-9_.-]{1,128}$/)
      const hash = requireMatch(body.consent_text_sha256, digestPattern)
      if (typeof body.consent_text !== 'string' || !body.consent_text.trim() || body.consent_text.length > 4000 ||
          createHash('sha256').update(JSON.stringify(body.consent_text)).digest('hex') !== hash) throw new VraeFailure(503)
      return { version, hash, text: body.consent_text }
    },
    async exchange(kind: 'invitation' | 'return', token: string) {
      if (!privateTokenPattern.test(token)) throw new VraeFailure(403)
      const path = kind === 'invitation' ? '/v1/invitation-session' : '/v1/return-sessions'
      const field = kind === 'invitation' ? 'invitation_token' : 'return_token'
      return diagnosisSession(await send(path, 200, diagnosisMedia, JSON.stringify({ [field]: token })))
    },
    async authorise(url: string, consent: DiagnosisConsent, session: DiagnosisSession) {
      const { body: application } = await post(applicationPath, 201, JSON.stringify({
        url, paths: [], consent: { version: consent.version, read_only_authorized: true, model_data_notice: true },
      }), session)
      if (application.contract !== applicationContract || application.consent_version !== consent.version ||
          application.consent_text_sha256 !== consent.hash) throw new VraeFailure(503)
      // The first Preview only uses a VRAE operator-owned origin. Do not follow a DNS challenge.
      if (object(application.proof)?.type !== 'OPERATOR_OWNED_PUBLIC_ORIGIN') throw new VraeFailure(403)
      if (typeof application.expires_at !== 'string' || !(Date.parse(application.expires_at) > Date.now())) throw new VraeFailure(403)
      const applicationToken = requireMatch(application.application_token, /^[A-Za-z0-9_-]{32,8192}={0,2}$/)
      const { body } = await post(authorisationPath, 201, JSON.stringify({ application_token: applicationToken }), session)
      if (body.contract !== applicationContract || body.state !== 'AUTHORIZED_FOR_READONLY_DIAGNOSIS' ||
          body.legal_reference_kind !== 'OPERATOR_OWNED_PUBLIC_SOURCE') throw new VraeFailure(403)
      requireMatch(body.target_id, targetIdPattern)
      const expiresAt = typeof body.expires_at === 'string' ? Date.parse(body.expires_at) : NaN
      if (!(expiresAt > Date.now())) throw new VraeFailure(403)
      return expiresAt
    },
    async submit(raw: string, session: DiagnosisSession) {
      const { body } = await post(diagnosisPath, 202, raw, session)
      if (body.contract_version !== vfContract || body.run_status !== 'CREATED' || body.diagnosis_complete !== false) throw new VraeFailure(503)
      return requireMatch(body.audit_ref, auditRefPattern)
    },
    async status(ref: string, session: DiagnosisSession, onDraftReady?: () => void) {
      const { body } = await get('/v1/audits/' + requireMatch(ref, auditRefPattern), session)
      if (body.contract_version !== vfContract || body.audit_ref !== ref) throw new VraeFailure(503)
      const access = object(body.access)?.state
      if (access === 'EXPIRED') return 'expired'
      if (access === 'REVOKED' || body.display_state === 'access-ended') return 'access-ended'
      if (access !== 'ACTIVE') throw new VraeFailure(503)
      const task = object(body.task)?.status
      const publication = object(body.publication)?.state
      if (publication === 'WITHDRAWN') return 'access-ended'
      switch (body.display_state) {
        case 'accepted':
        case 'failed':
        case 'unavailable':
          return body.display_state
        case 'running':
          if (publication === 'UNPUBLISHED') {
            if (task === 'DRAFT_READY') onDraftReady?.()
            return task === 'DRAFT_READY' || task === 'REVIEW_REQUIRED' ? 'awaiting-report' : 'running'
          }
          break
        case 'completed':
          if (publication === 'APPROVED_FULL') return 'awaiting-access'
          break
        case 'partial':
          if (publication === 'APPROVED_PARTIAL') return 'awaiting-access'
      }
      throw new VraeFailure(503)
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
