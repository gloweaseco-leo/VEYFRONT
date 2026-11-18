import type { BuyerTask } from '@/lib/diagnosis-presentation'

export const taskLabels = {
  zh: {
    DISCOVER: '找到目标产品',
    UNDERSTAND: '理解型号与参数',
    TRUST: '核对企业与产品资料',
    INQUIRE: '找到询价入口',
    SEARCH_TECHNICAL: '访问与页面结构',
  },
  en: {
    DISCOVER: 'Find the right product',
    UNDERSTAND: 'Understand models and specifications',
    TRUST: 'Check company and product information',
    INQUIRE: 'Find a way to request a quote',
    SEARCH_TECHNICAL: 'Page access and structure',
  },
} satisfies Record<'zh' | 'en', Record<BuyerTask, string>>

export const previewStates = ['accepted', 'running', 'completed', 'partial', 'failed', 'expired', 'unavailable', 'access-ended'] as const
export type PreviewState = typeof previewStates[number]

export const stateCopy = {
  zh: {
    accepted: ['任务已接受', '任务已排队，尚未开始检查页面。'],
    running: ['正在检查公开页面', '结果将在检查完成后更新。正式开放后，可凭有效授权返回同一任务。'],
    completed: ['诊断已完成', '可以查看已检查范围内的事实、证据和建议。'],
    partial: ['部分内容无法访问或判断', '可查看已有证据。无法访问的页面和相应检查会标示为 UNKNOWN。'],
    failed: ['任务未能完成', '目前没有可用报告。可稍后重试，或通过网站改版咨询与我们联系。'],
    expired: ['查看期限已结束', '可联系 VEYFRONT 了解重新申请的方式。'],
    unavailable: ['诊断服务暂时不可用', '可稍后再试，也可以直接咨询网站改版。'],
    'access-ended': ['访问权已失效', '请通过原授权渠道核对查看权限。'],
  },
  en: {
    accepted: ['Request accepted', 'The task is queued and page checks have yet to begin.'],
    running: ['Checking public pages', 'Results appear when the check finishes. Once the service opens, you can return to the same task with valid access.'],
    completed: ['Check complete', 'View the observations, evidence and suggestions from the pages covered.'],
    partial: ['Some pages or checks could not be assessed', 'Available evidence is shown. Unavailable pages and inconclusive checks are marked UNKNOWN.'],
    failed: ['The check could not finish', 'A report is unavailable. Try again later or contact us about improving your site.'],
    expired: ['The viewing period has ended', 'Contact VEYFRONT to ask about submitting a new request.'],
    unavailable: ['The check service is temporarily unavailable', 'Try again later or talk to us about improving your website.'],
    'access-ended': ['Access has ended', 'Check your viewing permission through the original access channel.'],
  },
} satisfies Record<'zh' | 'en', Record<PreviewState, [string, string]>>
