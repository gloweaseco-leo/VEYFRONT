/**
 * Optional no-PII operations alert after a lead is durably stored.
 * Never send personal details, never interpret email failure as lead storage failure.
 * Resend env settings are server-side only; missing/incomplete settings => disabled.
 */
type LeadAlert = { reference: string; service: 'launch' | 'rebuild' | 'general' | 'privacy'; receivedAt: string }
type AlertResult = 'sent' | 'disabled' | 'failed'

export async function sendLeadAlert(info: LeadAlert): Promise<AlertResult> {
  const token = process.env.RESEND_API_KEY?.trim()
  const to = process.env.VF_ALERT_TO_EMAIL?.trim()
  const from = process.env.VF_ALERT_FROM_EMAIL?.trim()
  if (!token || !to || !from) return 'disabled'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(from)) return 'failed'
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Idempotency-Key': `veyfront-lead-${info.reference}`,
      },
      body: JSON.stringify({
        from,
        to: [to],
        subject: `VEYFRONT inquiry received [${info.service}]`,
        text: [
          'A VEYFRONT inquiry was stored privately.',
          `Reference: ${info.reference}`,
          `Category: ${info.service}`,
          `Received UTC: ${info.receivedAt}`,
          'Check the authorized Vercel private Blob store for details.',
          'No customer personal information is included in this email.',
        ].join('\n'),
      }),
      signal: AbortSignal.timeout(4000),
      cache: 'no-store',
    })
    if (!response.ok) return 'failed'
    return 'sent'
  } catch {
    return 'failed'
  }
}
