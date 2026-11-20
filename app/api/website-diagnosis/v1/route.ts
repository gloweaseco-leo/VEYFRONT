import { NextResponse, type NextRequest } from 'next/server'
import { randomUUID } from 'node:crypto'
import { isJsonContentType, readLeadBody } from '@/lib/lead-request'
import { auditRefPattern, object, privateTokenPattern, VraeFailure } from '@/lib/vrae-preview-client'
import {
  currentPreviewDiagnosis, isPreviewSameOrigin, preparePreviewDiagnosis, previewConfig, previewSessionCookie,
  readPreviewSession, seal, stagedPreviewInvitation, unseal, type PreviewSession,
} from '@/lib/vrae-preview'

export const runtime = 'nodejs'

function reply(data: Record<string, unknown>, status = 200, retryAfter?: number) {
  const headers: Record<string, string> = {
    'Cache-Control': 'private, no-store',
    'Referrer-Policy': 'no-referrer',
    'X-Robots-Tag': 'noindex, nofollow',
  }
  if (retryAfter) headers['Retry-After'] = String(retryAfter)
  return NextResponse.json(data, { status, headers })
}

function withSession(key: Buffer, session: PreviewSession, body: Record<string, unknown>, status = 200) {
  const response = reply(body, status)
  response.cookies.set(previewSessionCookie, seal(key, 'session', session), {
    secure: true, httpOnly: true, sameSite: 'strict', path: '/',
    maxAge: Math.max(1, Math.floor((session.session.expiresAt - Date.now()) / 1000)),
  })
  return response
}

function field(body: Record<string, unknown>, name: string, pattern: RegExp) {
  const value = body[name]
  if (typeof value !== 'string' || !pattern.test(value)) throw new VraeFailure(403)
  return value
}

async function checkConnection(client: NonNullable<ReturnType<typeof previewConfig>>['client']) {
  const [ready, , consent] = await Promise.all([client.ready(), client.openapi(), client.intake()])
  if (!ready) throw new VraeFailure(503)
  return consent
}

export async function GET(request: NextRequest) {
  const config = previewConfig()
  if (!config || !stagedPreviewInvitation(request.headers.get('host'))) return reply({ state: 'closed' }, 404)
  try {
    await checkConnection(config.client)
    return reply({ state: 'ready', ready: 200, openapi: 200, intake: 200 })
  } catch (error) {
    const upstream = error instanceof VraeFailure ? error.status : 503
    return reply({ state: 'unavailable', upstream }, upstream === 403 ? 403 : 503)
  }
}

