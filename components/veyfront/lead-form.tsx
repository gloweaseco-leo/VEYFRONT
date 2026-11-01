'use client'

import Link from 'next/link'
import { useEffect, useRef, useState, type FormEvent } from 'react'
import { CheckCircle2, AlertCircle, LoaderCircle, ArrowUpRight } from 'lucide-react'
import { useLang } from '@/lib/i18n'
import { checkUrl } from '@/lib/url'

export type Service = 'launch' | 'rebuild' | 'general' | 'privacy'

export function LeadForm({ service, defaultWebsite = '' }: { service: Service; defaultWebsite?: string }) {
  const { lang } = useLang()
  const zh = lang === 'zh'
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [company, setCompany] = useState('')
  const [website, setWebsite] = useState(defaultWebsite)
  const [markets, setMarkets] = useState('')
  const [details, setDetails] = useState('')
  const [honeypot, setHoneypot] = useState('')
  const [consent, setConsent] = useState(false)
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle')
  const [reference, setReference] = useState('')
  const [resumeUrl,setResumeUrl] = useState('')
  const intakeKey=useRef<string|null>(null)
  const [error, setError] = useState('')

  useEffect(() => { if (defaultWebsite) setWebsite(defaultWebsite) }, [defaultWebsite])
  useEffect(() => {
    if (service !== 'rebuild') return
    try {
      const saved = sessionStorage.getItem('vf:rebuild-url')
      if (saved && checkUrl(saved).state === 'valid') setWebsite(saved)
      sessionStorage.removeItem('vf:rebuild-url')
    } catch { /* Session storage is optional; the form remains usable. */ }
  }, [service])


  const field = 'min-h-12 w-full rounded-md border border-ink/25 bg-white px-4 text-ink outline-offset-2 focus-visible:outline-2 focus-visible:outline-ink'
  const requiresWebsite = service === 'rebuild'

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (status === 'sending') return
    if (requiresWebsite && checkUrl(website).state !== 'valid') {
      setError(zh ? '请输入可访问的公开网站网址。' : 'Please provide a public website URL.')
      setStatus('error')
      return
    }
    setError('')
    if(!intakeKey.current)intakeKey.current=crypto.randomUUID()
    setStatus('sending')
    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-vf-intake-key':intakeKey.current||'','x-vf-preview-p0':'journey' },
        cache: 'no-store',
        body: JSON.stringify({ service, name, email, company, website, markets, details, consent, honeypot }),
      })
      const data = await response.json() as { ok?: boolean; reference?: string; message?: string; resumeUrl?:string }
      if (!response.ok || !data.ok || !data.reference) throw new Error(data.message || 'Request could not be saved')
      setReference(data.reference)
      setResumeUrl(data.resumeUrl||'')
      setStatus('success')
    } catch {
      setError(zh ? '提交未完成，需求未确认保存。请稍后重试。' : 'Submission failed; your request was not confirmed saved. Please try again.')
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <div role="status" aria-live="polite" className="rounded-xl border border-ink/20 bg-mist/40 p-7">
        <CheckCircle2 className="mb-4 size-8 text-ink" aria-hidden="true"/>
        <h2 className="text-2xl font-semibold">{zh ? '项目需求已收到' : 'Your request has been received'}</h2>
        <p className="mt-3 text-ink/75">{zh ? '你的需求已保存到 VEYFRONT 的私有受理系统。请保存受理编号，方便后续核对；这并不代表项目已被接受、报价或付款。' : 'Your request has been saved to VEYFRONT’s private intake. Keep the reference for follow-up. This is not a project acceptance, quotation or payment.'}</p>
        <p className="mt-5 font-mono text-xl font-semibold">{reference}</p>
        {resumeUrl && <div className="mt-5 rounded-md border border-ink/25 bg-white p-4 text-sm">
          <p className="font-semibold">{zh?'内部 Preview：资料补全与状态恢复':'Private Preview: complete and resume your brief'}</p>
          <p className="mt-2 text-ink/70">{zh?'此链接含限时访问凭证，请勿转发。测试不会产生正式客户订单或商业诊断。':'This short-lived link contains an access secret. Do not share it. No customer order or live commercial diagnosis is created.'}</p>
          <a className="mt-3 inline-flex min-h-11 items-center font-semibold underline underline-offset-2" href={resumeUrl}>{zh?'继续完善需求 →':'Continue your journey →'}</a>
        </div>}
        <button type="button" onClick={() => { setStatus('idle'); setReference('');setResumeUrl('');intakeKey.current=null }} className="mt-6 inline-flex min-h-11 items-center underline underline-offset-4">{zh ? '提交另一个需求' : 'Submit another request'}</button>
      </div>
    )
  }

  return <form onSubmit={submit} className="flex flex-col gap-5">
    <div className="grid gap-5 sm:grid-cols-2">
      <div>
        <label htmlFor="vf-name" className="mb-2 block text-sm font-medium">{zh ? '联系人姓名 *' : 'Your name *'}</label>
        <input id="vf-name" name="name" autoComplete="name" required minLength={2} maxLength={100} className={field} value={name} onChange={e => setName(e.target.value)}/>
      </div>
      <div>
        <label htmlFor="vf-email" className="mb-2 block text-sm font-medium">{zh ? '工作邮箱 *' : 'Work email *'}</label>
        <input id="vf-email" name="email" type="email" autoComplete="email" required maxLength={254} className={field} value={email} onChange={e => setEmail(e.target.value)}/>
      </div>
    </div>
    <div>
      <label htmlFor="vf-company" className="mb-2 block text-sm font-medium">{zh ? '公司名称（选填）' : 'Company (optional)'}</label>
      <input id="vf-company" name="company" autoComplete="organization" maxLength={160} className={field} value={company} onChange={e => setCompany(e.target.value)}/>
    </div>
    {(service === 'rebuild' || service === 'general') && <div>
      <label htmlFor="vf-website" className="mb-2 block text-sm font-medium">{zh ? '现有网站网址' : 'Current website URL'}{requiresWebsite ? ' *' : ''}</label>
      <input id="vf-website" type="url" name="website" placeholder="https://your-company.com" required={requiresWebsite} maxLength={500} className={field} value={website} onChange={e => setWebsite(e.target.value)}/>
      {requiresWebsite && <p className="mt-1 text-xs text-ink/65">{zh ? '仅记录网址，不会自动抓取或修改网站。' : 'Your URL is recorded only; no crawling or modification occurs.'}</p>}
    </div>}
    {service === 'launch' && <div>
      <label htmlFor="vf-markets" className="mb-2 block text-sm font-medium">{zh ? '目标市场（选填）' : 'Target markets (optional)'}</label>
      <input id="vf-markets" name="markets" placeholder={zh ? '例如：欧洲、北美' : 'e.g. Europe, North America'} maxLength={240} className={field} value={markets} onChange={e => setMarkets(e.target.value)}/>
    </div>}
    <div>
      <label htmlFor="vf-details" className="mb-2 block text-sm font-medium">{service === 'privacy' ? (zh ? '你的数据请求 *' : 'Your data request *') : (zh ? '项目需求与目标 *' : 'Project brief and goals *')}</label>
      <textarea id="vf-details" name="details" required minLength={20} maxLength={3000} rows={5} className={field + ' py-3'} placeholder={zh ? '请至少用20个字符描述需求、目标或希望解决的问题。' : 'Describe your goals or request in at least 20 characters.'} value={details} onChange={e => setDetails(e.target.value)}/>
    </div>
    {/* Accessible honeypot: never expose this field to keyboard or screen reader users. */}
    <div className="hidden" aria-hidden="true">
      <label htmlFor="vf-fax">Fax</label>
      <input id="vf-fax" type="text" tabIndex={-1} autoComplete="off" value={honeypot} onChange={e => setHoneypot(e.target.value)}/>
    </div>
    <label className="flex cursor-pointer items-start gap-3 text-sm leading-relaxed">
      <input type="checkbox" className="mt-1 size-4 shrink-0 accent-[#17262D]" required checked={consent} onChange={e => setConsent(e.target.checked)}/>
      <span>{zh ? '我同意 VEYFRONT 为处理本次需求而保存以上联系与项目资料，并已阅读' : 'I agree that VEYFRONT may store this contact and project information to respond to my request. I have read the'}{' '}<Link href="/privacy" target="_blank" rel="noopener noreferrer" className="font-semibold underline underline-offset-2">{zh ? '隐私说明' : 'Privacy Notice'}</Link>{zh ? '。' : '.'}</span>
    </label>
    {status === 'error' && <p role="alert" className="flex items-start gap-2 rounded-md border border-red-300 p-3 text-sm text-red-800"><AlertCircle className="mt-0.5 size-4 shrink-0"/>{error}</p>}
    <button disabled={status === 'sending'} type="submit" className="inline-flex min-h-12 w-fit items-center gap-2 rounded-md bg-ink px-6 font-semibold text-ivory disabled:opacity-65">
      {status === 'sending' ? <LoaderCircle className="size-4 animate-spin"/> : <ArrowUpRight className="size-4"/>}
      {status === 'sending' ? (zh ? '正在安全提交…' : 'Saving your request…') : (zh ? '提交项目需求' : 'Send project inquiry')}
    </button>
    <p className="text-xs leading-relaxed text-ink/65">{zh ? '提交后会返回受理编号。需求提交不构成合同或报价，VEYFRONT 不会自动修改你的网站。' : 'A reference is shown only after secure storage is confirmed. Sending an inquiry does not create a contract or quotation. We never modify your website automatically.'}</p>
  </form>
}
