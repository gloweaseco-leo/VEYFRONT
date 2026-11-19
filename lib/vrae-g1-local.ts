import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { createG1Adapter, type G1Session } from './vrae-g1-server.ts'

type Adapter = ReturnType<typeof createG1Adapter>
type OfflineConfig = {
  transport: Parameters<typeof createG1Adapter>[0]
  invitations: {
    codeSha256: string
    expiresAt: string
    authority: Parameters<Adapter['submit']>[0]
    session: G1Session
  }[]
}

// This test surface is excluded from managed previews and production.
export function localG1Enabled(env = process.env) {
  return env.NODE_ENV === 'development' && env.VF_B_OFFLINE_G1 === '1' &&
    !env.VERCEL && !env.VERCEL_ENV && Boolean(env.VF_B_OFFLINE_G1_FIXTURES)
}

export function offlineInvitation(code: string) {
  if (!/^[A-Za-z0-9_-]{24,128}$/.test(code)) return null
  const file = process.env.VF_B_OFFLINE_G1_FIXTURES
  if (!file) return null
  const config = JSON.parse(readFileSync(file, 'utf8')) as OfflineConfig
  const lookup = createHash('sha256').update(code).digest('hex')
  const matching = config.invitations.filter(item => item.codeSha256 === lookup && Date.parse(item.expiresAt) > Date.now())
  if (matching.length !== 1) return null
  return { adapter: createG1Adapter(config.transport), invitation: matching[0] }
}

export function matchesOfflineSite(address: string, authorized: string) {
  if (address.length > 500 || /[\\?#\s]/.test(address)) return false
  try {
    const scheme = /^[a-z][a-z\d+.-]*:\/\//i.test(address)
    const target = new URL(scheme ? address : 'https://' + address)
    return target.protocol === 'https:' && target.hostname.endsWith('.example') &&
      !target.username && !target.password && !target.port && new URL(authorized).href === target.href
  } catch {
    return false
  }
}
