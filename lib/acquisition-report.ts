import { safeAcquisitionChannel, safeAcquisitionLandingPage } from './acquisition-channel.ts'

export type LeadSourceSummary = {
  savedFormInquiries: number
  byService: Record<string, number>
  byChannel: Record<string, number>
  byLandingPage: Record<string, number>
  caveat: string
}

/** Only closed enums/path allowlist leave the operator environment; no names, company, URLs or descriptions. */
export function createLeadSourceSummary(): LeadSourceSummary {
  return {
    savedFormInquiries: 0,
    byService: { launch: 0, rebuild: 0, general: 0 },
    byChannel: {
      'google-organic': 0, 'bing-organic': 0, 'baidu-organic': 0,
      'other-search': 0, 'external-referral': 0, unknown: 0,
    },
    byLandingPage: {},
    caveat: 'Only persisted form receipts. Browser referrer categories are unverified hints. Not GSC-verified organic clicks, qualified leads or conversions. WeCom/Email handled separately.',
  }
}
export function addSavedFormReceipt(summary: LeadSourceSummary, source: unknown): void {
  if (!source || typeof source !== 'object') return
  const item = source as Record<string, unknown>
  if (item.source !== 'website-form') return
  if (item.service !== 'launch' && item.service !== 'rebuild' && item.service !== 'general') return
  const hint = item.acquisition && typeof item.acquisition === 'object'
    ? item.acquisition as Record<string, unknown> : {}
  const channel = safeAcquisitionChannel(hint.channel)
  const landing = safeAcquisitionLandingPage(hint.landingPage) ?? 'unknown'
  summary.savedFormInquiries += 1
  summary.byService[item.service] += 1
  summary.byChannel[channel] += 1
  summary.byLandingPage[landing] = (summary.byLandingPage[landing] ?? 0) + 1
}
