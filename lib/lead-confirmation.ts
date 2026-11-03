/**
 * Optional transactional receipt email. No client business details, attachments, or
 * promises of response deadlines. Explicit enable flag prevents accidental production mail.
 * Durable storage and internal operations notification are independent of email delivery.
 */
type LeadConfirmation = {
  reference: string
  email: string
  lang: 'zh' | 'en'
  service: 'launch' | 'rebuild' | 'general' | 'privacy'
}
type ConfirmationResult = 'sent' | 'disabled' | 'failed'

export async function sendLeadConfirmation(info: LeadConfirmation): Promise<ConfirmationResult> {
  if (info.service === 'privacy' || process.env.VF_CONFIRM_ENABLED !== 'true') return 'disabled'
  const token = process.env.RESEND_API_KEY?.trim()
  const from = process.env.VF_CONFIRM_FROM_EMAIL?.trim()
  if (!token || !from) return 'disabled'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(from) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(info.email)) return 'failed'
  const zh = info.lang === 'zh'
  const subject = zh ? '【VEYFRONT】已收到您的建站咨询' : 'VEYFRONT — Your website inquiry is received'
  const text = zh
    ? [
      '您好！','',
      '我们已收到您的网站建设咨询。','',
      '咨询编号：' + info.reference,'',
      '接下来，我们会根据您提交的需求与您确认建设方案、交付范围及报价。',
      '提交咨询不构成合同，也无需付款；不会自动修改您现有的网站。','',
      '如需补充资料，请回复本邮件或联系 hello@veyfront.com。','',
      'VEYFRONT 团队',
      'Building Digital Frontiers for Global Business',
    ].join('\n')
    : [
      'Hello,','',
      'We have received your B2B website inquiry.','',
      'Reference: ' + info.reference,'',
      'We will review your request and discuss the scope, proposal and written quote.',
      'Submitting an inquiry does not create a contract or payment and does not modify your website.','',
      'To add information, reply to this email or contact hello@veyfront.com.','',
      'VEYFRONT Team',
      'Building Digital Frontiers for Global Business',
    ].join('\n')
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + token,
        'Content-Type': 'application/json',
        'Idempotency-Key': 'veyfront-receipt-' + info.reference,
      },
      body: JSON.stringify({
        from,
        to: [info.email],
        reply_to: 'hello@veyfront.com',
        subject,
        text,
      }),
      signal: AbortSignal.timeout(4000),
      cache: 'no-store',
    })
    return response.ok ? 'sent' : 'failed'
  } catch {
    return 'failed'
  }
}
