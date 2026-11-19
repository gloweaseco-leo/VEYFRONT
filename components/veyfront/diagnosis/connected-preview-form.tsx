'use client'

import { useEffect, useState, type FormEvent } from 'react'
import { useLang } from '@/lib/i18n'

const statusCopy: Record<string, readonly [string, string]> = {
  authorised: ['邀请已验证，请核对获准检查的网站。', 'Invitation verified. Check the approved website below.'],
  plan: ['网站范围已核对，请阅读并确认诊断授权。', 'The site scope is confirmed. Review and confirm your consent.'],
  accepted: ['诊断申请已受理。', 'The diagnostic request was accepted.'],
  running: ['正在检查获准的公开页面。', 'The permitted public pages are being checked.'],
  'awaiting-report': ['诊断已有待审核内容，报告尚未发布。', 'The diagnostic has findings pending review. The report is awaiting release.'],
  'awaiting-access': ['报告状态已更新，客户读取仍需单独授权。', 'The report status changed. Customer access requires separate authorization.'],
  failed: ['本次诊断未能完成。您仍可咨询网站改版。', 'This check could not be completed. You can still discuss a website redesign.'],
  expired: ['任务查看权限已到期。', 'Access to this task has expired.'],
  'access-ended': ['当前已无法查看此任务。', 'Access to this task has ended.'],
  restored: ['任务会话已恢复，请点击「查询进度」。', 'Task access restored. Select “Check task status”.'],
  'return-issued': ['恢复码有效期最多 5 分钟，仅可使用一次。请妥善保管。', 'This one-time recovery code expires within five minutes. Keep it private.'],
  'no-task': ['当前会话还没有可查看的任务。', 'This session has no task to view yet.'],
  denied: ['邀请、网站授权或会话无效，也可能已到期。请核对后重试。', 'The invitation, site authorization or session is unavailable or expired. Check your details and try again.'],
  'address-or-consent': ['请核对网址与获准网站一致，并确认诊断授权。', 'Check that the address matches the approved website and confirm your consent.'],
  conflict: ['当前申请与已存在的任务或版本冲突。请先查询任务状态。', 'The request conflicts with an existing task or version. Check your task status first.'],
  busy: ['诊断服务当前繁忙，请稍后重试。', 'The diagnostic service is busy. Try again shortly.'],
  closed: ['受邀联调尚未开放。', 'Invitation-only testing is not open.'],
  unavailable: ['连接暂不可用。若刚提交过，请保留原申请并重试。', 'The connection is temporarily unavailable. If you just submitted, retry the same request.'],
  invalid: ['请检查输入的信息。', 'Check the information you entered.'],
}

const button = 'min-h-11 rounded-md border border-ink/25 px-3 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50'
const input = 'mt-1 min-h-11 w-full rounded-md border border-ink/30 bg-white px-3 text-base focus-visible:outline-2 focus-visible:outline-offset-2'

