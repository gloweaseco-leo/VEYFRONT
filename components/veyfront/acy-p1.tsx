'use client'

import { useEffect, useState, type FormEvent } from 'react'
import Link from 'next/link'
import { ArrowRight, ArrowLeft, CheckCircle2, CircleAlert, Copy, Mail, MessageCircle, RefreshCw, ShieldCheck } from 'lucide-react'
import { useLang } from '@/lib/i18n'

type Service = 'launch' | 'rebuild'
type Channel = 'email' | 'wechat' | 'feishu'
type Journey = {
  id: string; reference: string; service: Service; status: 'needs_completion' | 'qualified' | 'human_review'
  expiresAt: string; channel: Channel
  brief: { company: string; website: string; markets: string; desiredAction: string; description: string }
  nextQuestions: string[]; recentEvents: Array<{ type: string; at: string }>
}
const field = 'w-full min-h-12 rounded-lg border border-ink/25 bg-white px-4 text-ink focus-visible:outline-2 focus-visible:outline-ink'
const callout = 'rounded-xl border border-ink/15 bg-mist/35 p-5'

export function AcyP1Experience() {
  const { lang } = useLang()
  const zh = lang === 'zh'
  const [service,setService] = useState<Service>('rebuild')
  const [name,setName] = useState('VEYFRONT QA')
  const [email,setEmail] = useState('qa@example.invalid')
  const [company,setCompany] = useState('QA DEMO COMPANY')
  const [website,setWebsite] = useState('https://example.com')
  const [markets,setMarkets] = useState('')
  const [desiredAction,setDesiredAction] = useState('')
  const [description,setDescription] = useState('Internal synthetic P1 preview journey. Not a real customer. Test automated next steps.')
  const [consent,setConsent] = useState(false)
  const [journey,setJourney] = useState<Journey | null>(null)
  const [accessToken,setAccessToken] = useState('')
  const [busy,setBusy] = useState(false)
  const [error,setError] = useState('')
  const [notice,setNotice] = useState('')
  const [resumeLink,setResumeLink] = useState('')

  async function request(body: Record<string,unknown>) {
    const result = await fetch('/api/acy/p1', { method: 'POST', headers: { 'Content-Type':'application/json' },
      body: JSON.stringify(body), cache: 'no-store' })
    const json = await result.json() as {ok:boolean; message?:string; journey?:Journey; accessToken?:string; notification?:string}
    if (!result.ok || !json.ok) throw new Error(json.message || 'Request failed')
    return json
  }

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const id = params.get('j')
    const token = params.get('k')
    if (!id || !token) return
    setBusy(true)
    request({ op:'read',id,accessToken:token })
      .then((r) => { if (r.journey) {setJourney(r.journey);setAccessToken(token); setResumeLink(window.location.href)} })
      .catch(() => setError('Preview link expired or unavailable. Start a new QA journey.'))
      .finally(() => setBusy(false))
  }, [])

  async function create(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setBusy(true);setError('')
    try {
      const data = await request({op:'create',service,name,email,company,website:service==='rebuild'?website:'',
        markets,desiredAction,description,consent,honeypot:''})
      if (!data.journey || !data.accessToken) throw new Error('The preview was not saved.')
      setJourney(data.journey);setAccessToken(data.accessToken)
      const u = new URL('/p1',window.location.href)
      u.searchParams.set('j',data.journey.id);u.searchParams.set('k',data.accessToken)
      setResumeLink(u.toString())
      window.history.replaceState(null,'',u.pathname+u.search)
      setNotice(data.notification === 'sent' ? 'QA confirmation email sent to hello@veyfront.com.' :
        data.notification === 'failed' ? 'Saved. QA email failed; access from this page remains available.' :
        'Saved. No email is sent for qa@example.invalid.')
    } catch(e) {setError(e instanceof Error ? e.message : 'Creation failed.')}
    finally {setBusy(false)}
  }

  async function update(action: Record<string,unknown>) {
    if (!journey || !accessToken) return
    setBusy(true);setError('');setNotice('')
    try {
      const data = await request({op:'update',id:journey.id,accessToken,actionId:crypto.randomUUID(),...action})
      if (data.journey) setJourney(data.journey)
    } catch(e) {setError(e instanceof Error ? e.message : 'Action not saved. Reload this journey.')}
    finally {setBusy(false)}
  }

  function copyResume() {
    if (!resumeLink) return
    navigator.clipboard.writeText(resumeLink).then(() => setNotice('Private preview link copied. Treat it as a password.'))
      .catch(() => setNotice('Copy unavailable. Use the browser address bar.'))
  }

  return (
    <div className="min-h-screen bg-ivory text-ink">
      <div className="bg-ink text-ivory">
        <div className="mx-auto max-w-[1160px] px-5 py-10 md:px-10 md:py-14">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Link href="/" className="inline-flex min-h-11 items-center gap-2 text-sm text-ivory/80"><ArrowLeft className="size-4" />VEYFRONT</Link>
            <span className="rounded-full border border-lime/50 px-3 py-1 font-mono text-xs text-lime">P1 · PREVIEW ONLY · QA DATA</span>
          </div>
          <p className="mt-9 font-mono text-xs uppercase tracking-[0.18em] text-lime">AUTONOMOUS CUSTOMER JOURNEY · P1</p>
          <h1 className="mt-4 max-w-3xl text-balance text-4xl font-semibold leading-tight md:text-6xl">{zh ? '让客户旅程自己向前推进。' : 'A customer journey that moves forward.'}</h1>
          <p className="mt-5 max-w-3xl text-ivory/75">{zh ? '真实预览：私有保存、自动补齐需求、可恢复进度、渠道偏好与异常升级。此页只接受内部测试资料。' : 'Functional preview: private persistence, deterministic follow-up, resumable progress, channel preference and escalation. Synthetic QA only.'}</p>
        </div>
      </div>
      <main className="mx-auto grid max-w-[1160px] gap-8 px-5 py-10 md:px-10 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,.8fr)] lg:py-16">
        <div className="space-y-6">
          {!journey ? (
            <form onSubmit={create} className="flex flex-col gap-5 rounded-2xl border border-ink/15 bg-white p-6 md:p-8">
              <h2 className="text-2xl font-semibold">{zh?'创建内部测试旅程':'Create a synthetic journey'}</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                <button type="button" onClick={()=>setService('rebuild')} aria-pressed={service==='rebuild'}
                  className={`min-h-14 rounded-lg border px-4 text-left font-semibold ${service==='rebuild'?'border-ink bg-ink text-ivory':'border-ink/20'}`}>Rebuild · {zh?'改造旧站':'Existing site'}</button>
                <button type="button" onClick={()=>setService('launch')} aria-pressed={service==='launch'}
                  className={`min-h-14 rounded-lg border px-4 text-left font-semibold ${service==='launch'?'border-ink bg-ink text-ivory':'border-ink/20'}`}>Launch · {zh?'建立新站':'New site'}</button>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="flex flex-col gap-2 text-sm font-medium">{zh?'测试姓名':'QA name'}<input className={field} required minLength={2} maxLength={100} value={name} onChange={e=>setName(e.target.value)}/></label>
                <label className="flex flex-col gap-2 text-sm font-medium">{zh?'测试邮箱':'QA email'}<select className={field} value={email} onChange={e=>setEmail(e.target.value)}><option value="qa@example.invalid">qa@example.invalid (no email)</option><option value="hello@veyfront.com">hello@veyfront.com (QA email)</option></select></label>
              </div>
              <label className="flex flex-col gap-2 text-sm font-medium">{zh?'测试企业':'QA company'}<input className={field} value={company} maxLength={160} onChange={e=>setCompany(e.target.value)}/></label>
              {service==='rebuild' && <label className="flex flex-col gap-2 text-sm font-medium">{zh?'现有网站地址':'Current website'}<input className={field} required type="url" maxLength={500} value={website} onChange={e=>setWebsite(e.target.value)}/></label>}
              <label className="flex flex-col gap-2 text-sm font-medium">{zh?'目标市场（留空体验自动追问）':'Target markets (leave blank to test follow-up)'}<input className={field} maxLength={240} value={markets} onChange={e=>setMarkets(e.target.value)}/></label>
              <label className="flex flex-col gap-2 text-sm font-medium">{zh?'希望客户采取的行动（留空体验追问）':'Desired buyer action (leave blank to test follow-up)'}<input className={field} maxLength={240} value={desiredAction} onChange={e=>setDesiredAction(e.target.value)}/></label>
              <label className="flex flex-col gap-2 text-sm font-medium">{zh?'模拟项目背景':'Synthetic project background'}<textarea required minLength={20} maxLength={2000} rows={3} className={field+' py-3'} value={description} onChange={e=>setDescription(e.target.value)}/></label>
              <label className="flex items-start gap-3 text-sm"><input className="mt-1 size-4" required type="checkbox" checked={consent} onChange={e=>setConsent(e.target.checked)}/><span>{zh?'我确认只使用虚构测试资料，并同意本次预览保存。':'I confirm I am using only synthetic test data and consent to preview storage.'}</span></label>
              <button disabled={busy} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-ink px-5 font-semibold text-ivory disabled:opacity-60">{busy?'Saving…':'Create P1 journey'}<ArrowRight className="size-4"/></button>
            </form>
          ) : (
            <div className="space-y-5">
              <div className={callout}>
                <div className="flex items-center gap-2"><CheckCircle2 className="size-6 text-green-700"/><h2 className="text-2xl font-semibold">{journey.reference}</h2></div>
                <p className="mt-2 text-sm text-ink/70">Private QA journey saved. {journey.service.toUpperCase()} · {journey.brief.company||'Company to confirm'}</p>
                <p className="mt-3 font-mono text-xs uppercase text-ink/60">{journey.status.replaceAll('_',' ')} · Valid until {new Date(journey.expiresAt).toLocaleString()}</p>
                <button onClick={copyResume} type="button" className="mt-4 inline-flex min-h-11 items-center gap-2 font-semibold underline underline-offset-4"><Copy className="size-4"/>Copy private QA resume link</button>
              </div>
              {journey.status === 'needs_completion' && (
                <form className="flex flex-col gap-4 rounded-2xl border border-ink/20 bg-white p-6" onSubmit={e=>{e.preventDefault();void update({type:'complete_brief',markets,desiredAction})}}>
                  <h3 className="text-xl font-semibold">AI-ready structured follow-up · rules-based P1</h3>
                  <p className="text-sm text-ink/70">The system identifies missing facts and requests them without a human operator or fabricated AI claims.</p>
                  {journey.nextQuestions.includes('markets') && <label className="flex flex-col gap-2 text-sm font-medium">Target buyer markets<input required minLength={3} className={field} value={markets} onChange={e=>setMarkets(e.target.value)} placeholder="EU, North America, etc."/></label>}
                  {journey.nextQuestions.includes('desiredAction') && <label className="flex flex-col gap-2 text-sm font-medium">Desired buyer action<input required minLength={3} className={field} value={desiredAction} onChange={e=>setDesiredAction(e.target.value)} placeholder="Request quote, book consultation…"/></label>}
                  <button disabled={busy} className="min-h-12 rounded-lg bg-ink px-5 font-semibold text-ivory disabled:opacity-60">Confirm missing information</button>
                </form>
              )}
              {journey.status === 'qualified' && <div className={callout}><h3 className="text-xl font-semibold">Requirements completed</h3><p className="mt-2 text-sm text-ink/70">P1 automatically reached the qualified intake state. Real diagnosis, proposal and paid checkout belong to P2/P3; no project or price has been approved.</p></div>}
              {journey.status === 'human_review' && <div className={callout}><h3 className="text-xl font-semibold">Exception: human review requested</h3><p className="mt-2 text-sm text-ink/70">This state is durably saved. No response-time promise or automatic external message is made.</p></div>}
              <div className="rounded-2xl border border-ink/15 bg-white p-6">
                <h3 className="text-xl font-semibold">Preferred communication channel</h3>
                <p className="mt-2 text-sm text-ink/60">This previews preference capture only. WeChat and Feishu are not connected or authorized yet.</p>
                <div className="mt-4 grid gap-2 sm:grid-cols-3">
                  {(['email','wechat','feishu'] as Channel[]).map(ch => <button key={ch} type="button" disabled={busy} onClick={()=>void update({type:'choose_channel',channel:ch})}
                    className={`min-h-12 rounded-md border px-4 text-sm font-semibold ${journey.channel===ch?'border-ink bg-ink text-ivory':'border-ink/25'}`}>{ch === 'email' ? 'Email' : ch==='wechat'?'WeChat':'Feishu'}</button>)}
                </div>
              </div>
              {journey.status!=='human_review' && <button disabled={busy} type="button" onClick={()=>void update({type:'request_human'})} className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold underline underline-offset-4">Request a human exception review <ArrowRight className="size-4"/></button>}
              <div className={callout}><h3 className="font-semibold">Durable journey event trail</h3><ul className="mt-3 space-y-2 text-xs">{journey.recentEvents.map((e,i)=><li key={i} className="flex justify-between gap-3 border-t border-ink/10 pt-2"><span>{e.type.replaceAll('_',' ')}</span><time className="text-ink/60">{new Date(e.at).toLocaleString()}</time></li>)}</ul></div>
            </div>
          )}
          {error && <p role="alert" className="flex items-start gap-2 rounded-lg border border-red-300 bg-red-50 p-4 text-sm text-red-800"><CircleAlert className="size-5 shrink-0"/>{error}</p>}
          {notice && <p role="status" className="rounded-lg border border-ink/15 bg-mist p-3 text-sm">{notice}</p>}
        </div>
        <aside className="space-y-5">
          <div className={callout}>
            <div className="flex items-center gap-2"><ShieldCheck className="size-5"/><h3 className="font-semibold">Preview safety</h3></div>
            <ul className="mt-4 space-y-3 text-sm text-ink/75"><li>Preview branch only; production APIs unchanged.</li><li>Private Blob namespace: acy-preview/p1/.</li><li>Only synthetic QA email addresses accepted.</li><li>Continuation requires an expiring secret, not a reference number.</li><li>Server-side actions use concurrency checks and idempotency keys.</li></ul>
          </div>
          <div className={callout}><div className="flex items-center gap-2"><RefreshCw className="size-5"/><h3 className="font-semibold">Automation boundaries</h3></div>
            <p className="mt-3 text-sm text-ink/75">P1 implements automated rules-based qualification and next steps. AI site scanning, pricing and L2M generation are deliberately not enabled in this preview.</p>
            <div className="mt-4 flex gap-2"><Mail className="size-4 text-ink/60"/><MessageCircle className="size-4 text-ink/60"/></div>
            <p className="mt-2 text-xs text-ink/60">QA email is optional; WeChat / Feishu are preferences only.</p>
          </div>
        </aside>
      </main>
    </div>
  )
}
