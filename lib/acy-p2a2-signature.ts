import { createHmac } from 'node:crypto'

/** Deterministic proof format shared with L2M. No browser-side secret or endpoint. */
export const P2A2_APPROVED_URL = 'https://veyfront.com/'
export function signP2A2(issuedAt: number, nonce: string, secret: string): string {
  const message = `VEYFRONT_P2A2_V1\n${P2A2_APPROVED_URL}\n${issuedAt}\n${nonce}\n1`
  return createHmac('sha256', secret).update(message,'utf8').digest('hex')
}