export function ConnectedPreviewForm() {
  const { lang } = useLang()
  const zh = lang === 'zh'
  const [invited, setInvited] = useState(false)
  const [target, setTarget] = useState('')
  const [plan, setPlan] = useState<{ consentText: string; language: string } | null>(null)
  const [address, setAddress] = useState('')
  const [confirmed, setConfirmed] = useState(false)
  const [state, setState] = useState('')
  const [sending, setSending] = useState(false)
  const [code, setCode] = useState('')
  const [retryDelay, setRetryDelay] = useState(0)
  useEffect(() => {
    if (!retryDelay) return
    const timer = window.setTimeout(() => setRetryDelay(0), retryDelay * 1000)
    return () => window.clearTimeout(timer)
  }, [retryDelay])

  async function send(action: string, fields: Record<string, string | boolean> = {}) {
    setSending(true)
    setCode('')
    try {
      const reply = await fetch('/api/website-diagnosis/v1', {
        method: 'POST', credentials: 'same-origin', cache: 'no-store',
        headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action, ...fields }),
      })
      const result = await reply.json()
      if (reply.status === 429) {
        const retryAfter = Number(reply.headers.get('Retry-After'))
        setRetryDelay(Number.isInteger(retryAfter) && retryAfter >= 1 && retryAfter <= 900 ? retryAfter : 60)
      }
      setState(Object.hasOwn(statusCopy, result.state) ? result.state : 'unavailable')
      if (result.state === 'authorised' || result.state === 'no-task') setInvited(true)
      if (result.state === 'plan' && typeof result.consentText === 'string' && typeof result.address === 'string') {
        setPlan({ consentText: result.consentText, language: lang })
        setAddress(result.address)
        setConfirmed(false)
      }
      if (result.state === 'return-issued' && typeof result.code === 'string') setCode(result.code)
    } catch {
      setState('unavailable')
    } finally {
      setSending(false)
    }
  }

  function exchange(event: FormEvent<HTMLFormElement>, action: 'invite' | 'restore') {
    event.preventDefault()
    const field = event.currentTarget.elements.namedItem(action + '-secret') as HTMLInputElement
    const token = field.value.trim()
    if (!token || sending) return
    field.value = ''
    void send(action, { token })
  }

  return <div data-testid="vrae-preview-form" className="space-y-4">
    <p className="text-sm leading-relaxed text-ink/75">{zh ? '仅限已获邀请及网站访问授权的测试。请使用邀请材料提供的代码和网站编号。' : 'Testing is limited to approved invitations and sites. Use the code and site ID from your invitation.'}</p>
    <fieldset disabled={sending || retryDelay > 0} className="space-y-4">
      {!invited && <form method="post" className="space-y-2" onSubmit={event => exchange(event, 'invite')}>
        <label className="block text-sm font-semibold">
          {zh ? '一次性邀请代码' : 'One-time invitation code'}
          <input className={input} id="invite-secret" type="password" maxLength={512} autoComplete="off" required />
        </label>
        <button className={button}>{zh ? '验证邀请' : 'Verify invitation'}</button>
      </form>}
      {invited && <form className="space-y-2" onSubmit={event => { event.preventDefault(); void send('plan', { target, language: lang }) }}>
        <label className="block text-sm font-semibold">
          {zh ? '获准网站编号' : 'Approved site ID'}
          <input className={input} required value={target} onChange={event => { setTarget(event.target.value); setPlan(null) }} maxLength={128} autoComplete="off" spellCheck={false} />
        </label>
        <button className={button}>{zh ? '查看获准范围' : 'Check approved scope'}</button>
      </form>}
      {plan?.language === lang && <form className="space-y-3" onSubmit={event => { event.preventDefault(); void send('submit', { target, language: lang, address, confirmed }) }}>
        <label className="block text-sm font-semibold">
          {zh ? '现有外贸网站网址' : 'Current B2B website address'}
          <input className={input} required value={address} onChange={event => setAddress(event.target.value)} inputMode="url" maxLength={500} autoComplete="off" spellCheck={false} />
        </label>
        <p className="whitespace-pre-wrap [overflow-wrap:anywhere] text-sm leading-relaxed">{plan.consentText}</p>
        <label className="flex min-h-11 items-start gap-2 text-sm">
          <input type="checkbox" className="mt-0.5 size-5 shrink-0" required checked={confirmed} onChange={event => setConfirmed(event.target.checked)} />
          {zh ? '我确认按上述范围提出诊断申请。' : 'I confirm the request within the scope above.'}
        </label>
        <button className={button + ' bg-lime'}>{zh ? '提交授权诊断' : 'Submit authorized check'}</button>
      </form>}
      <div className="flex flex-wrap gap-2">
        <button type="button" className={button} onClick={() => void send('status')}>{zh ? '查询进度' : 'Check task status'}</button>
        <button type="button" className={button} onClick={() => void send('return')}>{zh ? '获取任务恢复码' : 'Get recovery code'}</button>
      </div>
      <details>
        <summary className="cursor-pointer text-sm font-semibold">{zh ? '使用恢复码返回任务' : 'Return using a recovery code'}</summary>
        <form method="post" className="mt-2 space-y-2" onSubmit={event => exchange(event, 'restore')}>
          <label className="block text-sm font-semibold">
            {zh ? '一次性恢复码' : 'One-time recovery code'}
            <input className={input} id="restore-secret" type="password" maxLength={3072} autoComplete="off" required />
          </label>
          <button className={button}>{zh ? '恢复任务' : 'Restore task'}</button>
        </form>
      </details>
    </fieldset>
    <div role="status" aria-live="polite" data-testid="vrae-preview-status" className="text-sm leading-relaxed">
      {sending ? (zh ? '正在连接诊断服务…' : 'Connecting to the diagnostic service…') : statusCopy[state]?.[zh ? 0 : 1]}
    </div>
    {code && <label className="block text-sm font-semibold">
      {zh ? '复制恢复码' : 'Copy your recovery code'}
      <input className={input} readOnly value={code} onFocus={event => event.currentTarget.select()} />
    </label>}
  </div>
}
