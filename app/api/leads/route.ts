import { put } from '@vercel/blob'
import { sendLeadAlert } from '@/lib/lead-alert'
import { randomUUID } from 'node:crypto'
import type { NextRequest } from 'next/server'
import { checkUrl } from '@/lib/url'
import { isJsonContentType, isSameOrigin, readLeadBody } from '@/lib/lead-request'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const noStore = { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' }
type Service = 'launch' | 'rebuild' | 'general' | 'privacy'
type LeadInput = {
  service?: unknown
  name?: unknown
  email?: unknown
  company?: unknown
  website?: unknown
  markets?: unknown
  details?: unknown
  consent?: unknown
  honeypot?: unknown
}

function reject(message: string, status: number) {
  return Response.json({ ok: false, message }, { status, headers: noStore })
}

function clean(value: unknown, max: number): string | null {
  if (typeof value !== 'string') return null
  const text = value.trim()
  return text.length <= max ? text : null
}

function validEmail(value: string): boolean {
  return value.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

export async function POST(request: NextRequest) {
  // Only the first-party browser application may submit. Spoofed Origins remain possible
  // outside browsers; this check is not bot authentication or durable rate limiting.
  if (!isSameOrigin(request)) return reject('Origin not allowed.', 403)
  if (!isJsonContentType(request)) return reject('JSON request required.', 415)
  const body = await readLeadBody(request)
  if (body.kind === 'too-large') return reject('Request too large.', 413)
  if (body.kind === 'invalid') return reject('Unable to read your request.', 400)
  const raw = body.text
  let data: LeadInput
  try { data = JSON.parse(raw) as LeadInput } catch { return reject('Invalid request.', 400) }
  if (typeof data !== 'object' || data === null || Array.isArray(data)) return reject('Invalid request.', 400)

  // Quietly reject bot-trap submissions: never store their content.
  if (data.honeypot) return reject('Unable to process this request.', 400)

  const service = data.service
  if (!['launch', 'rebuild', 'general', 'privacy'].includes(String(service))) return reject('Invalid request type.', 400)
  const category = service as Service
  const name = clean(data.name, 100)
  const email = clean(data.email, 254)
  const company = clean(data.company, 160)
  const website = clean(data.website, 500)
  const markets = clean(data.markets, 240)
  const details = clean(data.details, 3000)
  if (!name || name.length < 2 || !email || !validEmail(email)) return reject('Please provide your name and a valid email.', 422)
  if (!details || details.length < 20) return reject('Please describe your request in at least 20 characters.', 422)
  if (data.consent !== true) return reject('Consent is required.', 422)
  if (company === null || website === null || markets === null) return reject('One of the fields is too long.', 422)
  if (category === 'rebuild') {
    const result = checkUrl(website || '')
    if (result.state !== 'valid') return reject('Please provide a public website address.', 422)
  }
  if (!process.env.BLOB_READ_WRITE_TOKEN) return reject('Request intake is temporarily unavailable. Please try again later.', 503)

  const reference = 'VF-' + randomUUID().slice(0, 8).toUpperCase()
  const now = new Date()
  const record = {
    reference,
    receivedAt: now.toISOString(),
    status: 'new',
    service: category,
    name,
    email,
    company: company || null,
    website: website || null,
    markets: markets || null,
    details,
    consent: { accepted: true, version: 'VEYFRONT-PRIVACY-2026-10-30' },
    // IP and browser fingerprint deliberately NOT persisted.
  }
  const pathname = `inquiries/${now.getUTCFullYear()}/${String(now.getUTCMonth()+1).padStart(2, '0')}/${randomUUID()}.json`
  try {
    await put(pathname, JSON.stringify(record), {
      access: 'private',
      addRandomSuffix: false,
      contentType: 'application/json',
      cacheControlMaxAge: 60,
    })
  } catch (error) {
    // No customer data in logs. Fail closed; never return a fake receipt.
    console.error('VEYFRONT inquiry storage failed', error instanceof Error ? error.name : 'unknown')
    return reject('We could not save your request. Please try again later.', 503)
  }
  // Alerting is best-effort and contains no client PII. The private Blob receipt remains authoritative.
  // Await the bounded delivery attempt so the serverless function doesn't discard a background promise.
  const alert = await sendLeadAlert({ reference, service: category, receivedAt: record.receivedAt })
  if (alert === 'failed') console.warn('VEYFRONT inquiry alert unavailable; manual private-store review required')
  return Response.json({ ok: true, reference, message: 'Your request was received.' }, { status: 201, headers: noStore })
}

export async function GET() {
  return new Response(null, { status: 405, headers: { ...noStore, Allow: 'POST' } })
}
