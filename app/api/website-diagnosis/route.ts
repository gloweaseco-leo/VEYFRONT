export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const headers = {
  'Cache-Control': 'no-store',
  'Referrer-Policy': 'no-referrer',
  'X-Content-Type-Options': 'nosniff',
}

// G1 is a server-only test boundary. VF-B stays closed until a G2 release contract is approved.
function unavailable() {
  return Response.json({ status: 'unavailable' }, { status: 404, headers })
}

export { unavailable as GET, unavailable as POST }
