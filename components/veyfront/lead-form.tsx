'use client'

import Link from '@/components/l2m/localized-link'
import { useEffect, useState, type FormEvent } from 'react'
import { CheckCircle2, AlertCircle, LoaderCircle, ArrowUpRight } from 'lucide-react'
import { useLang } from '@/lib/i18n'
import { checkUrl } from '@/lib/url'
import { validateContactDetails, type ContactPreference } from '@/lib/contact-validation'
import { ACQUISITION_SESSION_KEY, safeAcquisitionChannel } from '@/lib/acquisition-channel'

export type Service = 'launch' | 'rebuild' | 'general' | 'privacy'

export function LeadForm({ service, defaultWebsite = '' }: { service: Service; defaultWebsite?: string }) {
  const { lang } = useLang()
  const zh = lang === 'zh'
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [wechat, setWechat] = useState('')
  const [preferredContact, setPreferredContact] = useState<ContactPreference>('any')
  const [company, setCompany] = useState('')
  const [website, setWebsite] = useState(defaultWebsite)
  const [markets, setMarkets] = useState('')
  const [details, setDetails] = useState('')
  const [honeypot, setHoneypot] = useState('')
  const [consent, setConsent] = useState(false)
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle')
  const [reference, setReference] = useState('')
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
    const contactError = validateContactDetails({ email: email.trim(), phone: phone.trim(), wechat: wechat.trim(), preferredContact }, service === 'privacy')
    if (contactError) {
      setError(zh ? (service === 'privacy' && !email.trim() ? '隐私申请需要提供邮箱，以便核对申请。' : '请至少填写一种有效联系方式；如选择了优先联系方式，也请填写对应账号或号码。微信号请填写微信 ID，而非昵称。') : contactError)
      setStatus('error')
      return
    }
    setError('')
    // Never transmit raw referrer URLs, search queries or cookies; privacy requests are excluded.
    let acquisitionChannel: string | undefined
    if (service !== 'privacy') {
      try { acquisitionChannel = safeAcquisitionChannel(sessionStorage.getItem(ACQUISITION_SESSION_KEY)) }
      catch { acquisitionChannel = 'unknown' }
    }
    setStatus('sending')
    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store',
        body: JSON.stringify({ service, name, email, phone: service === 'privacy' ? '' : phone, wechat: service === 'privacy' ? '' : wechat, preferredContact: service === 'privacy' ? 'email' : preferredContact, company, website, markets, details, consent, honeypot, lang, acquisitionChannel }),
      })
      const data = await response.json() as { ok?: boolean; reference?: string; message?: string }
      if (!response.ok || !data.ok || !data.reference) throw new Error(data.message || 'Request could not be saved')
      setReference(data.reference)
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
        <h2 className="text-2xl font-semibold">{service === 'privacy' ? (zh ? '隐私请求已收到' : 'Privacy request received') : (zh ? '提交成功，我们已收到您的建站咨询' : 'Your website inquiry has been received')}</h2>
        <p className="mt-3 text-ink/75">{service === 'privacy' ? (zh ? '请保存下方申请编号，以便后续核对。我们将在核实后处理您的请求。' : 'Keep the reference for follow-up. We will verify your request before handling it.') : (zh ? '请保存下方咨询编号。我们将通过您填写的联系方式沟通下一步；补充资料也可发送至 hello@veyfront.com。提交不等于签约或付款。' : 'Keep your inquiry reference. You can add details by emailing hello@veyfront.com. An inquiry is not a purchase or contract.')}</p>
        <p className="mt-5 font-mono text-xl font-semibold">{reference}</p>
        <button type="button" onClick={() => { setStatus('idle'); setReference('') }} className="mt-6 inline-flex min-h-11 items-center underline underline-offset-4">{zh ? '提交另一个需求' : 'Submit another request'}</button>
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
        <label htmlFor="vf-email" className="mb-2 block text-sm font-medium">{service === 'privacy' ? (zh ? '核验邮箱 *' : 'Verification email *') : (zh ? '电子邮箱（选填）' : 'Email (optional)')}</label>
        <input id="vf-email" name="email" type="email" autoComplete="email" required={service === 'privacy'} maxLength={254} className={field} value={email} onChange={e => setEmail(e.target.value)}/>
      </div>
    </div>
    {service !== 'privacy' && <fieldset className="rounded-lg border border-ink/15 bg-mist/30 p-4">
      <legend className="px-2 text-sm font-semibold">{zh ? '希望我们如何联系您？' : 'How should we contact you?'}</legend>
      <p className="mb-3 text-xs text-ink/70">{zh ? '微信号、手机号、邮箱至少填写一种；可同时填写多种。' : 'Provide at least one: WeChat ID, phone, or email.'}</p>
      <div className="flex flex-wrap gap-x-5 gap-y-2">
        {([
          ['any', zh ? '任意方式' : 'Any method'],
          ['wechat', zh ? '微信优先' : 'WeChat'],
          ['phone', zh ? '电话优先' : 'Phone'],
          ['email', zh ? '邮件优先' : 'Email'],
        ] as [ContactPreference,string][]).map(([value,label]) =>
          <label key={value} className="flex min-h-9 cursor-pointer items-center gap-2 text-sm">
            <input type="radio" name="preferredContact" checked={preferredContact === value} onChange={() => setPreferredContact(value)} className="size-4 accent-[#17262D]"/>
            {label}
          </label>)}
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div><label htmlFor="vf-wechat" className="mb-2 block text-sm font-medium">{zh ? '微信号（非昵称）' : 'WeChat ID'}</label>
          <input id="vf-wechat" name="wechat" autoComplete="off" maxLength={40} className={field} value={wechat} onChange={e=>setWechat(e.target.value)} placeholder="WeChat ID"/></div>
        <div><label htmlFor="vf-phone" className="mb-2 block text-sm font-medium">{zh ? '手机 / 联系电话' : 'Phone number'}</label>
          <input id="vf-phone" name="phone" type="tel" autoComplete="tel" maxLength={32} className={field} value={phone} onChange={e=>setPhone(e.target.value)} placeholder="+86"/></div>
      </div>
      <p className="mt-3 text-xs text-ink/65">{zh ? '留下微信号不代表已经添加好友。我们仅在处理本次咨询时使用。' : 'Providing a WeChat ID does not mean a connection has been established.'}</p>
    </fieldset>}
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
      <label htmlFor="vf-details" className="mb-2 block text-sm font-medium">{service === 'privacy' ? (zh ? '需要查阅、更正或删除什么信息？ *' : 'Your data request *') : (zh ? '项目需求与目标 *' : 'Project brief and goals *')}</label>
      <textarea id="vf-details" name="details" required minLength={20} maxLength={3000} rows={5} className={field + ' py-3'} placeholder={zh ? (service === 'privacy' ? '请说明您希望查阅、更正或删除的资料（至少20字），请勿填写密码或身份证件。' : '例如：主营产品、目标国家、希望展示的内容及需要解决的问题（至少20字）。') : 'Describe your goals or request in at least 20 characters.'} value={details} onChange={e => setDetails(e.target.value)}/>
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
      {status === 'sending' ? (zh ? '正在安全提交…' : 'Saving your request…') : (service === 'privacy' ? (zh ? '提交隐私请求' : 'Send privacy request') : (zh ? '提交建站咨询' : 'Send project inquiry'))}
    </button>
    <p className="text-xs leading-relaxed text-ink/65">{service === 'privacy' ? (zh ? '成功提交后会显示申请编号；如需补充信息，可以邮件联系 hello@veyfront.com。' : 'A reference will appear after successful submission. Email us to follow up.') : (zh ? '成功提交后会显示咨询编号。联系方式仅用于本次项目沟通；建设内容及价格以签约前书面确认为准。' : 'A reference is shown after secure storage. Sending an inquiry does not create a contract or quotation.')}</p>
  </form>
}
