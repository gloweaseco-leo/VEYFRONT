import type { Metadata } from 'next'

/**
 * Vercel production deployment is public. Preview deployments and local CI stay noindex.
 * This is a build-environment decision, not a client-side toggle.
 */
export const isPublicRelease = process.env.VERCEL_ENV === 'production'

export const releaseRobots: Metadata['robots'] = isPublicRelease
  ? { index: true, follow: true }
  : { index: false, follow: false }
