'use client'

import { useEffect, useState } from 'react'
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUpRight, Printer } from 'lucide-react'
import Link from '@/components/l2m/localized-link'
import { buyerTasks, type BuyerTask } from '@/lib/diagnosis-presentation'
import { diagnosisPath, diagnosisReportPath } from '@/lib/diagnosis-preview'
import { useLang, type Lang } from '@/lib/i18n'
import { callDiagnosis, isReportReady, type DiagnosisReply } from './connected-preview-api'
import { taskLabels } from './copy'
import { reportPriorities, sampleDocument, sourceTitle, type ReportDocument } from './customer-report-model'

const action = 'inline-flex min-h-11 items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2'
const heading = 'text-xl font-semibold tracking-tight sm:text-2xl'
const panel = 'vf-report-panel rounded-xl border border-ink/15 bg-white p-4 sm:p-6'

const buyerImpact: Record<BuyerTask, [string, string]> = {
  DISCOVER: ['买家通常先按产品系列筛选供应商。路径清楚，可以减少反复查找。', 'Buyers often shortlist suppliers by product family. A clear path saves time finding relevant products.'],
  UNDERSTAND: ['买家需要按型号、规格和工况判断是否适用。资料对应清楚，可以减少来回确认。', 'Buyers compare models, specifications and operating conditions for fit. Clear relationships can reduce follow-up questions.'],
  TRUST: ['买家在列入供应商名单前，通常要核对企业和产品资料。材料集中，更容易完成初步核对。', 'Buyers typically check company and product information before shortlisting. Easier access can help them complete that review.'],
  INQUIRE: ['买家选定产品后需要知道如何询价。型号和需求能随询价传达，销售更容易接手。', 'Once buyers select a product, a clear quote path can help sales receive the model and requirements together.'],
  SEARCH_TECHNICAL: ['采购和技术人员经常转发页面。页面能打开、标题清楚，有助于团队找到同一份资料。', 'Procurement and engineering teams often forward pages. Accessible pages with clear titles help teammates find the same information.'],
}

