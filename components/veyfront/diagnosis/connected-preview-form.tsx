'use client'

import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { ArrowRight } from 'lucide-react'
import Link from '@/components/l2m/localized-link'
import { diagnosisReportPath } from '@/lib/diagnosis-preview'
import { useLang } from '@/lib/i18n'
import { callDiagnosis as call, isReportReady, type DiagnosisReply } from './connected-preview-api'

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

const button = 'min-h-11 rounded-md border border-ink/25 px-3 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50'
const input = 'mt-1 min-h-11 w-full rounded-md border border-ink/30 bg-white px-3 text-base focus-visible:outline-2 focus-visible:outline-offset-2'
const waiting = ['accepted', 'running', 'analyzing']
export function ConnectedPreviewForm() {
  const { lang } = useLang()
  const zh = lang === 'zh'
  const [address, setAddress] = useState('')
  const [consent, setConsent] = useState<{ text: string; hash: string }>()
  const [confirmed, setConfirmed] = useState(false)
  const [stage, setStage] = useState<'input' | 'prepared' | 'task'>('input')
  const [state, setState] = useState('')
  const [reportAvailable, setReportAvailable] = useState(false)
  const [sending, setSending] = useState(false)
  const [code, setCode] = useState('')
  const [retryDelay, setRetryDelay] = useState(0)
  const readStatus = useCallback(() => call('status', { language: lang }), [lang])

  const apply = useCallback((reply: DiagnosisReply) => {
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
    if (reply.state !== 'return-issued') setReportAvailable(isReportReady(reply))
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
    if (action === 'status' || action === 'restore') setReportAvailable(false)
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
    {reportAvailable && <Link href={diagnosisReportPath} prefetch={false}
      className={button + ' inline-flex items-center gap-2 bg-lime'}>
      {zh ? '查看诊断报告' : 'Open diagnosis report'}<ArrowRight className="size-4" aria-hidden="true" />
    </Link>}
  </div>
}
