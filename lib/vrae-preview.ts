// This configuration and all derived authority stay in the VEYFRONT server.
import { createCipheriv, createDecipheriv, randomBytes, randomUUID, X509Certificate, createPrivateKey } from 'node:crypto'
import { isIP } from 'node:net'
import {
  auditRefPattern, createDiagnosisClient, createReportClient, digestPattern, object, privateTokenPattern, VraeFailure,
  type DiagnosisConsent, type DiagnosisSession, type ServiceConfig,
} from './vrae-preview-client.ts'

export const previewSessionCookie = '__Host-vf-vrae-preview'
const handoffBranch = 'feature/vf-b-offline-g1-adapter'
export type PreviewSession = {
  session: DiagnosisSession
  pending?: { raw: string; acceptedAt: number; consentHash: string }
  ref?: string
  address?: string
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
  if (!diagnosis || !digestPattern.test(hex)) return
  return { client: createDiagnosisClient(diagnosis), key: Buffer.from(hex, 'hex') }
}

export function isAutomaticPreviewHost(host: string | null, env = process.env) {
  return env.VERCEL === '1' && env.VERCEL_ENV === 'preview' && env.VERCEL_GIT_COMMIT_REF === handoffBranch &&
    host === env.VERCEL_URL && Boolean(host?.endsWith('.vercel.app'))
}

// The one-use invitation is consumed only by the tester's submission on the SSO-protected deployment.
export function stagedPreviewInvitation(host: string | null, env = process.env) {
  const invite = env.VRAE_PREVIEW_INVITATION
  if (isAutomaticPreviewHost(host, env) && invite && privateTokenPattern.test(invite)) return invite
}

export function automaticPreviewAddress(value: unknown) {
  if (typeof value !== 'string') return
  const text = value.trim()
  if (!text || text.length > 500 || /[\s\\?#]/.test(text) || text.startsWith('/')) return
  try {
    const url = new URL(/^[a-z][a-z0-9+.-]*:\/\//i.test(text) ? text : 'https://' + text)
    const domain = url.hostname
    if (url.protocol !== 'https:' || url.port || url.username || url.password || isIP(domain) ||
        !/^[a-z0-9-]+(?:\.[a-z0-9-]+)+$/.test(domain) ||
        /\.(?:localhost|local|internal|test|invalid)$/.test(domain)) return
    // The VRAE automatic contract starts discovery from the site origin.
    return url.origin + '/'
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

export function preparePreviewDiagnosis(address: string, consent: DiagnosisConsent, language: 'zh' | 'en') {
  const acceptedAt = Date.now()
  return { acceptedAt, consentHash: consent.hash, raw: JSON.stringify({
    url: address,
    authorized: true,
    consent_version: consent.version,
    idempotency_key: randomUUID(),
    accepted_at: new Date(acceptedAt).toISOString(),
    language,
  }) }
}

export function currentPreviewDiagnosis(current: PreviewSession) {
  const now = Date.now()
  const pending = current.pending
  if (!pending || pending.acceptedAt > now || pending.acceptedAt < now - 30 * 60_000) throw new VraeFailure(403)
  return pending.raw
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
  const p = object(entry?.pending)
  const pending = typeof p?.raw === 'string' && typeof p.acceptedAt === 'number' &&
    typeof p.consentHash === 'string' && digestPattern.test(p.consentHash)
    ? { raw: p.raw, acceptedAt: p.acceptedAt, consentHash: p.consentHash } : undefined
  const address = automaticPreviewAddress(entry?.address)
  return { session: { cookie: session.cookie, csrf: session.csrf, expiresAt: session.expiresAt }, ref, pending, address }
}
