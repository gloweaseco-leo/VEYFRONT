'use client'

import { useRef, useState, type FormEvent } from 'react'
import { useLang } from '@/lib/i18n'

const input = 'mt-1 min-h-11 w-full rounded-md border border-ink/30 px-3'
const action = 'min-h-11 rounded-md border border-ink/25 px-4 py-2 text-sm font-semibold disabled:opacity-60'
type State = 'idle' | 'accepted' | 'running' | 'failed' | 'access-ended' | 'denied' | 'unavailable'

export function OfflineG1Form() {
  const { lang } = useLang()
  const zh = lang === 'zh'
  const address = useRef<HTMLInputElement>(null)
  const code = useRef<HTMLInputElement>(null)
  const permission = useRef<HTMLInputElement>(null)
  const consent = useRef<HTMLInputElement>(null)
  const inFlight = useRef(false)
  const [auditRef, setAuditRef] = useState<string | null>(null)
  const [state, setState] = useState<State>('idle')
  const [busy, setBusy] = useState(false)
  const labels: Record<State, string> = {
    idle: '',
    accepted: zh ? '离线任务已受理（202）。' : 'Offline task accepted (202).',
    running: zh ? '离线任务处理中。' : 'Offline task is processing.',
    failed: zh ? '离线任务执行失败。' : 'Offline task failed.',
    'access-ended': zh ? '任务访问已结束。' : 'Task access ended.',
    denied: zh ? '邀请、站点授权或诊断同意校验未通过。' : 'The invitation, site permission or diagnosis consent was rejected.',
    unavailable: zh ? '隔离测试服务暂不可用。' : 'The isolated test service is unavailable.',
  }

  async function request(kind: 'submit' | 'status') {
    if (inFlight.current) return
    inFlight.current = true
    setBusy(true)
    try {
      const body = kind === 'submit'
        ? { action: kind, code: code.current?.value, siteUrl: address.current?.value.trim(),
          permission: permission.current?.checked, consent: consent.current?.checked }
        : { action: kind, code: code.current?.value, auditRef }
      const response = await fetch('/api/website-diagnosis', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        cache: 'no-store', body: JSON.stringify(body),
      })
      if (response.status === 403) {
        setAuditRef(null)
        setState('denied')
        return
      }
      if (kind === 'submit') setAuditRef(null)
      if (!response.ok) {
        setState('unavailable')
        return
      }
      const result: { status?: unknown; auditRef?: unknown } = await response.json()
      if (kind === 'submit' && response.status === 202 && result.status === 'accepted' &&
          typeof result.auditRef === 'string' && /^aref-[0-9a-f]{32}$/.test(result.auditRef)) {
        setAuditRef(result.auditRef)
        setState('accepted')
      } else if (kind === 'status' && response.status === 200 &&
        (result.status === 'accepted' || result.status === 'running' || result.status === 'failed' || result.status === 'access-ended')) {
        setState(result.status)
      } else {
        setState('unavailable')
      }
    } catch {
      if (kind === 'submit') setAuditRef(null)
      setState('unavailable')
    } finally {
      inFlight.current = false
      setBusy(false)
    }
  }

  function resetTask() {
    setAuditRef(null)
    setState('idle')
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    void request('submit')
  }

  return (
    <form className="space-y-3" onSubmit={submit}>
      <p className="text-sm text-ink/75">{zh ? '此流程用于合成任务，报告发布关闭。' : 'This flow is for synthetic tasks. Publication is disabled.'}</p>
      <fieldset disabled={busy} className="space-y-3">
        <label className="block text-sm font-semibold">{zh ? '授权示例网址' : 'Authorized example URL'}
          <input ref={address} className={input} type="text" inputMode="url" required maxLength={500} autoComplete="off" onChange={resetTask} />
        </label>
        <label className="block text-sm font-semibold">{zh ? '离线邀请码' : 'Offline invitation code'}
          <input ref={code} className={input} type="password" required maxLength={128} autoComplete="off" onChange={resetTask} />
        </label>
        <label className="flex gap-2 text-sm"><input ref={permission} type="checkbox" required />{zh ? '我持有此站点范围的测试许可。' : 'I have permission for this test site scope.'}</label>
        <label className="flex gap-2 text-sm"><input ref={consent} type="checkbox" required />{zh ? '我同意提交这次离线诊断。' : 'I consent to this offline diagnostic.'}</label>
        <div className="flex flex-wrap gap-2">
          <button type="submit" className={action + ' bg-lime'}>{zh ? '提交离线任务' : 'Submit offline task'}</button>
          {auditRef && <button type="button" className={action} onClick={() => void request('status')}>{zh ? '刷新任务状态' : 'Refresh task status'}</button>}
        </div>
      </fieldset>
      <p role="status" aria-live="polite" className="text-sm">{labels[state]}</p>
    </form>
  )
}
