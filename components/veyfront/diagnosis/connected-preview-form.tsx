'use client'

import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { buyerTasks } from '@/lib/diagnosis-presentation'
import { useLang } from '@/lib/i18n'
import type { AutomaticResult } from '@/lib/vrae-preview-client'
import { taskLabels } from './copy'

const statusCopy: Record<string, readonly [string, string]> = {
  prepared: ['申请已保存，可以继续提交。', 'Your request is saved and can be submitted.'],
  accepted: ['诊断申请已受理。', 'Your diagnostic request was accepted.'],
  running: ['正在检查网站的公开页面。', 'Checking the website’s public pages.'],
  analyzing: ['页面检查已结束，正在整理诊断结论。', 'The page check has ended. The diagnostic findings are being prepared.'],
  diagnosed: ['本次自动诊断已完成。', 'The automated check is complete.'],
  'ai-unavailable': ['本次没有可展示的 AI 结论。已有检查结果仍可查看。', 'No AI interpretation is available. You can still see the recorded checks.'],
  failed: ['本次页面检查未能完成。您仍可咨询网站改版。', 'The page check could not be completed. You can still discuss a website redesign.'],
  denied: ['预览权限或任务会话不可用，也可能已到期。', 'Preview or task access is unavailable or has expired.'],
  'no-task': ['当前会话没有可查看的任务。', 'This session has no task to view.'],
  'consent-changed': ['授权说明已更新，请重新加载后阅读并确认。', 'The consent terms changed. Reload the page, then review and confirm them.'],
  'invalid-address': ['请输入公开网站域名或 HTTPS 网址，去掉查询参数和页面锚点。', 'Enter a public website domain or an HTTPS address without query parameters or a page fragment.'],
  conflict: ['此会话已有申请，请查看当前任务。', 'This session already has a request. Check the current task.'],
  busy: ['诊断服务当前繁忙，请稍后重试。', 'The diagnostic service is busy. Try again shortly.'],
  closed: ['自动诊断预览暂未开放。', 'The automated diagnostic preview is closed.'],
  unavailable: ['自动诊断服务暂不可用，请稍后再试。', 'The diagnostic service is temporarily unavailable. Please try again shortly.'],
  invalid: ['请填写网址并确认授权。', 'Enter a website and confirm your authorization.'],
  'return-issued': ['恢复码有效期最多 5 分钟，仅可使用一次。请妥善保管。', 'This one-time recovery code expires within five minutes. Keep it private.'],
}

const endpoint = '/api/website-diagnosis/v1'
const button = 'min-h-11 rounded-md border border-ink/25 px-3 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50'
const input = 'mt-1 min-h-11 w-full rounded-md border border-ink/30 bg-white px-3 text-base focus-visible:outline-2 focus-visible:outline-offset-2'
const waiting = ['accepted', 'running', 'analyzing']
type ResponseData = Partial<Omit<AutomaticResult, 'state'>> & {
  state: string
  address?: string
  consentText?: string
  consentHash?: string
  code?: string
}

async function call(action?: string, fields: Record<string, string | boolean> = {}): Promise<ResponseData & { delay: number }> {
  try {
    const response = await fetch(endpoint, {
      credentials: 'same-origin', cache: 'no-store',
      ...(action && { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action, ...fields }) }),
    })
    const reply: ResponseData = await response.json()
    const seconds = Number(response.headers.get('Retry-After'))
    return { ...reply, delay: response.status === 429 ? (seconds >= 1 && seconds <= 900 ? seconds : 60) : 0 }
  } catch {
    return { state: 'unavailable', delay: 0 }
  }
}

function EvidenceLinks({ ids, pages, zh }: { ids: string[]; pages: AutomaticResult['pages']; zh: boolean }) {
  if (!ids.length) return null
  return <ul aria-label={zh ? '来源证据' : 'Source evidence'} className="flex flex-wrap gap-x-3 gap-y-1">
    {ids.map(id => {
      const index = pages.findIndex(page => page.id === id)
      return index < 0 ? null : <li key={id}><a href={'#vrae-source-' + id} className="font-semibold underline underline-offset-4">
        {zh ? '查看来源 ' : 'See source '}{index + 1}
      </a></li>
    })}
  </ul>
}

type Observation = NonNullable<AutomaticResult['buyerTasks']>[number]['observations'][number]

