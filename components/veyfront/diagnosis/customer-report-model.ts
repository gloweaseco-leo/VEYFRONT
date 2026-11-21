import { buyerTasks, type BuyerTask } from '@/lib/diagnosis-presentation'
import type { Lang } from '@/lib/i18n'
import type { AutomaticResult } from '@/lib/vrae-preview-client'
import { exampleReport } from './example'

type Observation = NonNullable<AutomaticResult['buyerTasks']>[number]['observations'][number]
type Evidence = { location: string; excerpt: string }

export type ReportDocument = AutomaticResult & {
  address: string
  sample?: {
    labels: Record<string, string>
    evidence: Record<string, Evidence>
    actions: Partial<Record<BuyerTask, { impact: string; change: string }>>
  }
}

export function sampleDocument(lang: Lang): ReportDocument {
  const source = exampleReport(lang, false)
  const zh = lang === 'zh'
  const pages = source.pages.map((page, i) => ({
    id: 'sample-' + i, url: page.url, observed: page.outcome === 'reviewed', checkedAt: source.checkedAt,
  }))
  const sample: NonNullable<ReportDocument['sample']> = { labels: {}, evidence: {}, actions: {} }
  pages.forEach((page, i) => { sample.labels[page.id] = source.pages[i].label })
  const tasks = buyerTasks.map(task => {
    const item = source.results[task]
    const id = 'sample-' + task
    const sources = item.status === 'UNKNOWN' ? [] : pages.filter(page => page.url === item.evidence.url).map(page => page.id)
    if (item.status !== 'UNKNOWN') sample.evidence[id] = item.evidence
    if (item.status === 'ISSUE') sample.actions[task] = { impact: item.buyerImpact, change: item.rebuild }
    const result: Observation['result'] = item.status === 'OBSERVED' ? 'PASS' : item.status === 'ISSUE' ? 'FAIL_WITH_EVIDENCE' : 'UNKNOWN'
    const statusText = {
      PASS: zh ? '已观察到' : 'Observed',
      FAIL_WITH_EVIDENCE: zh ? '有证据的问题' : 'Issue with evidence',
      UNKNOWN: zh ? '本次未核实' : 'Unverified',
    }[result]
    return { task, observations: [{ id, result, statusText, text: item.fact, sources }] }
  })
  return { address: source.targetUrl, state: 'diagnosed', pages, buyerTasks: tasks, insights: [], sample }
}

export function reportPriorities(data: ReportDocument) {
  const confirmed = (data.buyerTasks ?? []).flatMap(({ task, observations }) => observations
    .filter(item => item.result === 'FAIL_WITH_EVIDENCE' && item.sources.length > 0)
    .map(item => ({ task, kind: 'confirmed' as const, text: item.text, sources: item.sources })))
  const proposed = data.insights.map(item => ({ ...item, kind: 'proposed' as const, text: item.explanation }))
  const used = new Set<BuyerTask>()
  return [...confirmed, ...proposed].filter(item => {
    if (used.has(item.task)) return false
    used.add(item.task)
    return true
  }).slice(0, 3)
}

export function sourceTitle(url: string, lang: Lang) {
  const { pathname } = new URL(url)
  const parts = pathname.split('/').filter(Boolean)
  const zh = lang === 'zh'
  if (!parts.length) return zh ? '网站首页' : 'Homepage'
  const slug = parts[parts.length - 1]
  let label = slug
  try { label = decodeURIComponent(slug) } catch { /* Keep the visible path segment. */ }
  label = label.replace(/[-_]+/g, ' ')
  const short = label.length > 32 ? label.slice(0, 31).trimEnd() + '…' : label
  // A path is a locator. It does not establish the role or contents of the page.
  return (zh ? '页面 · ' : 'Page · ') + short
}
