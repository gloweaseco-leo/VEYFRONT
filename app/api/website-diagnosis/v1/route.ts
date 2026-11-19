import { NextResponse, type NextRequest } from 'next/server'
import { isJsonContentType, isSameOrigin, readLeadBody } from '@/lib/lead-request'
import { auditRefPattern, object, privateTokenPattern, targetIdPattern, VraeFailure } from '@/lib/vrae-preview-client'
import {
  authorizedSubmission, matchesSubmittedUrl, previewConfig, previewSessionCookie,
  readPreviewSession, seal, unseal, type PreviewSession,
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

export async function POST(request: NextRequest) {
  const config = previewConfig()
  if (!config) return reply({ state: 'closed' }, 404)
  if (!isSameOrigin(request) || !isJsonContentType(request) || request.nextUrl.search) return reply({ state: 'denied' }, 403)
  const input = await readLeadBody(request, 4096)
  if (input.kind !== 'ok') return reply({ state: 'invalid' }, input.kind === 'too-large' ? 413 : 400)

  const { client, key, submissions } = config
  try {
    const body = object(JSON.parse(input.text))
    if (!body) return reply({ state: 'invalid' }, 400)
    if (body.action === 'invite') {
      const token = field(body, 'token', privateTokenPattern)
      const session = await client.exchange('invitation', token)
      return withSession(key, { session }, { state: 'authorised' })
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
    if (body.action === 'plan' || body.action === 'submit') {
      const target = field(body, 'target', targetIdPattern)
      const language = body.language === 'zh' || body.language === 'en' ? body.language : null
      if (!language || (body.action === 'submit' && !current.request)) throw new VraeFailure(403)
      const plan = await client.plan(target, current.session)
      const submission = authorizedSubmission(submissions, plan, language, body.action === 'submit' ? current.request : undefined)
      if (body.action === 'plan') {
        return withSession(key, { ...current, request: submission.fingerprint },
          { state: 'plan', address: submission.url, consentText: submission.consentText })
      }
      if (body.confirmed !== true || typeof body.address !== 'string' || !matchesSubmittedUrl(body.address, submission.url)) {
        return reply({ state: 'address-or-consent' }, 400)
      }
      const ref = await client.submit(submission.raw, current.session)
      return withSession(key, { ...current, ref }, { state: 'accepted' }, 202)
    }
    if (body.action === 'status') {
      if (!current.ref) return reply({ state: 'no-task' })
      return reply({ state: await client.status(current.ref, current.session) })
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
