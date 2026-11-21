import { NextResponse, type NextRequest } from 'next/server'
import { isJsonContentType, readLeadBody } from '@/lib/lead-request'
import { auditRefPattern, object, privateTokenPattern, VraeFailure } from '@/lib/vrae-preview-client'
import {
  automaticPreviewAddress, currentPreviewDiagnosis, isAutomaticPreviewHost, isPreviewSameOrigin,
  preparePreviewDiagnosis, previewConfig, previewSessionCookie, readPreviewSession, seal,
  unseal, type PreviewSession,
} from '@/lib/vrae-preview'

export const runtime = 'nodejs'
// Leave the result read time budget intact on the hosting platform.
export const maxDuration = 30

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

function existingSession(request: NextRequest, key: Buffer) {
  const value = request.cookies.get(previewSessionCookie)?.value
  if (value) return readPreviewSession(key, value)
}

function failure(error: unknown) {
  if (error instanceof SyntaxError) return reply({ state: 'invalid' }, 400)
  if (error instanceof VraeFailure) {
    const states = { 403: 'denied', 404: 'unavailable', 409: 'conflict', 429: 'busy', 503: 'unavailable' }
    return reply({ state: states[error.status] }, error.status === 404 ? 503 : error.status, error.retryAfter)
  }
  return reply({ state: 'unavailable' }, 503)
}

export async function GET(request: NextRequest) {
  const host = request.headers.get('host')
  const config = previewConfig()
  if (!config || !isAutomaticPreviewHost(host) || request.nextUrl.search) return reply({ state: 'closed' }, 404)
  try {
    const current = existingSession(request, config.key)
    if (current?.ref) return reply({ state: 'resume', address: current.address })
    if (current?.pending) {
      currentPreviewDiagnosis(current)
      return reply({ state: 'prepared', address: current.address })
    }
    const [ready, , consent] = await Promise.all([config.client.ready(), config.client.openapi(), config.client.intake()])
    if (!ready) throw new VraeFailure(503)
    return reply({ state: 'ready', consentText: consent.text, consentHash: consent.hash })
  } catch (error) {
    return failure(error)
  }
}

export async function POST(request: NextRequest) {
  const host = request.headers.get('host')
  const config = previewConfig()
  if (!config || !isAutomaticPreviewHost(host)) return reply({ state: 'closed' }, 404)
  if (!isPreviewSameOrigin(request.headers) || !isJsonContentType(request) || request.nextUrl.search) return reply({ state: 'denied' }, 403)
  const input = await readLeadBody(request, 4096)
  if (input.kind !== 'ok') return reply({ state: 'invalid' }, input.kind === 'too-large' ? 413 : 400)

  const { client, key } = config
  try {
    const body = object(JSON.parse(input.text))
    if (!body) return reply({ state: 'invalid' }, 400)
    if (body.action === 'restore') {
      const envelope = unseal(key, 'return', typeof body.token === 'string' ? body.token : undefined)
      if (!envelope || typeof envelope.expiresAt !== 'number' || envelope.expiresAt <= Date.now() ||
          typeof envelope.ref !== 'string' || !auditRefPattern.test(envelope.ref) ||
          typeof envelope.token !== 'string' || !privateTokenPattern.test(envelope.token)) throw new VraeFailure(403)
      const session = await client.restoreSession(envelope.token)
      const address = automaticPreviewAddress(envelope.address)
      return withSession(key, { session, ref: envelope.ref, address }, { state: 'resume', address })
    }

    const current = existingSession(request, key)
    if (body.action === 'prepare') {
      if (current?.ref) return reply({ state: 'resume', address: current.address })
      if (current?.pending) {
        currentPreviewDiagnosis(current)
        if (automaticPreviewAddress(body.address) !== current.address) throw new VraeFailure(409)
        return reply({ state: 'prepared', address: current.address })
      }
      const address = automaticPreviewAddress(body.address)
      const language = body.language
      if (!address) return reply({ state: 'invalid-address' }, 400)
      if (body.confirmed !== true || (language !== 'zh' && language !== 'en')) return reply({ state: 'invalid' }, 400)
      const consent = await client.intake()
      if (body.consentHash !== consent.hash) return reply({ state: 'consent-changed' }, 409)
      const session = await client.createSession()
      const pending = preparePreviewDiagnosis(address, consent, language)
      // Store the exact intent before submitting. A retry must never generate a second task.
      return withSession(key, { session, pending, address }, { state: 'prepared', address })
    }

    if (!current) return reply({ state: 'no-task' }, 403)
    if (body.action === 'submit') {
      if (current.ref) return reply({ state: 'resume', address: current.address })
      const raw = currentPreviewDiagnosis(current)
      const ref = await client.submit(raw, current.session)
      return withSession(key, { session: current.session, ref, address: current.address },
        { state: 'accepted', address: current.address }, 202)
    }
    if (!current.ref) return reply({ state: 'no-task' }, 403)
    if (body.action === 'status') {
      const result = await client.result(current.ref, current.session, body.language === 'en' ? 'en' : 'zh')
      return reply({ ...result, address: current.address })
    }
    if (body.action === 'return') {
      const token = await client.issueReturn(current.ref, current.session)
      const code = seal(key, 'return', { token, ref: current.ref, address: current.address, expiresAt: Date.now() + 300_000 })
      return reply({ state: 'return-issued', code }, 201)
    }
    return reply({ state: 'invalid' }, 400)
  } catch (error) {
    return failure(error)
  }
}