function ReportBody({ data, lang }: { data: ReportDocument; lang: Lang }) {
  const zh = lang === 'zh'
  const pages = data.pages.filter(page => page.observed)
  const dimensions = buyerTasks.map(task => ({ task, items: data.buyerTasks?.find(group => group.task === task)?.observations ?? [] }))
  const observations = dimensions.flatMap(group => group.items)
  const checked = observations.filter(item => item.result === 'PASS')
  const issues = observations.filter(item => item.result === 'FAIL_WITH_EVIDENCE')
  const priorities = reportPriorities(data)
  const relatedIds = new Set([...checked, ...issues, ...priorities].flatMap(item => item.sources))
  const scope = data.pageScope
  const formatter = new Intl.DateTimeFormat(zh ? 'zh-CN' : 'en-GB', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'UTC' })
  const recorded = pages.map(page => Date.parse(page.checkedAt ?? '')).filter(Number.isFinite)
  const checkTime = recorded.length ? formatter.format(Math.max(...recorded)) + ' UTC' : null
  const sourceName = (page: typeof pages[number]) => data.sample?.labels[page.id] ?? sourceTitle(page.url, lang)
  const label = (task: BuyerTask) => taskLabels[lang][task]
  const positiveTasks = dimensions.filter(group => group.items.some(item => item.result === 'PASS')).map(group => label(group.task))

  function Sources({ ids }: { ids: string[] }) {
    return <div className="flex flex-wrap gap-2 text-sm">
      {pages.map((page, index) => ids.includes(page.id) && <a key={page.id} href={`#evidence-${index + 1}`}
        className="inline-flex min-w-0 items-center gap-1.5 rounded-md bg-mist/65 px-2.5 py-1.5 font-medium underline decoration-ink/40 underline-offset-4">
        {sourceName(page)}<ArrowDown className="size-3.5 shrink-0 vf-report-web-only" aria-hidden="true" />
      </a>)}
    </div>
  }

  return <article className="vf-report-content mx-auto max-w-[1080px] space-y-5 px-4 pb-12 [overflow-wrap:anywhere] sm:space-y-7 sm:px-8" data-testid="vrae-automatic-result">
    <header className="vf-report-hero vf-report-keep rounded-2xl bg-ink p-5 text-ivory sm:p-8">
      <p className="text-sm font-semibold text-lime">{data.sample
        ? (zh ? 'VEYFRONT · 报告示例' : 'VEYFRONT · Sample report')
        : (zh ? 'VEYFRONT · 外贸独立站预诊断' : 'VEYFRONT · B2B website pre-diagnostic')}</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">{zh ? '网站采购体验报告' : 'Website buyer experience report'}</h1>
      <p className="mt-3 text-base font-medium">{new URL(data.address).hostname}</p>
      <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1 text-sm text-ivory/80">
        <span>{zh ? `已访问 ${pages.length} 个公开页面` : `${pages.length} public pages visited`}</span>
        {checkTime && <span>{zh ? '最近一次页面记录' : 'Latest page capture'} · {checkTime}</span>}
        <span>{data.sample ? (zh ? '示例站点与证据' : 'Sample site and evidence') : (zh ? '诊断来源 VRAE · 未经人工审核' : 'Source VRAE · No human review')}</span>
      </div>
    </header>

    <section className={panel + ' vf-report-keep'} aria-labelledby="report-summary">
      <h2 id="report-summary" className={heading}>{zh ? '先看结论' : 'At a glance'}</h2>
      <p className="mt-2 max-w-3xl text-base leading-relaxed">
        {issues.length
          ? (zh ? `在本次已检查范围内，发现 ${issues.length} 项有证据的问题。先核对下方涉及的页面和买家动作。` : `This check found ${issues.length} evidence-backed issues. Start with the pages and buyer actions below.`)
          : priorities.length
            ? (zh ? '本次未确认具体缺陷。下方是结合已记录页面提出的改进建议，值得先核对。' : 'No specific issue was confirmed in this check. The suggestions below are based on recorded pages and merit a closer look.')
            : (zh ? '本次没有足够证据确定优先改动。可以先看已确认的基础和待核对的范围。' : 'The evidence is insufficient to prioritize changes. Start with what was confirmed and where the check was limited.')}
      </p>
      {positiveTasks.length > 0 && <p className="mt-4 rounded-md bg-mist/60 p-3 text-sm leading-relaxed">
        <strong>{zh ? '已观察到可用基础' : 'What is already in place'}</strong>
        <span className="ml-2">{positiveTasks.join(zh ? '、' : ' · ')}</span>
      </p>}
    </section>

    {priorities.length > 0 && <section className="space-y-3" aria-labelledby="report-priorities">
      <h2 id="report-priorities" className={heading}>{zh ? '建议优先关注' : 'Where to focus first'}</h2>
      {priorities.map(item => <div key={item.task} className={panel + ' vf-report-keep space-y-2.5 border-l-4 border-l-lime'}>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <h3 className="text-lg font-semibold">{label(item.task)}</h3>
          <span className="text-xs font-semibold text-ink/75">{item.kind === 'confirmed'
            ? (zh ? '有证据的问题' : 'Evidence-backed issue')
            : (zh ? 'AI 建议 · 需核对' : 'AI suggestion · To verify')}</span>
        </div>
        <p className="leading-relaxed">{item.text}</p>
        <p className="text-sm leading-relaxed"><strong>{zh ? '对买家的可能影响' : 'Potential buyer impact'}</strong>{' · '}
          {data.sample?.actions[item.task]?.impact ?? buyerImpact[item.task][zh ? 0 : 1]}</p>
        {item.kind === 'proposed' ? <>
          <p className="text-sm leading-relaxed"><strong>{zh ? '可以先这样改' : 'A change to consider'}</strong>{' · '}{item.rebuild[0]}</p>
          {(item.verification || item.checks[0]) && <p className="text-sm leading-relaxed"><strong>{zh ? '怎么核对' : 'How to verify'}</strong>{' · '}{item.verification ?? item.checks[0]}</p>}
        </> : <p className="text-sm leading-relaxed"><strong>{zh ? '可以先这样做' : 'First step'}</strong>{' · '}
          {data.sample?.actions[item.task]?.change ?? (zh ? '先复核来源页面，确认问题仍可重现，再修正对应页面或链接。' : 'Recheck the source page to confirm the issue is reproducible, then correct the affected page or link.')}</p>}
        <Sources ids={item.sources} />
      </div>)}
    </section>}

    <section className={panel + ' space-y-3'} aria-labelledby="report-checks">
      <h2 id="report-checks" className={heading}>{zh ? '五个采购环节' : 'Five buyer tasks'}</h2>
      <div className="divide-y divide-ink/15">
        {dimensions.map(({ task, items }) => {
          const known = items.filter(item => item.result === 'PASS' || item.result === 'FAIL_WITH_EVIDENCE')
          const limits = items.filter(item => item.result !== 'PASS' && item.result !== 'FAIL_WITH_EVIDENCE')
          return <section key={task} className="vf-report-keep space-y-1.5 py-3" data-buyer-task={task}>
            <h3 className="font-semibold">{label(task)}</h3>
            {known.length > 0 ? <ul className="space-y-2">{known.map(item => <li key={item.id} data-check-result={item.result} className="space-y-1 text-sm leading-relaxed">
              <p><strong>{item.result === 'PASS' ? (zh ? '已观察到' : 'Observed') : (zh ? '有证据的问题' : 'Issue with evidence')}</strong>{' · '}{item.text}</p>
              <Sources ids={item.sources} />
            </li>)}</ul> : <p className="text-sm text-ink/70">{zh ? '本次未取得足以判断的证据。' : 'This check did not establish a finding.'}</p>}
            {limits.length > 0 && <details className="vf-report-web-only text-sm text-ink/80">
              <summary className="cursor-pointer py-2 font-medium">{zh ? '查看未核实事项和限制' : 'See unverified checks and limits'}</summary>
              <ul className="space-y-2 border-l-2 border-ink/15 pl-3">{limits.map(item => <li key={item.id} data-check-result={item.result}>
                <p><strong>{item.statusText}</strong>{' · '}{item.text}</p><Sources ids={item.sources} />
              </li>)}</ul>
            </details>}
          </section>
        })}
      </div>
    </section>

    {pages.length > 0 && <section className={panel + ' space-y-3'} aria-labelledby="report-evidence">
      <h2 id="report-evidence" className={heading}>{zh ? '证据来自哪些页面' : 'Where the evidence comes from'}</h2>
      <div className="divide-y divide-ink/15">
        {pages.map((page, index) => {
          const findings = [...checked, ...issues].filter(item => item.sources.includes(page.id))
          return <section key={page.id} id={`evidence-${index + 1}`} tabIndex={-1} className={'vf-report-keep scroll-mt-6 space-y-1.5 py-3 ' + (relatedIds.has(page.id) ? '' : 'vf-report-web-only')}>
            <h3 className="text-base font-semibold">{sourceName(page)}</h3>
            {findings.length > 0 && <ul className="space-y-2 text-sm leading-relaxed">{findings.map(item => {
              const excerpt = data.sample?.evidence[item.id]
              return <li key={item.id}>{item.text}{excerpt && <blockquote className="mt-1 whitespace-pre-wrap border-l-2 border-ink/20 pl-3">
                <span className="block font-medium">{excerpt.location}</span>{excerpt.excerpt}
              </blockquote>}</li>
            })}</ul>}
            {findings.length === 0 && <p className="text-sm text-ink/70">{zh ? '本次已记录该页面。' : 'The page was recorded in this check.'}</p>}
            <a href={page.url} target="_blank" rel="noreferrer noopener" className="inline-flex items-center gap-1 text-sm font-medium underline underline-offset-4">
              {zh ? '打开原网页' : 'Open the source page'}<ArrowUpRight className="size-3.5 shrink-0 vf-report-web-only" aria-hidden="true" />
            </a>
          </section>
        })}
      </div>
    </section>}

    <section className={panel + ' vf-report-keep space-y-3'} aria-labelledby="report-rebuild">
      <h2 id="report-rebuild" className={heading}>{zh ? '该改多大？' : 'How much change is needed?'}</h2>
      <p className="text-sm leading-relaxed">{priorities[0]
        ? (zh ? `本次可以先复核「${label(priorities[0].task)}」涉及的页面。确认问题后，按它涉及多少页面和流程来决定改版范围。`
          : `Start by checking the pages for “${label(priorities[0].task)}”. If the issue is confirmed, use the number of affected pages and workflows to decide how much to change.`)
        : (zh ? '先补查证据不足的采购环节，确认买家在哪一步遇到阻碍，再决定是否改版。'
          : 'Check the buyer tasks with insufficient evidence before deciding whether a redesign would help.')}</p>
      <dl className="grid gap-3 text-sm sm:grid-cols-3">
        {(zh ? [
          ['局部优化', '只有个别页面的资料或询价入口需要调整时，先在原站修好。'],
          ['专项升级', '同一问题反复出现在多款产品或多个页面时，统一对应的模板和流程。'],
          ['整站重建', '分类、产品内容和询价路径都需要重排，且现有结构难以支撑时，再评估重建。'],
        ] : [
          ['Targeted fix', 'Update the existing site when only a few pages need content or inquiry changes.'],
          ['Focused upgrade', 'Standardize templates and flows when the same issue recurs across products or pages.'],
          ['Full rebuild', 'Assess a rebuild when navigation, product content and inquiry need redesign and the current structure cannot support it.'],
        ]).map(([title, description]) => <div key={title} className="rounded-md bg-mist/55 p-3">
          <dt className="font-semibold">{title}</dt><dd className="mt-1 leading-relaxed">{description}</dd>
        </div>)}
      </dl>
      {!data.sample && <div className="vf-report-web-only pt-2"><Link href="/start/rebuild#rebuild-inquiry" className={action + ' bg-lime text-ink'}>
        {zh ? '带着报告讨论改版范围' : 'Discuss the right scope with VEYFRONT'}<ArrowRight className="size-4" aria-hidden="true" />
      </Link></div>}
    </section>

    <aside aria-label={zh ? '检查范围和限制' : 'Scope and limits'} className="vf-report-keep px-1 text-sm leading-relaxed text-ink/75">
      <p>{zh ? '本报告仅针对本次访问的公开页面。无法核实的事项仍需另行核对。' : 'The report covers the public pages accessed in this check. Unverified items need further review.'}</p>
      {data.analysisText && data.state === 'ai-unavailable' && <p className="mt-1">{data.analysisText}</p>}
      {scope && (scope.failedUrls.length > 0 || scope.candidateUrls.length > 0) && <p className="mt-1">
        {zh ? `尝试访问但未取得内容 ${scope.failedUrls.length} 个，未访问的候选页面 ${scope.candidateUrls.length} 个。`
          : `${scope.failedUrls.length} attempted without content; ${scope.candidateUrls.length} unvisited candidates.`}
      </p>}
      {scope && (scope.failedUrls.length > 0 || scope.candidateUrls.length > 0) && <details className="vf-report-web-only mt-3" data-testid="vrae-unvisited">
        <summary className="cursor-pointer font-semibold">{zh ? '更多页面范围' : 'More about page coverage'}</summary>
        {scope.inventoryTruncated && <p>{zh ? '候选列表达到本次检查上限。' : 'The candidate list reached the limit for this check.'}</p>}
        <ul className="mt-2 space-y-1">
          {scope.failedUrls.map(url => <li key={url}>{zh ? '未取得内容' : 'No content retrieved'} · {url}</li>)}
          {scope.candidateUrls.map(url => <li key={url}>{zh ? '未访问' : 'Not visited'} · {url}</li>)}
        </ul>
      </details>}
    </aside>
  </article>
}

