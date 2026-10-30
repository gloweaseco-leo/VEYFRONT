'use client'
import { useState, type FormEvent } from 'react'
import Link from 'next/link'
import { Check, Copy, ArrowLeft, Globe2, RefreshCw } from 'lucide-react'
import { PageShell } from '@/components/site/page-shell'
import { UrlAnalyzer } from '@/components/l2m/url-analyzer'
import { useLang } from '@/lib/i18n'

export function StartPage({ kind }: { kind: 'launch' | 'rebuild' }) {
  const { lang } = useLang()
  const zh = lang === 'zh'
  const launch = kind === 'launch'
  const [company, setCompany] = useState('')
  const [business, setBusiness] = useState('')
  const [markets, setMarkets] = useState('')
  const [pages, setPages] = useState('')
  const [brief, setBrief] = useState('')
  const [copied, setCopied] = useState(false)
  function prepare(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setCopied(false)
    setBrief([
      'VEYFRONT LAUNCH — LOCAL PROJECT BRIEF (NOT SUBMITTED)',
      'Company: ' + (company.trim() || '(to confirm)'),
      'Products / services: ' + (business.trim() || '(to confirm)'),
      'Target buyer markets: ' + (markets.trim() || '(to confirm)'),
      'Pages / buyer actions: ' + (pages.trim() || '(to confirm)'),
    ].join('\n'))
  }
  async function copyBrief() {
    if (!brief) return
    try { await navigator.clipboard.writeText(brief); setCopied(true) }
    catch { setCopied(false) }
  }
  const inputClass = 'min-h-12 w-full rounded-lg border border-ink/25 bg-white px-4 text-ink outline-offset-2 focus-visible:outline-2 focus-visible:outline-ink'
  return <PageShell>
    <section className="bg-ink text-ivory">
      <div className="vf-lines mx-auto max-w-[1440px] px-5 py-14 md:px-10 lg:py-20">
        <Link href="/services" className="mb-9 inline-flex min-h-10 items-center gap-2 text-sm text-ivory/80 hover:text-lime"><ArrowLeft className="size-4"/>{zh ? '返回服务介绍' : 'Back to services'}</Link>
        <p className="font-mono text-xs uppercase tracking-widest text-lime">VEYFRONT / {launch ? 'LAUNCH' : 'REBUILD'}</p>
        <h1 className="mt-4 max-w-4xl text-balance text-[38px] font-semibold leading-tight sm:text-[56px]">{launch ? (zh ? '从零开始，规划你的全球业务网站。' : 'Build a website for the business ahead.') : (zh ? '让你的现有网站发挥更大作用。' : 'Give your existing website a stronger future.')}</h1>
        <p className="mt-5 max-w-2xl text-ivory/75">{launch ? (zh ? '填写本地需求草稿，不会向 VEYFRONT 发送数据。本页尚未接入正式项目申请。' : 'Prepare a local project brief. Nothing is transmitted to VEYFRONT; live intake is not connected.') : (zh ? '输入公开网址，仅校验地址格式。不会抓取、诊断或修改你的网站。' : 'Check a public URL format only. This prototype does not crawl, diagnose or change your site.')}</p>
      </div>
    </section>
    <section className="mx-auto grid max-w-[1200px] gap-12 px-5 py-14 md:px-10 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,0.7fr)] lg:py-20">
      <div>
        {launch ? <form onSubmit={prepare} className="flex flex-col gap-5">
          <div><label htmlFor="launch-company" className="mb-2 block font-medium">{zh ? '企业名称' : 'Company'}</label><input id="launch-company" className={inputClass} value={company} onChange={e=>setCompany(e.target.value)} placeholder={zh ? '企业名称（可暂缺）' : 'Business name (optional)'}/></div>
          <div><label htmlFor="launch-business" className="mb-2 block font-medium">{zh ? '产品或服务' : 'Products or services'}</label><textarea id="launch-business" rows={3} className={inputClass+' py-3'} value={business} onChange={e=>setBusiness(e.target.value)} placeholder={zh ? '客户需要了解什么？' : 'What do buyers need to understand?'}/></div>
          <div><label htmlFor="launch-markets" className="mb-2 block font-medium">{zh ? '主要目标市场' : 'Target markets'}</label><input id="launch-markets" className={inputClass} value={markets} onChange={e=>setMarkets(e.target.value)} placeholder={zh ? '例如：欧盟 / 北美' : 'e.g., EU / North America'}/></div>
          <div><label htmlFor="launch-pages" className="mb-2 block font-medium">{zh ? '主要页面与客户行动' : 'Pages and buyer actions'}</label><textarea id="launch-pages" rows={3} className={inputClass+' py-3'} value={pages} onChange={e=>setPages(e.target.value)} placeholder={zh ? '例如：产品页、询盘、样册下载' : 'e.g., product pages, inquiries, downloads'}/></div>
          <button type="submit" className="inline-flex min-h-12 w-fit items-center gap-2 rounded-md bg-ink px-6 font-semibold text-ivory">{zh ? '生成本地需求草稿' : 'Create local brief'}<Globe2 className="size-4"/></button>
          {brief && <div role="region" aria-label={zh ? '本地需求草稿' : 'Local project brief'} className="rounded-lg border border-ink/20 bg-mist/40 p-5">
            <p className="mb-3 font-mono text-xs uppercase text-ink/60">{zh ? '仅保存在当前页面 · 未提交' : 'LOCAL PREVIEW ONLY · NOT SUBMITTED'}</p>
            <pre className="whitespace-pre-wrap break-words font-mono text-sm">{brief}</pre>
            <button type="button" onClick={copyBrief} className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-md border border-ink/30 px-4 font-semibold"><Copy className="size-4"/>{copied ? (zh ? '已复制' : 'Copied') : (zh ? '复制需求草稿' : 'Copy brief')}</button>
          </div>}
        </form> : <div className="space-y-5">
          <div className="flex items-center gap-3"><RefreshCw className="size-6"/><h2 className="text-xl font-semibold">{zh ? '从现有网址开始' : 'Start with your current URL'}</h2></div>
          <UrlAnalyzer tone="light" sampleReportHref="/#report" />
        </div>}
      </div>
      <aside className="h-fit rounded-lg border border-ink/15 bg-mist/35 p-6">
        <p className="font-mono text-xs uppercase tracking-wider text-ink/60">{zh ? '范围与真实性' : 'Scope and verification'}</p>
        <h2 className="mt-3 text-xl font-semibold">{zh ? '客户拥有选择权。' : 'You stay in control.'}</h2>
        <ul className="mt-5 space-y-4 text-sm leading-relaxed text-ink/75">
          <li><Check className="mr-2 inline size-4"/>{zh ? '不修改你现有的网站' : 'Existing site remains untouched'}</li>
          <li><Check className="mr-2 inline size-4"/>{zh ? '项目范围和费用须另行确认' : 'Scope and price require confirmation'}</li>
          <li><Check className="mr-2 inline size-4"/>{zh ? '托管是可选服务' : 'Hosting is optional'}</li>
          <li><Check className="mr-2 inline size-4"/>{zh ? '目前没有启用真实提交' : 'No live submission is enabled'}</li>
        </ul>
        <Link href={launch ? '/start/rebuild' : '/start/launch'} className="mt-7 inline-flex min-h-11 items-center underline underline-offset-4">{launch ? (zh ? '已有网站？选择 Rebuild' : 'Have a site? Try Rebuild') : (zh ? '需要新网站？选择 Launch' : 'Need a new site? Choose Launch')}</Link>
      </aside>
    </section>
  </PageShell>
}
