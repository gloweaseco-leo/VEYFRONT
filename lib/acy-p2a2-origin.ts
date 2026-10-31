import { isSameOrigin } from './lead-request'

/**
 * The authenticated Vercel Preview may serve a branch alias while NextRequest.url
 * identifies its immutable deployment host. Accept only the explicit branch alias
 * provisioned for this QA branch. Never enable this exception in production.
 */
export function allowedP2A2Origin(
  request: Pick<Request,'url'|'headers'>,
  env: {VERCEL_ENV?: string; ACY_P2A2_ALLOWED_ORIGIN?: string} = {
    VERCEL_ENV: process.env.VERCEL_ENV,
    ACY_P2A2_ALLOWED_ORIGIN: process.env.ACY_P2A2_ALLOWED_ORIGIN,
  },
): boolean {
  if (isSameOrigin(request)) return true
  if (env.VERCEL_ENV !== 'preview') return false
  const permitted = env.ACY_P2A2_ALLOWED_ORIGIN?.trim() || ''
  const origin = request.headers.get('origin')
  if (!permitted || !origin || !/^https:\/\/veyfront-git-feature-acy-p2a2-[a-z0-9-]+\.vercel\.app$/.test(permitted)) {
    return false
  }
  try {
    return origin === permitted && new URL(origin).origin === permitted
  } catch { return false }
}
