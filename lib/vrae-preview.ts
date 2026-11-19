// This configuration and all derived authority stay in the VEYFRONT server.
import { createCipheriv, createDecipheriv, createHash, randomBytes, X509Certificate, createPrivateKey } from 'node:crypto'
import { isIP } from 'node:net'
import {
  auditRefPattern, createDiagnosisClient, createReportClient, object, privateTokenPattern, targetIdPattern, vfContract, VraeFailure,
  type DiagnosisSession, type ServiceConfig,
} from './vrae-preview-client.ts'

export const previewSessionCookie = '__Host-vf-vrae-preview'
type Language = 'zh' | 'en'
export type PreviewSession = { session: DiagnosisSession; request?: string; ref?: string }
type SignedSubmission = {
  raw: string
  target: string
  expiresAt: number
  subject: unknown
  invitation: unknown
  tenant: unknown
  url: string
  mode: 'L0' | 'L1'
  language: Language
  consentText: string
  fingerprint: string
}

export function isPreviewSameOrigin(headers: Headers, hosted = Boolean(process.env.VERCEL)) {
  const origin = headers.get('origin')
  const fetchSite = headers.get('sec-fetch-site')
  if (!origin || (fetchSite && fetchSite !== 'same-origin')) return false
  try {
    const url = new URL(origin)
    if (origin !== url.origin || headers.get('host') !== url.host) return false
    if (url.protocol === 'https:') return true
    // Self-hosted Next may normalize a loopback request URL to localhost.
    return !hosted && url.protocol === 'http:' && ['127.0.0.1', 'localhost', '[::1]'].includes(url.hostname)
  } catch {
    return false
  }
}

function pem(value: string | undefined) {
  return (value ?? '').replace(/\\n/g, '\n')
}

export function serviceConfig(kind: 'DIAGNOSIS' | 'REPORT', env = process.env): ServiceConfig | undefined {
  const prefix = 'VRAE_' + kind + '_'
  try {
    const origin = new URL(env[prefix + 'BASE_URL'] ?? '')
    const hostname = origin.hostname
    if (
      origin.protocol !== 'https:' || origin.href !== origin.origin + '/' || origin.username || origin.password ||
      !hostname.includes('.') || isIP(hostname.replace(/^\[|\]$/g, '')) ||
      /(?:^|\.)(?:localhost|local|internal|test|invalid|example)\.?$/.test(hostname)
    ) return
    const ca = pem(env[prefix + 'CA_PEM'])
    const cert = pem(env[prefix + 'CLIENT_CERT_PEM'])
    const key = pem(env[prefix + 'CLIENT_KEY_PEM'])
    const bearer = env[prefix + 'BEARER'] ?? ''
    const sourceSha = env[prefix + 'SOURCE_SHA'] ?? ''
    if (!/^[a-f0-9]{40}$/.test(sourceSha) || !/^[A-Za-z0-9._~+/-]{16,512}={0,2}$/.test(bearer)) return
    if (!new X509Certificate(cert).checkPrivateKey(createPrivateKey(key))) return
    new X509Certificate(ca)
    return { origin, ca, cert, key, bearer, sourceSha }
  } catch {
    return undefined
  }
}

export function previewConfig(env = process.env) {
  if (env.VERCEL_ENV !== 'preview' || env.VF_VRAE_PREVIEW_ENABLED !== '1') return
  const diagnosis = serviceConfig('DIAGNOSIS', env)
  const hex = env.VF_VRAE_PREVIEW_SESSION_KEY ?? ''
  const grants = env.VF_VRAE_PREVIEW_SIGNED_SUBMISSIONS
  if (!diagnosis || !/^[0-9a-f]{64}$/.test(hex) || !grants || Buffer.byteLength(grants) > 256_000) return
  try {
    const entries: unknown = JSON.parse(grants)
    if (!Array.isArray(entries) || !entries.length || entries.length > 40) return
    const submissions = entries.map(validateSubmission)
    if (submissions.some(value => !value)) return
    return { client: createDiagnosisClient(diagnosis), key: Buffer.from(hex, 'hex'), submissions: submissions as SignedSubmission[] }
  } catch {
    return undefined
  }
}

export function previewReportClient(env = process.env) {
  if (env.VERCEL_ENV !== 'preview' || env.VF_VRAE_PREVIEW_ENABLED !== '1') return
  const diagnosis = serviceConfig('DIAGNOSIS', env)
  const report = serviceConfig('REPORT', env)
  if (!diagnosis || !report || diagnosis.bearer === report.bearer ||
      new X509Certificate(diagnosis.cert).publicKey.equals(new X509Certificate(report.cert).publicKey)) return
  return createReportClient(report)
}

