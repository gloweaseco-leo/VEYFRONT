import { ArrowDownRight, Check } from 'lucide-react'
import type { Lang } from '@/lib/i18n'
import { buyerTasks, type DiagnosisReportView, type TaskResult } from '@/lib/diagnosis-presentation'
import { taskLabels } from './copy'

const wrappingUrl = 'min-w-0 font-mono text-xs leading-relaxed [overflow-wrap:anywhere]'
const anchorStyle = 'font-semibold underline decoration-ink/35 underline-offset-4 hover:decoration-ink focus-visible:outline-2 focus-visible:outline-offset-2'

function Evidence({ result, lang }: { result: Exclude<TaskResult, { status: 'UNKNOWN' }>; lang: Lang }) {
  const zh = lang === 'zh'
  return (
    <details className="mt-4 rounded-lg border border-ink/15 bg-mist/25 px-4">
      <summary className="flex min-h-11 cursor-pointer list-none items-center gap-2 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 [&::-webkit-details-marker]:hidden">
        <ArrowDownRight className="size-4 shrink-0" aria-hidden="true" />{zh ? '查看页面证据' : 'See page evidence'}
      </summary>
      <div className="space-y-2 border-t border-ink/10 py-3 text-sm leading-relaxed">
        <p className={wrappingUrl}>{result.evidence.url}</p>
        <p>{result.evidence.location}</p>
        <blockquote className="whitespace-pre-wrap rounded-md bg-white p-3 font-mono text-xs leading-relaxed [overflow-wrap:anywhere]">{result.evidence.excerpt}</blockquote>
      </div>
    </details>
  )
}

