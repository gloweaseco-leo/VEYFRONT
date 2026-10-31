/**
 * Bounded HTTP request validation for public VEYFRONT intake.
 * Stateless protections are intentionally modest; they do not replace a WAF or durable rate limit.
 */
export const MAX_LEAD_BYTES = 12_000

export function isSameOrigin(request: Pick<Request, 'headers' | 'url'>): boolean {
  const origin = request.headers.get('origin')
  if (!origin) return false
  try {
    return new URL(origin).origin === new URL(request.url).origin && origin === new URL(origin).origin
  } catch {
    return false
  }
}

export function isJsonContentType(request: Pick<Request, 'headers'>): boolean {
  return request.headers.get('content-type')?.split(';')[0]?.trim().toLowerCase() === 'application/json'
}

export type LimitedBodyResult =
  | { kind: 'ok'; text: string }
  | { kind: 'too-large' }
  | { kind: 'invalid' }

/** Abort reading after MAX_LEAD_BYTES even for streamed/chunked requests with no Content-Length. */
export async function readLeadBody(request: Request, maxBytes = MAX_LEAD_BYTES): Promise<LimitedBodyResult> {
  const rawLength = request.headers.get('content-length')
  if (rawLength !== null) {
    if (!/^\d+$/.test(rawLength) || Number(rawLength) > maxBytes) return { kind: 'too-large' }
  }
  if (!request.body) return { kind: 'ok', text: '' }
  const reader = request.body.getReader()
  let size = 0
  const chunks: Uint8Array[] = []
  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      size += value.byteLength
      if (size > maxBytes) {
        await reader.cancel().catch(() => {})
        return { kind: 'too-large' }
      }
      chunks.push(value)
    }
    const bytes = new Uint8Array(size)
    let offset = 0
    for (const chunk of chunks) {
      bytes.set(chunk, offset)
      offset += chunk.byteLength
    }
    return { kind: 'ok', text: new TextDecoder('utf-8', { fatal: true }).decode(bytes) }
  } catch {
    return { kind: 'invalid' }
  } finally {
    reader.releaseLock()
  }
}
