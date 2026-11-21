import { NextResponse, type NextRequest } from 'next/server'
import { diagnosisPath, diagnosisPreviewEnabled, diagnosisReportPath } from '@/lib/diagnosis-preview'

/**
 * Locale Architecture V2.0 (Preview)
 * Unprefixed public routes are Chinese; explicit /en routes are English.
 * Former Chinese /zh routes are permanent redirects to canonical Chinese URLs.
 * Never rewrite APIs, protected review URLs, internal assets or unknown paths.
 */
const publicPages = new Set([
  '/', '/pricing', '/transformations', '/how-it-works', '/contact',
  '/start/launch', '/start/rebuild', '/privacy', '/terms', '/contact/privacy',
])

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  const legacyChinese = pathname === '/zh' || pathname.startsWith('/zh/')
  const english = pathname === '/en' || pathname.startsWith('/en/')
  if (!legacyChinese && !english) return NextResponse.next()

  const raw = pathname === '/zh' || pathname === '/en' ? '/' : pathname.slice(3)
  const suffix = raw.length > 1 && raw.endsWith('/') ? raw.slice(0, -1) : raw
  if (!publicPages.has(suffix) && !(diagnosisPreviewEnabled && (suffix === diagnosisPath || suffix === diagnosisReportPath))) return NextResponse.next()

  const target = request.nextUrl.clone()
  target.pathname = suffix
  if (legacyChinese) return NextResponse.redirect(target, 308)

  const forwardedHeaders = new Headers(request.headers)
  forwardedHeaders.set('x-vf-page-locale', 'en')
  return NextResponse.rewrite(target, { request: { headers: forwardedHeaders } })
}

export const config = { matcher: ['/en', '/en/:path*', '/zh', '/zh/:path*'] }
