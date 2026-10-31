import type { NextRequest } from 'next/server'
import { isSameOrigin, isJsonContentType, readLeadBody } from '@/lib/lead-request'
import { p2aPreviewEnabled, isL2MAssessment } from '@/lib/l2m-p2a'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
const headers = { 'Cache-Control': 'private, no-store', 'X-Content-Type-Options': 'nosniff', 'X-Robots-Tag': 'noindex' }
const reject = (status: number, message: string) =>
  Response.json({ ok: false, message }, { status, headers })

export async function POST(request: NextRequest) {
  if (!p2aPreviewEnabled()) return reject(404, 'Not available.')
  if (!isSameOrigin(request)) return reject(403, 'Origin not allowed.')
  if (!isJsonContentType(request)) return reject(415, 'JSON only.')
  const body = await readLeadBody(request, 256)
  if (body.kind !== 'ok') return reject(body.kind === 'too-large' ? 413 : 400, 'Invalid request.')
  let payload: unknown
  try { payload = JSON.parse(body.text) } catch { return reject(400, 'Invalid JSON.') }
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)
      || Object.keys(payload).length !== 1
      || (payload as Record<string, unknown>).snapshot !== 'qa-alt-treesite') {
    return reject(422, 'Only the synthetic L2M snapshot is supported in preview.')
  }
  const url = process.env.L2M_ACY_P2A_URL?.trim() || ''
  const serviceToken = process.env.L2M_ACY_P2A_SERVICE_TOKEN?.trim() || ''
  if (!url || serviceToken.length < 32) return reject(503, 'L2M preview adapter is not configured.')
  let serviceURL: URL
  try { serviceURL = new URL(url) } catch { return reject(503, 'Invalid service configuration.') }
  if (serviceURL.protocol !== 'https:' || !serviceURL.hostname.endsWith('.vercel.app')) {
    return reject(503, 'Unsupported preview service target.')
  }
  const upstreamHeaders: Record<string, string> = {
    'Authorization': `Bearer ${serviceToken}`,
    'Content-Type': 'application/json',
  }
  const bypass = process.env.L2M_ACY_P2A_BYPASS?.trim()
  if (bypass) upstreamHeaders['x-vercel-protection-bypass'] = bypass
  let response: Response
  try {
    response = await fetch(serviceURL, {
      method: 'POST', headers: upstreamHeaders,
      body: JSON.stringify({ snapshot: 'qa-alt-treesite' }),
      cache: 'no-store', signal: AbortSignal.timeout(14000),
    })
  } catch { return reject(502, 'L2M preview service is unavailable.') }
  if (!response.ok) {
    return reject(502, `L2M preview service refused the request (HTTP ${response.status}).`)
  }
  let result: unknown
  try { result = await response.json() } catch { return reject(502, 'Invalid L2M response.') }
  if (!result || typeof result !== 'object' || !('assessment' in result)
      || !isL2MAssessment((result as Record<string, unknown>).assessment)) {
    return reject(502, 'L2M assessment contract mismatch.')
  }
  return Response.json({ ok: true, assessment: (result as { assessment: unknown }).assessment }, { headers })
}
export async function GET() { return reject(405, 'POST only.') }
