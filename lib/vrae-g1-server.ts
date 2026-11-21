// Node-only adapter for the accepted G1 offline facade. Keep this outside client code.
import { createHash } from 'node:crypto'
import { request as httpsRequest } from 'node:https'
import { checkServerIdentity } from 'node:tls'

export const g1Profile = 'vf-vrae-r0.1-vfb.1'
export const g1MediaType = `application/vnd.vrae.launch+json; profile="${g1Profile}"`
const host = '127.0.0.1'
const port = 8766
const upstreamOrigin = `https://${host}:${port}`
const sourceScope = 'OFFLINE_SYNTHETIC_NO_RELEASE'
const limitBytes = 2_000_000
const auditRefPattern = /^aref-[0-9a-f]{32}$/
const digestPattern = /^[a-f0-9]{64}$/
const safeValue = /^[A-Za-z0-9._~-]{16,512}$/
const challengeCookie = '__Host-vrae-g1-challenge'
const sessionCookie = '__Host-vrae-g1'
const taskStages = [
  'CREATED', 'POLICY_CHECK', 'QUEUED', 'FETCHING', 'EVIDENCE_READY', 'RULED',
  'DRAFT_READY', 'REVIEW_REQUIRED', 'POLICY_BLOCKED', 'ACCESS_BLOCKED',
  'INSUFFICIENT_EVIDENCE', 'MODEL_INVALID', 'FAILED', 'CANCELLED',
] as const
type G1Stage = typeof taskStages[number]

type Config = {
  ca: string
  certificateSha256: string
  sourceSha: string
  serviceToken: string
}

type Authority = {
  tenantId: string
  subjectRef: string
  invitationRef: string
  permissionRef: string
  siteUrl: string
  language: 'en' | 'zh'
  consent: { version: string; textSha256: string; acceptedAt: string }
  signedSubmission: string
}

export type G1Session = {
  auditRef: string
  cookie: string
  csrf: string
}

type Refusal = {
  ok: false
  status: 403 | 409 | 429 | 503
  retryAfterSeconds: number | null
}
type Success<T> = { ok: true; value: T }
type Result<T> = Success<T> | Refusal

type WireResponse = {
  status: number
  body: Record<string, unknown>
  setCookie: string[]
  csrf?: string
}

function record(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown> : null
}

function refuse(status: Refusal['status'] = 503, retryAfterSeconds: number | null = null): Refusal {
  return { ok: false, status, retryAfterSeconds }
}

function seconds(value: unknown, max = 300) {
  return typeof value === 'number' && Number.isInteger(value) && value >= 1 && value <= max ? value : null
}

function safeRefusal(response: WireResponse): Refusal {
  const { status, body } = response
  if (body.contract_version !== g1Profile || body.http_status !== status) return refuse()
  if (status === 403 || status === 409) return refuse(status)
  if (status === 429 || status === 503) {
    return refuse(status, body.retryable === true ? seconds(body.retry_after_seconds) : null)
  }
  return refuse()
}

/** G1 accepts externally signed, server-resolved consent and site authorization. */
function signedSubmission(authority: Authority): string | null {
  const raw = authority.signedSubmission
  if (Buffer.byteLength(raw) > limitBytes) return null
  try {
    const body = record(JSON.parse(raw))
    const command = record(body?.command)
    const input = record(command?.request)
    const permission = record(command?.permission_reference)
    const consent = record(body?.diagnosis_consent)
    const target = new URL(authority.siteUrl)
    const acceptedAt = Date.parse(authority.consent.acceptedAt)
    if (
      body?.contract_version !== g1Profile || !record(body.submission_proof) ||
      !input || !permission || !record(permission.proof) ||
      input.tenant_id !== authority.tenantId || input.site_url !== authority.siteUrl ||
      input.audit_mode !== 'L1' || permission.reference !== authority.permissionRef ||
      typeof input.idempotency_key !== 'string' || input.idempotency_key.length < 8 ||
      body.subject_ref !== authority.subjectRef || body.invitation_ref !== authority.invitationRef ||
      body.language !== authority.language || body.normalized_host !== target.hostname ||
      target.protocol !== 'https:' || target.username || target.password ||
      !Number.isFinite(acceptedAt) || acceptedAt > Date.now() ||
      !digestPattern.test(authority.consent.textSha256) ||
      consent?.consent_version !== authority.consent.version ||
      consent?.text_sha256 !== authority.consent.textSha256 ||
      consent?.accepted_at !== authority.consent.acceptedAt
    ) return null
    return raw
  } catch {
    return null
  }
}

