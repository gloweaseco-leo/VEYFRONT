import { put } from '@vercel/blob'
import { randomUUID } from 'node:crypto'
import type { NextRequest } from 'next/server'
import { checkUrl } from '@/lib/url'

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
  // No cross-origin form submissions. Do not depend on client-provided service claims.
  const origin = request.headers.get('origin')
  if (origin && origin !== new URL(request.url).origin) return reject('Origin not allowed.', 403)
  if (!request.headers.get('content-type')?.startsWith('application/json')) {
    return reject('JSON request required.', 415)
  }
  if (Number(request.headers.get('content-length') || '0') > 12_000) {
    return reject('Request too large.', 413)
  }

  let raw: string
  try {
    raw = await request.text()
    if (new TextEncoder().encode(raw).length > 12_000) return reject('Request too large.', 413)
  } catch {
    return reject('Unable to read your request.', 400)
  }
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
  return Response.json({ ok: true, reference, message: 'Your request was received.' }, { status: 201, headers: noStore })
}

export async function GET() {
  return new Response(null, { status: 405, headers: { ...noStore, Allow: 'POST' } })
}
