import { createHash, randomBytes, randomUUID, timingSafeEqual } from 'node:crypto'

export type AcyService = 'launch' | 'rebuild'
export type AcyStatus = 'needs_completion' | 'qualified' | 'human_review'
export type AcyChannel = 'email' | 'wechat' | 'feishu'
export type AcyBrief = { company: string; website: string; markets: string; desiredAction: string; description: string }
export type AcyEvent = { actionId: string; type: string; at: string }
export type AcyJourney = {
  version: 1
  id: string
  reference: string
  createdAt: string
  updatedAt: string
  expiresAt: string
  accessHash: string
  service: AcyService
  status: AcyStatus
  name: string
  email: string
  brief: AcyBrief
  channel: AcyChannel
  consentAt: string
  events: AcyEvent[]
}

export const PREVIEW_QA_EMAILS = ['hello@veyfront.com', 'qa@example.invalid'] as const
export const P1_EXPIRES_MS = 48 * 3600 * 1000

export function p1Enabled(env?: { VERCEL_ENV?: string; ACY_P1_ENABLED?: string }): boolean {
  const flags = env ?? { VERCEL_ENV: process.env.VERCEL_ENV, ACY_P1_ENABLED: process.env.ACY_P1_ENABLED }
  return flags.VERCEL_ENV === 'preview' && flags.ACY_P1_ENABLED === 'true'
}

export function safeText(value: unknown, length: number): string | null {
  if (typeof value !== 'string') return null
  const normalized = value.trim()
  return normalized.length <= length ? normalized : null
}

export function validService(value: unknown): value is AcyService {
  return value === 'launch' || value === 'rebuild'
}

export function validQaEmail(value: string): boolean {
  return PREVIEW_QA_EMAILS.includes(value.toLowerCase() as typeof PREVIEW_QA_EMAILS[number])
}

export function validateBrief(service: AcyService, input: Record<string, unknown>): AcyBrief | null {
  const company = safeText(input.company ?? '', 160)
  const website = safeText(input.website ?? '', 500)
  const markets = safeText(input.markets ?? '', 240)
  const desiredAction = safeText(input.desiredAction ?? '', 240)
  const description = safeText(input.description ?? '', 2000)
  if (company === null || website === null || markets === null || desiredAction === null || description === null) return null
  if (description.length < 20) return null
  if (service === 'rebuild' && !/^https?:\/\/[a-z0-9.-]+\.[a-z]{2,}(?:[/?#]|$)/i.test(website)) return null
  return { company, website, markets, desiredAction, description }
}

export function missingBriefFields(brief: AcyBrief): Array<'markets' | 'desiredAction'> {
  return (['markets', 'desiredAction'] as const).filter((key) => brief[key].trim().length < 3)
}

export function deriveStatus(brief: AcyBrief): AcyStatus {
  return missingBriefFields(brief).length ? 'needs_completion' : 'qualified'
}

export function makeJourney(info: {
  service: AcyService; name: string; email: string; brief: AcyBrief; now?: Date
}): { journey: AcyJourney; accessToken: string } {
  const id = randomUUID()
  const accessToken = randomBytes(32).toString('base64url')
  const now = info.now ?? new Date()
  const journey: AcyJourney = {
    version: 1, id, reference: 'VF-ACY-' + id.slice(0, 8).toUpperCase(),
    createdAt: now.toISOString(), updatedAt: now.toISOString(),
    expiresAt: new Date(now.getTime() + P1_EXPIRES_MS).toISOString(),
    accessHash: createHash('sha256').update(accessToken).digest('hex'),
    service: info.service, name: info.name, email: info.email.toLowerCase(),
    brief: info.brief, channel: 'email', status: deriveStatus(info.brief),
    consentAt: now.toISOString(), events: [{ actionId: id, type: 'created', at: now.toISOString() }],
  }
  return { journey, accessToken }
}

export function authenticate(journey: AcyJourney, accessToken: unknown, now = new Date()): boolean {
  if (typeof accessToken !== 'string' || accessToken.length < 30 || accessToken.length > 128) return false
  if (Date.parse(journey.expiresAt) <= now.getTime()) return false
  const observed = createHash('sha256').update(accessToken).digest()
  const expected = Buffer.from(journey.accessHash, 'hex')
  return expected.length === observed.length && timingSafeEqual(expected, observed)
}

export function advanceJourney(journey: AcyJourney, action: Record<string, unknown>, now = new Date()):
  { kind: 'updated'; journey: AcyJourney } | { kind: 'duplicate'; journey: AcyJourney } | { kind: 'invalid' } {
  const actionId = action.actionId
  if (typeof actionId !== 'string' || !/^[0-9a-f-]{36}$/i.test(actionId)) return { kind: 'invalid' }
  if (journey.events.some(e => e.actionId === actionId)) return { kind: 'duplicate', journey }
  if (journey.events.length >= 30) return { kind: 'invalid' }
  let brief = journey.brief
  let status = journey.status
  let channel = journey.channel
  let type: string
  if (action.type === 'complete_brief' && status !== 'human_review') {
    const markets = safeText(action.markets ?? brief.markets, 240)
    const desiredAction = safeText(action.desiredAction ?? brief.desiredAction, 240)
    if (markets === null || desiredAction === null) return { kind: 'invalid' }
    brief = { ...brief, markets, desiredAction }
    status = deriveStatus(brief)
    type = 'brief_completed'
  } else if (action.type === 'choose_channel' && ['email','wechat','feishu'].includes(String(action.channel))) {
    channel = action.channel as AcyChannel
    type = 'channel_preference_recorded'
  } else if (action.type === 'request_human') {
    status = 'human_review'
    type = 'human_review_requested'
  } else return { kind: 'invalid' }
  const at = now.toISOString()
  return {
    kind: 'updated',
    journey: { ...journey, brief, channel, status, updatedAt: at, events: [...journey.events, { actionId, type, at }] }
  }
}

export function publicJourney(j: AcyJourney) {
  return {
    id: j.id, reference: j.reference, service: j.service, status: j.status,
    createdAt: j.createdAt, updatedAt: j.updatedAt, expiresAt: j.expiresAt,
    brief: j.brief, channel: j.channel, nextQuestions: missingBriefFields(j.brief),
    recentEvents: j.events.map(e => ({ type: e.type, at: e.at })),
  }
}
