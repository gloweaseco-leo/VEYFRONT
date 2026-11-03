import { NextResponse, type NextRequest } from 'next/server'

// Localized, shareable Chinese paths. Never rewrite APIs, review routes or unknown paths.
const pages = new Set([
  '/', '/pricing', '/transformations', '/how-it-works', '/contact',
  '/start/launch', '/start/rebuild', '/privacy', '/terms', '/contact/privacy',
])
export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  const suffix = pathname === '/zh' ? '/' : pathname.startsWith('/zh/') ? pathname.slice(3) : null
  if (!suffix || !pages.has(suffix)) return NextResponse.next()
  const headers = new Headers(request.headers)
  headers.set('x-vf-page-locale', 'zh')
  const target = request.nextUrl.clone()
  target.pathname = suffix
  return NextResponse.rewrite(target, { request: { headers } })
}
export const config = { matcher: ['/zh', '/zh/:path*'] }
