import type { NextRequest } from 'next/server'
import { randomBytes } from 'node:crypto'
import { signP2A2, P2A2_APPROVED_URL } from '@/lib/acy-p2a2-signature'
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
  if (Object.keys(input).length !== 2 || input.url !== P2A2_APPROVED_URL
      || input.authorization_confirmed !== true) return reject(422,'This preview only accepts the authorized VEYFRONT homepage.')

  const target = process.env.L2M_ACY_P2A2_URL?.trim() || ''
  const secret = process.env.L2M_ACY_P2A2_SERVICE_TOKEN || ''
  if (!target || secret.length < 32) return reject(503,'L2M P2-A2 is not configured.')
  let endpoint: URL
  try { endpoint = new URL(target) } catch { return reject(503,'Invalid service configuration.') }
  if (endpoint.protocol !== 'https:' || !endpoint.hostname.endsWith('.vercel.app')
      || endpoint.pathname !== '/api/acy_url_assess' || endpoint.search || endpoint.hash
      || endpoint.username || endpoint.password || endpoint.port) {
    return reject(503,'Unsupported service target.')
  }
  // Token originates from the Vercel preview runtime, never the browser.
  const oidc = request.headers.get('x-vercel-oidc-token')
  if (!oidc || oidc.split('.').length !== 3) return reject(503,'Vercel preview identity is unavailable.')

  const issuedAt = Math.floor(Date.now()/1000)
  const nonce = randomBytes(16).toString('hex')
  const signedPayload = {
    url: P2A2_APPROVED_URL, authorization_confirmed: true,
    issued_at: issuedAt, nonce, signature: signP2A2(issuedAt,nonce,secret),
  }
  let response: Response
  try {
    response = await fetch(endpoint, {
      method:'POST',
      headers: {'Content-Type':'application/json','x-vercel-trusted-oidc-idp-token':oidc},
      body:JSON.stringify(signedPayload),
      cache:'no-store',signal:AbortSignal.timeout(18000),
      redirect:'error',
    })
  } catch { return reject(502,'L2M live assessment service is unavailable.') }
  if (!response.ok) return reject(502,`L2M live assessment could not proceed (HTTP ${response.status}).`)
  let result: unknown
  try { result = await response.json() } catch { return reject(502,'Invalid L2M response.') }
  if (!result || typeof result !== 'object' || !('assessment' in result)
      || !isLiveAssessment((result as Record<string,unknown>).assessment)) {
    return reject(502,'L2M live assessment contract mismatch.')
  }
  return Response.json({ok:true,assessment:(result as {assessment:unknown}).assessment},{headers})
}
export async function GET() { return reject(405,'POST only.') }