function ObservationList({ items, pages, zh }: { items: Observation[]; pages: AutomaticResult['pages']; zh: boolean }) {
  return <ul className="space-y-2">{items.map(item => <li key={item.id} className="rounded-md bg-mist/55 p-3" data-check-result={item.result}>
    <p className="font-semibold">{item.statusText}</p>
    <p className="mt-1">{item.text}</p>
    <EvidenceLinks ids={item.sources} pages={pages} zh={zh} />
  </li>)}</ul>
}

function AutomaticDiagnosis({ data, address }: { data: AutomaticResult; address: string }) {
  const { lang } = useLang()
  const zh = lang === 'zh'
  const checked = data.pages.filter(page => page.observed).length
  const dimensions = data.buyerTasks ?? buyerTasks.map(task => ({ task, observations: [] }))
  const scope = data.pageScope
  const formatter = new Intl.DateTimeFormat(zh ? 'zh-CN' : 'en-GB', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'UTC' })
  return <article aria-labelledby="automatic-result-heading" className="mt-6 space-y-4 [overflow-wrap:anywhere]" data-testid="vrae-automatic-result">
    <header className="rounded-lg bg-ink p-4 text-ivory sm:p-5">
      <h3 id="automatic-result-heading" className="text-xl font-semibold">{zh ? '网站采购体验预诊断' : 'Website buyer experience check'}</h3>
      {address && <p className="mt-2 text-sm">{address}</p>}
      <p className="mt-2 text-sm text-ivory/80">{zh
        ? `来源为 VRAE。本次已访问 ${checked} 个页面。自动结论供改版参考，尚未经过人工审核。`
        : `Source: VRAE. ${checked} pages were accessed. Automated findings are for planning and have not been reviewed by a person.`}</p>
      {data.analysisText && <p className="mt-2 text-sm text-ivory/80">{data.analysisText}</p>}
    </header>
    <div className="space-y-3">
      {dimensions.map(({ task, observations }) => {
        const confirmed = observations.filter(item => item.result === 'PASS' || item.result === 'FAIL_WITH_EVIDENCE')
        const limits = observations.filter(item => item.result !== 'PASS' && item.result !== 'FAIL_WITH_EVIDENCE')
        const insights = data.insights.filter(insight => insight.task === task)
        return <section key={task} className="space-y-2 rounded-lg border border-ink/15 p-3 text-sm leading-relaxed sm:p-4" data-buyer-task={task}>
          <h4 className="text-base font-semibold">{taskLabels[lang][task]}</h4>
          {confirmed.length > 0 && <ObservationList items={confirmed} pages={data.pages} zh={zh} />}
          {limits.length > 0 && <details>
            <summary className="cursor-pointer py-2 font-semibold">{zh ? '未核实及检查限制' : 'Unverified checks and limits'}（{limits.length}）</summary>
            <ObservationList items={limits} pages={data.pages} zh={zh} />
          </details>}
          {!observations.length && !insights.length && <p className="text-ink/75">
            {zh ? '本次未取得可核实的结果。' : 'This check produced no verifiable result.'}
          </p>}
          {insights.map((insight, index) => <div key={index} className="space-y-2 border-t border-ink/15 pt-3">
            <p><strong>{zh ? 'AI 分析' : 'AI interpretation'}</strong> · {insight.explanation}</p>
            <ul className="ml-5 list-disc space-y-1">{insight.rebuild.map((line, i) =>
              <li key={i}><strong>{zh ? '改版建议' : 'Suggested improvement'}</strong> · {line}</li>)}</ul>
            {insight.checks.map((line, i) => <p key={i}><strong>{zh ? '待核对' : 'To verify'}</strong> · {line}</p>)}
            {insight.verification && <p><strong>{zh ? '改完怎么验证' : 'How to verify the improvement'}</strong> · {insight.verification}</p>}
            <EvidenceLinks ids={insight.sources} pages={data.pages} zh={zh} />
          </div>)}
        </section>
      })}
    </div>
    {(data.pages.length > 0 || !!scope?.failedUrls.length || !!scope?.candidateUrls.length) && <section aria-labelledby="automatic-sources" className="space-y-3 text-sm">
      <h4 id="automatic-sources" className="text-base font-semibold">{zh ? '页面范围与证据' : 'Pages and evidence'}</h4>
      <ol className="space-y-2">
        {data.pages.map((page, index) => <li key={page.id} id={'vrae-source-' + page.id} tabIndex={-1}
          className="scroll-mt-24 rounded-md bg-mist/55 p-3 focus-visible:outline-2">
          <p className="font-semibold">{index + 1}. {page.observed ? (zh ? '已访问页面' : 'Visited page') : 'UNKNOWN'}</p>
          <p className="mt-1 select-all">{page.url}</p>
          {page.checkedAt && <time dateTime={page.checkedAt} className="mt-1 block text-xs">{formatter.format(new Date(page.checkedAt))} UTC</time>}
        </li>)}
      </ol>
      {!!scope?.failedUrls.length && <details className="rounded-md border border-ink/15 p-3">
        <summary className="cursor-pointer font-semibold">{zh ? '尝试访问但未取得内容' : 'Attempted pages without content'}（{scope.failedUrls.length}）</summary>
        <ul className="mt-2 space-y-2">{scope.failedUrls.map(url => <li key={url}>{url}</li>)}</ul>
      </details>}
      {!!scope?.candidateUrls.length && <details className="rounded-md border border-ink/15 p-3" data-testid="vrae-unvisited">
        <summary className="cursor-pointer font-semibold">{zh ? '本次未访问的候选页面' : 'Unvisited candidate pages'}（{scope.candidateUrls.length}）</summary>
        <p className="mt-2 text-ink/75">{zh ? '这些链接仅列入候选范围，未作评价。' : 'These links were recorded as candidates and were left unassessed.'}</p>
        {scope.inventoryTruncated && <p className="mt-2 text-ink/75">{zh ? '候选列表已达到本次检查上限。' : 'The candidate list reached the limit for this check.'}</p>}
        <ul className="mt-2 space-y-2">{scope.candidateUrls.map(url => <li key={url}>{url}</li>)}</ul>
      </details>}
    </section>}
  </article>
}

