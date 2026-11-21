import { isJsonContentType, readLeadBody } from '../../../lib/lead-request.ts'
import { localG1Enabled, matchesOfflineSite, offlineInvitation } from '../../../lib/vrae-g1-local.ts'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const headers = {
  'Cache-Control': 'no-store',
  'Referrer-Policy': 'no-referrer',
  'X-Content-Type-Options': 'nosniff',
}

function reply(status: number, body: Record<string, unknown>) {
  return Response.json(body, { status, headers })
}

export function GET() {
  return reply(404, { status: 'unavailable' })
}

export async function POST(request: Request) {
  if (!localG1Enabled()) return GET()
  // Next's dev URL can normalize the loopback host. Match the direct browser Host and Origin.
  const host = request.headers.get('host')
  if (!host || !/^127\.0\.0\.1:[0-9]{1,5}$/.test(host)) return GET()
  if (request.headers.get('origin') !== 'http://' + host) return reply(403, { status: 'denied' })
  if (!isJsonContentType(request)) return reply(415, { status: 'invalid' })
  const limited = await readLeadBody(request, 2048)
  if (limited.kind !== 'ok') return reply(limited.kind === 'too-large' ? 413 : 400, { status: 'invalid' })

  let body: Record<string, unknown>
  try {
    const value = JSON.parse(limited.text)
    if (!value || typeof value !== 'object' || Array.isArray(value)) return reply(400, { status: 'invalid' })
    body = value
  } catch {
    return reply(400, { status: 'invalid' })
  }
  if (typeof body.code !== 'string') return reply(403, { status: 'denied' })

  try {
    const result = offlineInvitation(body.code)
    if (!result) return reply(403, { status: 'denied' })
    const { adapter, invitation } = result
    if (body.action === 'submit') {
      if (body.permission !== true || body.consent !== true || typeof body.siteUrl !== 'string' ||
          !matchesOfflineSite(body.siteUrl, invitation.authority.siteUrl)) return reply(403, { status: 'denied' })
      const accepted = await adapter.submit(invitation.authority)
      if (!accepted.ok) return reply(accepted.status, { status: 'unavailable', retryAfterSeconds: accepted.retryAfterSeconds })
      if (accepted.value.auditRef !== invitation.session.auditRef) return reply(503, { status: 'unavailable' })
      return reply(202, { status: 'accepted', ...accepted.value })
    }
    if (body.action === 'status') {
      if (body.auditRef !== invitation.session.auditRef) return reply(403, { status: 'denied' })
      const actual = await adapter.status(invitation.session.auditRef, invitation.session)
      if (!actual.ok) return reply(actual.status, { status: 'unavailable', retryAfterSeconds: actual.retryAfterSeconds })
      return reply(200, { status: actual.value.state, reportAvailable: false })
    }
    return reply(400, { status: 'invalid' })
  } catch {
    return reply(503, { status: 'unavailable' })
  }
}