function readCookie(response: WireResponse, name: string) {
  const lines = response.setCookie.filter(line => line.startsWith(name + '='))
  if (lines.length !== 1) return null
  const [pair, ...attributes] = lines[0].split(';').map(attr => attr.trim())
  const value = pair.slice(name.length + 1)
  const attrs = new Set(attributes.map(attr => attr.toLowerCase()))
  const age = attributes.filter(attr => /^max-age=/i.test(attr))
  if (
    !safeValue.test(value) || age.length !== 1 || !/^max-age=[1-9]\d*$/i.test(age[0]) ||
    !attrs.has('path=/') || !attrs.has('secure') || !attrs.has('httponly') ||
    !attrs.has('samesite=strict') || attributes.some(attr => /^domain\s*=/i.test(attr))
  ) return null
  return value
}

function challengeDeleted(response: WireResponse) {
  return response.setCookie.filter(line => line.startsWith(challengeCookie + '=')).length === 1 &&
    response.setCookie.some(line => line.startsWith(challengeCookie + '=;') && /;\s*Max-Age=0(?:;|$)/i.test(line))
}

/** The G1 transport only connects inside the caller's owned local namespace. */
export function createG1Adapter(config: Config) {
  if (!/^[a-f0-9]{40}$/.test(config.sourceSha) ||
      !digestPattern.test(config.certificateSha256) || !safeValue.test(config.serviceToken) ||
      !config.ca.includes('-----BEGIN CERTIFICATE-----')) throw new Error('Invalid G1 transport configuration')

  function send(path: string, method: 'GET' | 'POST', raw?: string, session?: { cookie: string; csrf: string }): Promise<WireResponse> {
    return new Promise((resolve, reject) => {
      const headers: Record<string, string | number> = {
        Accept: g1MediaType,
        Authorization: 'Bearer ' + config.serviceToken,
        Origin: upstreamOrigin,
      }
      if (session) {
        headers.Cookie = session.cookie
        headers['X-G1-CSRF'] = session.csrf
      }
      if (raw !== undefined) {
        headers['Content-Type'] = g1MediaType
        headers['Content-Length'] = Buffer.byteLength(raw)
      }
      const request = httpsRequest({
        method, path, host, port, headers, agent: false,
        ca: config.ca, rejectUnauthorized: true, minVersion: 'TLSv1.2',
        signal: AbortSignal.timeout(8000),
        checkServerIdentity(name, cert) {
          const error = checkServerIdentity(name, cert)
          if (error) return error
          const sha = createHash('sha256').update(cert.raw).digest('hex')
          return sha === config.certificateSha256 ? undefined : new Error('G1 certificate pin mismatch')
        },
      }, response => {
        const safeHeaders = response.headers['content-type'] === g1MediaType &&
          response.headers['x-vrae-source-sha'] === config.sourceSha &&
          response.headers['x-vrae-scope'] === sourceScope &&
          response.headers['x-g1-ai-state'] === 'NO_MODEL' &&
          /(?:^|,\s*)no-store(?:,|$)/i.test(response.headers['cache-control'] ?? '')
        if (!safeHeaders) {
          response.destroy()
          reject(new Error('Invalid G1 response'))
          return
        }
        let size = 0
        const chunks: Buffer[] = []
        response.on('error', reject)
        response.on('data', (chunk: Buffer) => {
          size += chunk.length
          if (size > limitBytes) {
            response.destroy(new Error('G1 response limit'))
            return
          }
          chunks.push(chunk)
        })
        response.on('end', () => {
          try {
            const body = record(JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(Buffer.concat(chunks))))
            if (!body || !response.statusCode) throw new Error('Invalid G1 response')
            const csrf = response.headers['x-g1-csrf']
            resolve({ status: response.statusCode, body, setCookie: response.headers['set-cookie'] ?? [],
              csrf: typeof csrf === 'string' && safeValue.test(csrf) ? csrf : undefined })
          } catch (error) { reject(error) }
        })
      })
      request.on('error', reject)
      request.end(raw)
    })
  }

  async function submit(authority: Authority): Promise<Result<{ auditRef: string; pollAfterSeconds: number }>> {
    const raw = signedSubmission(authority)
    if (!raw) return refuse(403)
    try {
      const response = await send('/v1/audit-requests', 'POST', raw)
      if (response.status !== 202) return safeRefusal(response)
      const { body } = response
      const pollAfterSeconds = seconds(body.poll_after_seconds)
      if (
        body.contract_version !== g1Profile || typeof body.audit_ref !== 'string' ||
        !auditRefPattern.test(body.audit_ref) || body.run_status !== 'CREATED' ||
        body.diagnosis_complete !== false || !pollAfterSeconds
      ) return refuse()
      return { ok: true, value: { auditRef: body.audit_ref, pollAfterSeconds } }
    } catch { return refuse() }
  }

  async function exchange(
    auditRef: string, returnToken: string,
  ): Promise<Result<G1Session>> {
    if (!auditRefPattern.test(auditRef) || !safeValue.test(returnToken)) return refuse(403)
    try {
      const challenge = await send('/v1/return-challenge', 'GET')
      if (challenge.status !== 200) return safeRefusal(challenge)
      const cookie = readCookie(challenge, challengeCookie)
      if (challenge.body.challenge_ready !== true || !cookie || !challenge.csrf) return refuse()
      const response = await send(`/v1/audits/${auditRef}/return/exchange`, 'POST',
        JSON.stringify({ return_token: returnToken }), { cookie: `${challengeCookie}=${cookie}`, csrf: challenge.csrf })
      if (response.status !== 200) return safeRefusal(response)
      const restored = readCookie(response, sessionCookie)
      if (response.body.restored !== true || !restored || !response.csrf || !challengeDeleted(response)) return refuse()
      return { ok: true, value: { auditRef, cookie: restored, csrf: response.csrf } }
    } catch { return refuse() }
  }

  async function status(auditRef: string, session: G1Session): Promise<Result<{
    state: 'accepted' | 'running' | 'failed' | 'access-ended'
    taskStage: G1Stage
    reportAvailable: false
  }>> {
    if (auditRef !== session.auditRef || !auditRefPattern.test(auditRef) ||
        !safeValue.test(session.cookie) || !safeValue.test(session.csrf)) return refuse(403)
    try {
      const response = await send(`/v1/audits/${auditRef}`, 'GET', undefined, {
        cookie: `${sessionCookie}=${session.cookie}`, csrf: session.csrf,
      })
      if (response.status !== 200) return safeRefusal(response)
      const { body } = response
      const task = record(body.task)
      const stage = taskStages.find(value => value === task?.status)
      const publication = record(body.publication)
      const access = record(body.access)
      if (
        body.contract_version !== g1Profile || body.audit_ref !== auditRef || !stage ||
        task?.progress_percent !== null || publication?.state !== 'UNPUBLISHED' ||
        publication?.report_version_id !== null ||
        (access?.state !== 'ACTIVE' && access?.state !== 'EXPIRED' && access?.state !== 'ENDED')
      ) return refuse()
      if (access.state !== 'ACTIVE') return refuse(403)
      const state = body.display_state
      if (state !== 'accepted' && state !== 'running' && state !== 'failed' && state !== 'access-ended') return refuse()
      return { ok: true, value: { state, taskStage: stage, reportAvailable: false } }
    } catch { return refuse() }
  }

  return { submit, exchange, status }
}