export function ConnectedPreviewForm() {
  const { lang } = useLang()
  const zh = lang === 'zh'
  const [address, setAddress] = useState('')
  const [consent, setConsent] = useState<{ text: string; hash: string }>()
  const [confirmed, setConfirmed] = useState(false)
  const [stage, setStage] = useState<'input' | 'prepared' | 'task'>('input')
  const [state, setState] = useState('')
  const [result, setResult] = useState<AutomaticResult>()
  const [sending, setSending] = useState(false)
  const [code, setCode] = useState('')
  const [retryDelay, setRetryDelay] = useState(0)
  const readStatus = useCallback(() => call('status', { language: lang }), [lang])

  const apply = useCallback((reply: ResponseData & { delay: number }) => {
    setState(Object.hasOwn(statusCopy, reply.state) ? reply.state : '')
    setRetryDelay(reply.delay)
    if (reply.address) setAddress(reply.address)
    if (reply.state === 'ready' && reply.consentText && reply.consentHash) setConsent({ text: reply.consentText, hash: reply.consentHash })
    if (reply.state === 'consent-changed') {
      setConsent(undefined)
      setConfirmed(false)
    }
    if (reply.state === 'prepared') setStage('prepared')
    if (reply.state === 'accepted' || reply.state === 'resume') setStage('task')
    if (reply.state === 'return-issued') setCode(reply.code ?? '')
    if (reply.state === 'denied') setResult(undefined)
    if (reply.pages && reply.insights && (
      reply.state === 'diagnosed' || reply.state === 'ai-unavailable' ||
      (reply.state === 'analyzing' && reply.buyerTasks?.length) || (reply.state === 'failed' && reply.analysisText)
    )) {
      setResult({ ...reply, state: reply.state, pages: reply.pages, insights: reply.insights })
    }
  }, [])

  useEffect(() => {
    let active = true
    void call().then(async reply => {
      if (!active) return
      apply(reply)
      if (reply.state === 'resume') {
        const status = await readStatus()
        if (active) apply(status)
      }
    })
    return () => { active = false }
  }, [apply, readStatus])

  useEffect(() => {
    if (!retryDelay) return
    const timer = window.setTimeout(() => setRetryDelay(0), retryDelay * 1000)
    return () => window.clearTimeout(timer)
  }, [retryDelay])

  useEffect(() => {
    if (!waiting.includes(state) || sending) return
    let active = true
    let timer: number
    function schedule() {
      timer = window.setTimeout(async () => {
        const reply = await readStatus()
        if (!active) return
        apply(reply)
        if (reply.state === state) schedule()
      }, 10_000)
    }
    schedule()
    return () => {
      active = false
      window.clearTimeout(timer)
    }
  }, [apply, readStatus, sending, state])

  async function run(action: string, fields?: Record<string, string | boolean>) {
    setSending(true)
    setCode('')
    if (action === 'status' || action === 'restore') setResult(undefined)
    try {
      const reply = await (action === 'status' ? readStatus() : call(action, fields))
      apply(reply)
      if (action === 'prepare' && reply.state === 'prepared') {
        const submitted = await call('submit')
        apply(submitted)
        if (submitted.state === 'resume') apply(await readStatus())
      } else if (reply.state === 'resume') {
        apply(await readStatus())
      }
    } finally {
      setSending(false)
    }
  }

  function restore(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const field = event.currentTarget.elements.namedItem('restore-secret') as HTMLInputElement
    const token = field.value.trim()
    field.value = ''
    if (token) void run('restore', { token })
  }

  return <div data-testid="vrae-preview-form" className="min-w-0 space-y-4">
    <fieldset disabled={sending || retryDelay > 0} className="min-w-0 space-y-4">
      {stage === 'input' && <form method="post" className="space-y-3" onSubmit={event => {
        event.preventDefault()
        if (consent && confirmed) void run('prepare', { address, language: lang, confirmed, consentHash: consent.hash })
      }}>
        <label className="block text-sm font-semibold">
          {zh ? '现有外贸网站网址' : 'Your current B2B website'}
          <input className={input} type="text" inputMode="url" autoComplete="off" spellCheck={false}
            placeholder="https://www.example.com" maxLength={500} required value={address} onChange={event => { setAddress(event.target.value); setConfirmed(false) }} />
        </label>
        {consent && <>
          <p id="vf-automatic-consent" className="text-sm leading-relaxed text-ink/80 [overflow-wrap:anywhere]">{zh
            ? '我们只查看该域名下您授权的公开网页，不登录后台、不修改网站，也不代您提交表单。AI 会分析必要的页面信息，给出改版建议，帮助海外买家更容易找到产品、看懂资料和发起询价。'
            : consent.text}</p>
          {zh && <details className="text-sm text-ink/75">
            <summary className="cursor-pointer font-semibold">数据如何使用</summary>
            <p className="mt-2 leading-relaxed [overflow-wrap:anywhere]">必要的页面信息会整理后交给阿里云百炼北京区域的 qwen4-max 分析。发送给模型的信息不包含网页源代码或个人身份信息。</p>
          </details>}
          <label className="flex min-h-11 items-start gap-2 text-sm">
            <input type="checkbox" aria-describedby="vf-automatic-consent" className="mt-0.5 size-5 shrink-0" required
              checked={confirmed} onChange={event => setConfirmed(event.target.checked)} />
            {zh ? '我有权授权检查此网站的公开页面，并同意上述诊断方式。'
              : 'I am authorized to permit this read-only check and agree to the data processing above.'}
          </label>
        </>}
        <button className={button + ' bg-lime'} disabled={!consent || !confirmed}>{zh ? '开始诊断' : 'Start diagnosis'}</button>
      </form>}
      {stage === 'prepared' && <button type="button" className={button + ' bg-lime'} onClick={() => void run('submit')}>
        {zh ? '继续提交原申请' : 'Submit the original request'}
      </button>}
      {stage === 'task' && <div className="flex flex-wrap gap-2">
        <button type="button" className={button} onClick={() => void run('status')}>{zh ? '查询进度' : 'Check task status'}</button>
        <button type="button" className={button} onClick={() => void run('return')}>{zh ? '获取任务恢复码' : 'Get recovery code'}</button>
      </div>}
      <details>
        <summary className="cursor-pointer text-sm font-semibold">{zh ? '使用恢复码返回任务' : 'Return using a recovery code'}</summary>
        <form method="post" className="mt-2 space-y-2" onSubmit={restore}>
          <label className="block text-sm font-semibold">
            {zh ? '一次性恢复码' : 'One-time recovery code'}
            <input className={input} id="restore-secret" type="password" maxLength={3072} autoComplete="off" required />
          </label>
          <button className={button}>{zh ? '恢复任务' : 'Restore task'}</button>
        </form>
      </details>
    </fieldset>
    <p role="status" aria-live="polite" data-testid="vrae-preview-status" className="text-sm leading-relaxed">
      {sending ? (zh ? '正在连接诊断服务…' : 'Connecting to the diagnostic service…') : statusCopy[state]?.[zh ? 0 : 1]}
    </p>
    {code && <label className="block text-sm font-semibold">
      {zh ? '复制恢复码' : 'Copy your recovery code'}
      <input className={input} readOnly value={code} onFocus={event => event.currentTarget.select()} />
    </label>}
    {result && <AutomaticDiagnosis data={result} address={address} />}
  </div>
}