export function DiagnosisReport({ report, lang }: { report: DiagnosisReportView; lang: Lang }) {
  const zh = lang === 'zh'
  const labels = taskLabels[lang]
  const example = report.kind === 'synthetic'
  const priorities = report.priority.slice(0, 3)
  const observed = buyerTasks.filter(task => report.results[task].status === 'OBSERVED')
  const pagesReviewed = report.pages.filter(page => page.outcome === 'reviewed').length
  const checkedAt = new Intl.DateTimeFormat(zh ? 'zh-CN' : 'en-GB', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'UTC',
  }).format(new Date(report.checkedAt))

  return (
    <article aria-labelledby="diagnosis-report-title" data-testid="diagnosis-report" className="mt-8 space-y-8">
      <header className="rounded-xl bg-ink p-5 text-ivory sm:p-7">
        {example && <p className="text-xs font-semibold text-lime">{zh ? '虚构报告示例' : 'Fictional report example'}</p>}
        <h3 id="diagnosis-report-title" className="mt-2 text-2xl font-semibold sm:text-3xl">{zh ? '海外采购体验报告' : 'Overseas buyer experience report'}</h3>
        <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
          <div className="min-w-0"><dt className="font-semibold">{zh ? (example ? '示例网站' : '诊断网址') : (example ? 'Example site' : 'Website checked')}</dt><dd className={wrappingUrl + ' mt-1 text-ivory/80'}>{report.targetUrl}</dd></div>
          <div><dt className="font-semibold">{zh ? (example ? '示例检查时间' : '检查时间') : (example ? 'Example date' : 'Checked at')}</dt><dd className="mt-1 text-ivory/80"><time dateTime={report.checkedAt}>{checkedAt} UTC</time></dd></div>
          <div><dt className="font-semibold">{zh ? '资料来源' : 'Source'}</dt><dd className="mt-1 text-ivory/80">{report.source}</dd></div>
          <div><dt className="font-semibold">{zh ? '页面覆盖' : 'Pages covered'}</dt><dd className="mt-1 text-ivory/80">{zh ? `已检查 ${pagesReviewed} / ${report.pages.length} 页` : `${pagesReviewed} of ${report.pages.length} pages reviewed`}</dd></div>
        </dl>
        <details className="mt-4 border-t border-ivory/20">
          <summary className="cursor-pointer py-3 text-sm font-semibold text-lime focus-visible:outline-2 focus-visible:outline-offset-2">{zh ? '查看页面清单' : 'View pages covered'}</summary>
          <ul className="space-y-3">
            {report.pages.map(page => <li key={page.url} className="border-l border-ivory/25 pl-3">
              <p className="text-sm">{page.label}{page.outcome === 'unknown' && <span className="ml-2 font-mono text-xs text-lime">UNKNOWN</span>}</p>
              <p className={wrappingUrl + ' text-ivory/75'}>{page.url}</p>
            </li>)}
          </ul>
        </details>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        <section className="rounded-lg border border-ink/15 bg-white p-4 sm:p-5">
          <h4 className="text-base font-semibold">{zh ? '建议优先处理' : 'What to address first'}</h4>
          {priorities.length > 0
            ? <ol className="mt-2 list-inside list-decimal space-y-3 text-sm">
                {priorities.map(task => <li key={task}><a className={anchorStyle} href={'#diagnosis-' + task}>{labels[task]}</a></li>)}
              </ol>
            : <p className="mt-2 text-sm text-ink/75">{zh ? '现有证据未支持优先改进项。' : 'The available evidence supports no priority action.'}</p>}
        </section>
        <section className="rounded-lg border border-ink/15 bg-mist/35 p-4 sm:p-5">
          <h4 className="text-base font-semibold">{zh ? '本次已确认正常' : 'What worked in the review'}</h4>
          {observed.length > 0
            ? <ul className="mt-2 space-y-3 text-sm">{observed.map(task => <li key={task} className="flex gap-2"><Check aria-hidden="true" className="mt-0.5 size-4 shrink-0" /><span>{report.results[task].fact}</span></li>)}</ul>
            : <p className="mt-2 text-sm text-ink/75">{zh ? '没有可确认的正常事项。' : 'No positive observations could be confirmed.'}</p>}
        </section>
      </div>

      <section aria-labelledby="buyer-tasks-title">
        <h4 id="buyer-tasks-title" className="text-xl font-semibold">{zh ? '五项采购任务' : 'Five buyer tasks'}</h4>
        <div className="mt-3 grid gap-4 lg:grid-cols-2">
          {buyerTasks.map(task => {
            const result = report.results[task]
            const status = result.status === 'UNKNOWN' ? 'UNKNOWN'
              : result.status === 'OBSERVED' ? (zh ? '已确认' : 'Confirmed') : (zh ? '有改进机会' : 'Opportunity')
            return <section key={task} id={'diagnosis-' + task} tabIndex={-1} data-testid="buyer-task"
              className="min-w-0 scroll-mt-5 rounded-xl border border-ink/15 bg-white p-4 focus:outline-2 focus:outline-offset-2 sm:p-5">
              <div className="flex flex-wrap items-center gap-2">
                <h5 className="text-lg font-semibold">{labels[task]}</h5>
                <span className="rounded-md bg-mist/60 px-2 py-1 text-xs font-semibold">{status}</span>
              </div>
              <dl className="mt-3 space-y-3 text-sm leading-relaxed">
                <div><dt className="font-semibold">{zh ? '检查结果' : 'Observation'}</dt><dd className="mt-0.5 text-ink/80">{result.fact}</dd></div>
                {result.status === 'ISSUE' && <>
                  <div><dt className="font-semibold">{zh ? '可能影响买家的地方' : 'Possible effect on buyers'}</dt><dd className="mt-0.5 text-ink/80">{result.buyerImpact}</dd></div>
                  <div><dt className="font-semibold">{zh ? '初步改版建议' : 'Suggested website improvement'}</dt><dd className="mt-0.5 text-ink/80">{result.rebuild}</dd></div>
                </>}
                {result.status === 'UNKNOWN' && <div><dt className="font-semibold">{zh ? '建议补核' : 'What to check next'}</dt><dd className="mt-0.5 text-ink/80">{result.nextCheck}</dd></div>}
              </dl>
              {result.status !== 'UNKNOWN' && <Evidence result={result} lang={lang} />}
            </section>
          })}
        </div>
      </section>
    </article>
  )
}