function validateSubmission(value: unknown): SignedSubmission | undefined {
  const grant = object(value)
  if (
    !grant || typeof grant.targetId !== 'string' || !targetIdPattern.test(grant.targetId) ||
    typeof grant.expiresAt !== 'string' || typeof grant.consentText !== 'string' ||
    !grant.consentText.trim() || grant.consentText.length > 4000 ||
    typeof grant.signedSubmission !== 'string' || Buffer.byteLength(grant.signedSubmission) > 32_000
  ) return
  const expiresAt = Date.parse(grant.expiresAt)
  const raw = grant.signedSubmission
  const body = object(JSON.parse(raw))
  const command = object(body?.command)
  const request = object(command?.request)
  const permission = object(command?.permission_reference)
  const consent = object(body?.diagnosis_consent)
  const textHash = createHash('sha256').update(JSON.stringify(grant.consentText)).digest('hex')
  if (
    !Number.isFinite(expiresAt) || !body || body.contract_version !== vfContract || !object(body.submission_proof) ||
    typeof body.subject_ref !== 'string' || typeof body.invitation_ref !== 'string' || !request ||
    typeof request.tenant_id !== 'string' || typeof request.site_url !== 'string' || typeof request.idempotency_key !== 'string' ||
    (request.audit_mode !== 'L0' && request.audit_mode !== 'L1') ||
    (body.language !== 'zh' && body.language !== 'en') || !permission || !object(permission.proof) ||
    !consent || typeof consent.consent_version !== 'string' || consent.consent_version !== permission.consent_version ||
    consent.text_sha256 !== textHash || permission.consent_sha256 !== textHash ||
    typeof consent.accepted_at !== 'string' || !(Date.parse(consent.accepted_at) <= Date.now())
  ) return
  const url = new URL(request.site_url)
  if (url.protocol !== 'https:' || url.href !== url.origin + '/' || request.site_url !== url.href ||
      url.username || url.password || url.port || body.normalized_host !== url.hostname) return
  return {
    raw, expiresAt, consentText: grant.consentText, target: grant.targetId,
    subject: body.subject_ref, invitation: body.invitation_ref, tenant: request.tenant_id,
    url: url.href, mode: request.audit_mode, language: body.language,
    fingerprint: createHash('sha256').update(raw).digest('hex'),
  }
}

export function authorizedSubmission(
  entries: SignedSubmission[], plan: Record<string, unknown>, language: Language, fingerprint?: string,
) {
  const matches = entries.filter(entry =>
    entry.target === plan.target_id && entry.expiresAt > Date.now() && entry.subject === plan.subject_ref &&
    entry.invitation === plan.invitation_ref && entry.tenant === plan.tenant_id && entry.url === plan.site_url &&
    entry.language === language && Array.isArray(plan.audit_modes) && plan.audit_modes.includes(entry.mode) &&
    (!fingerprint || entry.fingerprint === fingerprint),
  )
  if (matches.length !== 1) throw new VraeFailure(403)
  return matches[0]
}

export function matchesSubmittedUrl(raw: string, approved: string) {
  const address = raw.trim()
  if (!address || /[\\?#\s]/.test(address)) return false
  try {
    const url = new URL(/^[a-z][a-z\d+.-]*:\/\//i.test(address) ? address : 'https://' + address)
    return !url.username && !url.password && !url.port && url.href === approved
  } catch {
    return false
  }
}

type Purpose = 'session' | 'return'
export function seal(key: Buffer, purpose: Purpose, data: unknown) {
  const iv = randomBytes(12)
  const cipher = createCipheriv('aes-256-gcm', key, iv)
  cipher.setAAD(Buffer.from('veyfront-vrae-preview-v1:' + purpose))
  const ciphertext = Buffer.concat([cipher.update(JSON.stringify(data), 'utf8'), cipher.final()])
  return Buffer.concat([iv, cipher.getAuthTag(), ciphertext]).toString('base64url')
}

export function unseal(key: Buffer, purpose: Purpose, value: string | undefined) {
  if (!value || !/^[A-Za-z0-9_-]{40,3072}$/.test(value)) return
  try {
    const bytes = Buffer.from(value, 'base64url')
    const decipher = createDecipheriv('aes-256-gcm', key, bytes.subarray(0, 12))
    decipher.setAAD(Buffer.from('veyfront-vrae-preview-v1:' + purpose))
    decipher.setAuthTag(bytes.subarray(12, 28))
    return object(JSON.parse(Buffer.concat([decipher.update(bytes.subarray(28)), decipher.final()]).toString('utf8')))
  } catch {
    return undefined
  }
}

export function readPreviewSession(key: Buffer, value: string | undefined): PreviewSession {
  const entry = unseal(key, 'session', value)
  const session = object(entry?.session)
  if (
    !session || typeof session.expiresAt !== 'number' || session.expiresAt <= Date.now() ||
    typeof session.cookie !== 'string' || !privateTokenPattern.test(session.cookie) ||
    typeof session.csrf !== 'string' || !privateTokenPattern.test(session.csrf)
  ) throw new VraeFailure(403)
  const ref = typeof entry?.ref === 'string' && auditRefPattern.test(entry.ref) ? entry.ref : undefined
  const request = typeof entry?.request === 'string' ? entry.request : undefined
  return { session: { cookie: session.cookie, csrf: session.csrf, expiresAt: session.expiresAt }, ref, request }
}
