import type { NextRequest } from 'next/server'
import { isSameOrigin, isJsonContentType, readLeadBody } from '@/lib/lead-request'
import { isLiveAssessment, p2a2Enabled } from '@/lib/l2m-p2a2'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
const headers = { 'Cache-Control': 'private, no-store', 'X-Content-Type-Options': 'nosniff', 'X-Robots-Tag': 'noindex, nofollow' }
const reject = (status: number, message: string) => Response.json({ok:false,message},{status,headers})

export async function POST(request: NextRequest) {
  if (!p2a2Enabled()) return reject(404,'Not available.')
  if (!isSameOrigin(request)) return reject(403,'Origin not allowed.')
  if (!isJsonContentType(request)) return reject(415,'JSON only.')
  const body = await readLeadBody(request, 512)
  if (body.kind !== 'ok') return reject(body.kind === 'too-large' ? 413 : 400,'Invalid request.')
  let parsed: unknown
  try { parsed = JSON.parse(body.text) } catch { return reject(400,'Invalid JSON.') }
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return reject(422,'Invalid input.')
  const input = parsed as Record<string,unknown>
  if (Object.keys(input).length !== 2 || input.url !== 'https://veyfront.com/'
      || input.authorization_confirmed !== true) return reject(422,'This preview only accepts the authorized VEYFRONT homepage.')

  const target = process.env.L2M_ACY_P2A2_URL?.trim() || ''
  const token = process.env.L2M_ACY_P2A2_SERVICE_TOKEN?.trim() || ''
  if (!target || token.length < 32) return reject(503,'L2M P2-A2 is not configured.')
  let endpoint: URL
  try { endpoint = new URL(target) } catch { return reject(503,'Invalid service configuration.') }
  if (endpoint.protocol !== 'https:' || !endpoint.hostname.endsWith('.vercel.app')
      || endpoint.pathname !== '/api/acy_url_assess' || endpoint.search || endpoint.hash
      || endpoint.username || endpoint.password || endpoint.port) {
    return reject(503,'Unsupported service target.')
  }
  const upstreamHeaders: Record<string,string> = {
    'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json',
  }
  const bypass = process.env.L2M_ACY_P2A2_BYPASS?.trim()
  if (bypass) upstreamHeaders['x-vercel-protection-bypass'] = bypass
  let response: Response
  try {
    response = await fetch(endpoint, {
      method:'POST',headers:upstreamHeaders,
      body:JSON.stringify({url:'https://veyfront.com/',authorization_confirmed:true}),
      cache:'no-store',signal:AbortSignal.timeout(18000),
    })
  } catch { return reject(502,'L2M live assessment service is unavailable.') }
  if (!response.ok) {
    // Avoid forwarding upstream text, potentially including untrusted HTML or traces.
    return reject(502,`L2M live assessment could not proceed (HTTP ${response.status}).`)
  }
  let result: unknown
  try { result = await response.json() } catch { return reject(502,'Invalid L2M response.') }
  if (!result || typeof result !== 'object' || !('assessment' in result)
      || !isLiveAssessment((result as Record<string,unknown>).assessment)) {
    return reject(502,'L2M live assessment contract mismatch.')
  }
  return Response.json({ok:true,assessment:(result as {assessment:unknown}).assessment},{headers})
}

export async function GET() { return reject(405,'POST only.') }
