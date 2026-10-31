import { get, head, put } from '@vercel/blob'
import type { NextRequest } from 'next/server'
import { isJsonContentType, isSameOrigin, readLeadBody } from '@/lib/lead-request'
import { checkUrl } from '@/lib/url'
import { advanceJourney, authenticate, makeJourney, p1Enabled, publicJourney, safeText, validQaEmail, validService, validateBrief, type AcyJourney } from '@/lib/acy-p1'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const headers = { 'Cache-Control': 'private, no-store', 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'no-referrer' }
const error = (status: number, message: string) => Response.json({ ok: false, message }, { status, headers })
const pathname = (id: string) => `acy-preview/p1/journeys/${id}.json`
const idValid = (id: unknown) => typeof id === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)

async function loadJourney(id: string): Promise<AcyJourney | null> {
  const obj = await get(pathname(id), { access: 'private', useCache: false })
  if (!obj) return null
  const data = await new Response(obj.stream).json() as AcyJourney
  return data.id === id && data.version === 1 ? data : null
}

async function sendQaConfirmation(j: AcyJourney, accessToken: string, request: NextRequest): Promise<'sent' | 'skipped' | 'failed'> {
  // Only an internal QA recipient is permitted; never email random preview visitors.
  if (j.email !== 'hello@veyfront.com') return 'skipped'
  const apiKey = process.env.ACY_P1_RESEND_KEY?.trim()
  if (!apiKey) return 'skipped'
  const continueUrl = new URL('/p1', request.url)
  continueUrl.searchParams.set('j', j.id)
  continueUrl.searchParams.set('k', accessToken)
  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json', 'Idempotency-Key': `acy-p1-qa-${j.id}` },
      body: JSON.stringify({
        from: 'VEYFRONT Preview <alerts@notify.veyfront.com>',
        to: ['hello@veyfront.com'],
        subject: `[P1 PREVIEW QA] Resume ${j.reference}`,
        text: `Internal synthetic QA only. Journey ${j.reference}. Continue using this temporary private link (expires in 48 hours):\n${continueUrl.toString()}\nDo not forward this access link.\n`,
      }),
      signal: AbortSignal.timeout(4000),
    })
    return r.ok ? 'sent' : 'failed'
  } catch { return 'failed' }
}

export async function POST(request: NextRequest) {
  if (!p1Enabled()) return error(404, 'Not available.')
  if (!isSameOrigin(request)) return error(403, 'Origin not allowed.')
  if (!isJsonContentType(request)) return error(415, 'JSON required.')
  const payload = await readLeadBody(request, 12_000)
  if (payload.kind === 'too-large') return error(413, 'Too large.')
  if (payload.kind === 'invalid') return error(400, 'Invalid input.')
  let body: Record<string, unknown>
  try { body = JSON.parse(payload.text) as Record<string, unknown> } catch { return error(400, 'Invalid JSON.') }
  if (typeof body !== 'object' || body === null || Array.isArray(body)) return error(400, 'Invalid input.')
  if (!process.env.BLOB_READ_WRITE_TOKEN) return error(503, 'Preview private storage unavailable.')

  if (body.op === 'create') {
    if (body.honeypot) return error(400, 'Invalid request.')
    if (body.consent !== true || !validService(body.service)) return error(422, 'Consent and a service are required.')
    const name = safeText(body.name, 100)
    const email = safeText(body.email, 254)?.toLowerCase()
    if (!name || name.length < 2 || !email || !validQaEmail(email)) return error(422, 'This preview accepts only hello@veyfront.com or qa@example.invalid.')
    const brief = validateBrief(body.service, body)
    if (!brief || (body.service === 'rebuild' && checkUrl(brief.website).state !== 'valid')) return error(422, 'Check your project goals and website URL.')
    const { journey, accessToken } = makeJourney({ service: body.service, name, email, brief })
    try {
      await put(pathname(journey.id), JSON.stringify(journey), {
        access: 'private', addRandomSuffix: false, contentType: 'application/json', cacheControlMaxAge: 60,
      })
    } catch { return error(503, 'Private record not saved.') }
    const notification = await sendQaConfirmation(journey, accessToken, request)
    return Response.json({ ok: true, journey: publicJourney(journey), accessToken, notification }, { status: 201, headers })
  }

  if (body.op !== 'read' && body.op !== 'update') return error(400, 'Unsupported operation.')
  if (!idValid(body.id)) return error(404, 'Not found.')
  const id = body.id as string
  let j: AcyJourney | null
  try { j = await loadJourney(id) } catch { return error(503, 'Journey storage unavailable.') }
  if (!j || !authenticate(j, body.accessToken)) return error(404, 'Journey unavailable or link expired.')
  if (body.op === 'read') return Response.json({ ok: true, journey: publicJourney(j) }, { headers })

  const outcome = advanceJourney(j, body)
  if (outcome.kind === 'invalid') return error(422, 'Invalid or exhausted action.')
  if (outcome.kind === 'duplicate') return Response.json({ ok: true, duplicate: true, journey: publicJourney(outcome.journey) }, { headers })
  try {
    const metadata = await head(pathname(id))
    if (!metadata) return error(404, 'Not found.')
    await put(pathname(id), JSON.stringify(outcome.journey), {
      access: 'private', allowOverwrite: true, ifMatch: metadata.etag,
      contentType: 'application/json', cacheControlMaxAge: 60,
    })
  } catch {
    return error(409, 'The journey changed; reload before trying again.')
  }
  return Response.json({ ok: true, journey: publicJourney(outcome.journey) }, { headers })
}
export async function GET() { return error(405, 'POST only.') }
