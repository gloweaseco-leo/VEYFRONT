// This configuration and all derived authority stay in the VEYFRONT server.
import { createCipheriv, createDecipheriv, randomBytes, X509Certificate, createPrivateKey } from 'node:crypto'
import { isIP } from 'node:net'
import {
  auditRefPattern, createDiagnosisClient, createReportClient, digestPattern, object, privateTokenPattern, VraeFailure,
  type DiagnosisConsent, type DiagnosisSession, type ServiceConfig,
} from './vrae-preview-client.ts'

export const previewSessionCookie = '__Host-vf-vrae-preview'
export type PreviewSession = {
  session: DiagnosisSession
  intent?: string
  scope?: { url: string; consentHash: string; consentVersion: string; expiresAt: number }
  pending?: { raw: string; acceptedAt: number }
  ref?: string
}
const intentPattern = /^[a-f0-9-]{36}$/

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
  const configuredTarget = env.VF_VRAE_PREVIEW_TARGET_URL ?? ''
  if (!diagnosis || !digestPattern.test(hex) || configuredTarget.length > 500) return
  try {
    const target = new URL(configuredTarget)
    const hostname = target.hostname
    if (target.protocol !== 'https:' || configuredTarget !== target.origin + '/' || target.href !== configuredTarget ||
        target.port || !hostname.includes('.') || isIP(hostname) || hostname.endsWith('.') ||
        /(?:^|\.)(?:localhost|local|internal|test|invalid|example)$/.test(hostname)) return
    return { client: createDiagnosisClient(diagnosis), key: Buffer.from(hex, 'hex'), targetUrl: target.href }
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

/** Invoked only after the tester confirms diagnosis of the already authorised scope. */
export function preparePreviewDiagnosis(current: PreviewSession, targetUrl: string, consent: DiagnosisConsent, language: 'zh' | 'en') {
  const now = Date.now()
  if (!current.intent || current.ref || current.scope?.url !== targetUrl || current.scope.expiresAt <= now ||
      current.scope.consentHash !== consent.hash || current.scope.consentVersion !== consent.version) throw new VraeFailure(403)
  if (current.pending) return current.pending
  return { acceptedAt: now, raw: JSON.stringify({
    url: targetUrl,
    idempotency_key: current.intent,
    accepted_at: new Date(now).toISOString(),
    consent_version: consent.version,
    language,
  }) }
}

export function currentPreviewDiagnosis(current: PreviewSession, targetUrl: string) {
  const now = Date.now()
  if (!current.pending || current.scope?.url !== targetUrl || current.scope.expiresAt <= now ||
      current.pending.acceptedAt > now || current.pending.acceptedAt <= now - 30 * 60_000) throw new VraeFailure(403)
  return current.pending.raw
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
  const intent = typeof entry?.intent === 'string' && intentPattern.test(entry.intent) ? entry.intent : undefined
  const s = object(entry?.scope)
  const scope = typeof s?.url === 'string' && typeof s.consentHash === 'string' && digestPattern.test(s.consentHash) &&
    typeof s.consentVersion === 'string' && typeof s.expiresAt === 'number'
    ? { url: s.url, consentHash: s.consentHash, consentVersion: s.consentVersion, expiresAt: s.expiresAt } : undefined
  const p = object(entry?.pending)
  const pending = typeof p?.raw === 'string' && typeof p.acceptedAt === 'number'
    ? { raw: p.raw, acceptedAt: p.acceptedAt } : undefined
  return { session: { cookie: session.cookie, csrf: session.csrf, expiresAt: session.expiresAt }, ref, intent, scope, pending }
}