export function CustomerDiagnosisReport({ example }: { example: boolean }) {
  const { lang } = useLang()
  const zh = lang === 'zh'
  const [reply, setReply] = useState<DiagnosisReply>()
  const [retry, setRetry] = useState(0)

  useEffect(() => {
    if (example) return
    let current = true
    function read() {
      void callDiagnosis('status', { language: lang }).then(response => {
        if (current) setReply(response)
      })
    }
    function restore(event: PageTransitionEvent) {
      if (!event.persisted) return
      setReply(undefined)
      read()
    }
    read()
    window.addEventListener('pageshow', restore)
    return () => {
      current = false
      window.removeEventListener('pageshow', restore)
    }
  }, [example, lang, retry])

  const data = example ? sampleDocument(lang) : reply && isReportReady(reply) ? reply : undefined
  const state = reply?.state
  const delay = reply?.delay ?? 0
  useEffect(() => {
    if (!delay) return
    const timer = window.setTimeout(() => setReply(current => current && { ...current, delay: 0 }), delay * 1000)
    return () => window.clearTimeout(timer)
  }, [delay])
  return <main className="vf-customer-report-page min-h-dvh bg-mist/45 text-ink">
    <div className="vf-report-controls mx-auto flex max-w-[1080px] flex-wrap items-center justify-between gap-2 px-4 py-4 sm:px-8">
      <Link href={diagnosisPath} prefetch={false} className={action + ' -ml-3'}>
        <ArrowLeft className="size-4" aria-hidden="true" />{zh ? '返回诊断任务' : 'Back to the diagnosis'}
      </Link>
      <div className="flex flex-wrap items-center gap-2">
        <a href={`${zh ? '/en' : ''}${diagnosisReportPath}${example ? '?example=1' : ''}`} lang={zh ? 'en' : 'zh-CN'} className={action}>
          {zh ? 'EN' : '中文'}
        </a>
        {data && <button type="button" onClick={() => window.print()} className={action + ' border border-ink/25 bg-white'}>
          <Printer className="size-4" aria-hidden="true" />{zh ? '打印 / 保存 PDF' : 'Print / Save PDF'}
        </button>}
      </div>
    </div>
    {data ? <ReportBody data={data} lang={lang} /> : <section className="mx-auto max-w-[1080px] px-4 pb-12 sm:px-8">
      <div className={panel} role="status">
        <h1 className={heading}>{zh ? '网站采购体验报告' : 'Website buyer experience report'}</h1>
        <p className="mt-2 text-sm leading-relaxed">{!reply
          ? (zh ? '正在读取本次诊断结果…' : 'Reading your diagnosis result…')
          : state === 'denied' || state === 'no-task'
            ? (zh ? '当前会话无法查看报告。请返回诊断页，通过原会话或恢复码查看任务。' : 'The current session cannot open this report. Return to the diagnosis page and use the original session or a recovery code.')
            : state === 'unavailable' || state === 'busy'
              ? (zh ? '暂时无法读取结果。可稍后再试。' : 'The result is temporarily unavailable. Please try again shortly.')
              : (zh ? '当前没有可查看的报告。请返回诊断任务查看进度。' : 'No report is currently available. Return to the diagnosis to check its progress.')}</p>
        {(state === 'unavailable' || state === 'busy') && <button type="button" className={action + ' mt-3 border border-ink/25'}
          disabled={delay > 0} onClick={() => { setReply(undefined); setRetry(current => current + 1) }}>
          {delay > 0 ? (zh ? `${delay} 秒后可重试` : `Retry after ${delay}s`) : (zh ? '重试读取' : 'Try again')}
        </button>}
      </div>
    </section>}
  </main>
}