export async function POST(request: NextRequest) {
  const config = previewConfig()
  if (!config) return reply({ state: 'closed' }, 404)
  if (!isPreviewSameOrigin(request.headers) || !isJsonContentType(request) || request.nextUrl.search) return reply({ state: 'denied' }, 403)
  const input = await readLeadBody(request, 4096)
  if (input.kind !== 'ok') return reply({ state: 'invalid' }, input.kind === 'too-large' ? 413 : 400)

  const { client, key, targetUrl } = config
  const staged = stagedPreviewInvitation(request.headers.get('host'))
  const evidence = (event: 'invitation200' | 'application201_authorize201' | 'diagnoses202' | 'DRAFT_READY_status200') => {
    if (staged) console.info('VRAE_PREVIEW_EVIDENCE ' + event)
  }
  const readStatus = (current: PreviewSession, ref: string) =>
    client.status(ref, current.session, () => evidence('DRAFT_READY_status200'))
  try {
    const body = object(JSON.parse(input.text))
    if (!body) return reply({ state: 'invalid' }, 400)
    if (body.action === 'invite' || body.action === 'claim-preview') {
      const token = body.action === 'invite' ? field(body, 'token', privateTokenPattern) : staged
      if (!token) throw new VraeFailure(403)
      if (body.action === 'claim-preview' && (Object.keys(body).length !== 1 || request.cookies.has(previewSessionCookie))) {
        throw new VraeFailure(409)
      }
      const consent = await checkConnection(client)
      const session = await client.exchange('invitation', token)
      evidence('invitation200')
      return withSession(key, { session, intent: randomUUID() },
        { state: 'authorised', address: targetUrl, consentText: consent.text, consentHash: consent.hash })
    }
    if (body.action === 'restore') {
      const envelope = unseal(key, 'return', field(body, 'token', /^[A-Za-z0-9_-]{40,3072}$/))
      if (!envelope || typeof envelope.expiresAt !== 'number' || envelope.expiresAt <= Date.now()) throw new VraeFailure(403)
      const ref = field(envelope, 'ref', auditRefPattern)
      const session = await client.exchange('return', field(envelope, 'token', privateTokenPattern))
      // Preserve the restored session even if the next status lookup is temporarily unavailable.
      return withSession(key, { session, ref }, { state: 'restored' })
    }

    const current = readPreviewSession(key, request.cookies.get(previewSessionCookie)?.value)
    if (body.action === 'submit') {
      if (current.ref) return reply({ state: await readStatus(current, current.ref), hasTask: true })
      const ref = await client.submit(currentPreviewDiagnosis(current, targetUrl), current.session)
      evidence('diagnoses202')
      return withSession(key, { session: current.session, ref }, { state: 'accepted', hasTask: true }, 202)
    }
    if (body.action === 'resume') {
      if (current.ref) return reply({ state: await readStatus(current, current.ref), hasTask: true })
      if (!current.intent) throw new VraeFailure(403)
      if (current.pending) {
        currentPreviewDiagnosis(current, targetUrl)
        return reply({ state: 'prepared' })
      }
      const consent = await client.intake()
      const authorised = current.scope?.url === targetUrl &&
        current.scope.consentHash === consent.hash && current.scope.consentVersion === consent.version &&
        current.scope.expiresAt > Date.now()
      return reply({ state: authorised ? 'scope-authorised' : 'authorised',
        address: targetUrl, consentText: consent.text, consentHash: consent.hash })
    }
    if (body.action === 'authorise' || body.action === 'prepare') {
      if (!current.intent || current.ref) throw new VraeFailure(403)
      if (body.confirmed !== true || body.address !== targetUrl) return reply({ state: 'address-or-consent' }, 400)
      const consent = await client.intake()
      if (body.consentHash !== consent.hash) return reply({ state: 'consent-changed' }, 409)
      if (body.action === 'authorise') {
        if (current.pending) throw new VraeFailure(409)
        const expiresAt = await client.authorise(targetUrl, consent, current.session)
        evidence('application201_authorize201')
        const scope = { url: targetUrl, consentHash: consent.hash, consentVersion: consent.version, expiresAt }
        return withSession(key, { ...current, scope },
          { state: 'scope-authorised', address: targetUrl, consentText: consent.text, consentHash: consent.hash })
      }
      const language = body.language
      if (language !== 'zh' && language !== 'en') return reply({ state: 'invalid' }, 400)
      const pending = preparePreviewDiagnosis(current, targetUrl, consent, language)
      return withSession(key, { ...current, pending }, { state: 'prepared' })
    }
    if (body.action === 'status') {
      if (!current.ref) return reply({ state: 'no-task' })
      return reply({ state: await readStatus(current, current.ref), hasTask: true })
    }
    if (body.action === 'return' && current.ref) {
      const token = await client.issueReturn(current.ref, current.session)
      const code = seal(key, 'return', { token, ref: current.ref, expiresAt: Date.now() + 300_000 })
      return reply({ state: 'return-issued', code }, 201)
    }
    return reply({ state: 'invalid' }, 400)
  } catch (error) {
    if (error instanceof SyntaxError) return reply({ state: 'invalid' }, 400)
    if (error instanceof VraeFailure) {
      const states = { 403: 'denied', 404: 'unavailable', 409: 'conflict', 429: 'busy', 503: 'unavailable' }
      return reply({ state: states[error.status] }, error.status === 404 ? 503 : error.status, error.retryAfter)
    }
    return reply({ state: 'unavailable' }, 503)
  }
}
