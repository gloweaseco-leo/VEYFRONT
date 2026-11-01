'use client'
import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, FileSearch, CircleAlert, ShieldCheck } from 'lucide-react'
import { useLang } from '@/lib/i18n'
import type { LiveHomeAssessment } from '@/lib/l2m-p2a2'

export function AcyLivePreview() {
  const { lang } = useLang()
  const zh = lang === 'zh'
  const [consent, setConsent] = useState(false)
  const [data, setData] = useState<LiveHomeAssessment | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  async function run() {
    if (!consent) return
    setBusy(true); setError(''); setData(null)
    try {
      const response = await fetch('/api/acy/p2a2', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-acy-preview-request':'p2a2' },
        body: JSON.stringify({ url:'https://veyfront.com/', authorization_confirmed:true }),
        cache: 'no-store',
      })
      const body = await response.json() as {ok:boolean;message?:string;assessment?:LiveHomeAssessment}
      if (!response.ok || !body.ok || !body.assessment) throw new Error(body.message || 'Assessment unavailable.')
      setData(body.assessment)
    } catch(e) {
      setError(e instanceof Error ? e.message : 'Unable to collect.')
    } finally { setBusy(false) }
  }
  return <main className="min-h-screen bg-ivory text-ink">
    <section className="bg-ink text-ivory">
      <div className="mx-auto max-w-[1000px] px-5 py-12 md:px-10 md:py-20">
        <Link href="/" className="inline-flex min-h-11 items-center gap-2 text-sm text-ivory/75"><ArrowLeft className="size-4"/>VEYFRONT</Link>
        <p className="mt-8 font-mono text-xs tracking-widest text-lime">P2-A2 · BOUNDED LIVE HOMEPAGE · PRIVATE PREVIEW</p>
        <h1 className="mt-4 max-w-3xl text-4xl font-semibold md:text-6xl">
          {zh ? '从受控快照走向真实网页观察。' : 'A real homepage. Evidence, not claims.'}
        </h1>
        <p className="mt-5 max-w-2xl text-ivory/70">
          {zh ? '仅用于安全验收：实际获取 VEYFRONT 官网首页 HTML，禁止跳转，不读取其他页面。不调用 AI、不评分、不报价、不生成网站。' :
            'A single allowlisted public homepage, fetched live for private engineering verification. No redirects, AI, scoring, quotes or generated sites.'}
        </p>
      </div>
    </section>
    <section className="mx-auto max-w-[1000px] space-y-6 px-5 py-10 md:px-10 md:py-16">
      <div className="rounded-xl border border-ink/15 bg-white p-6 md:p-8">
        <h2 className="text-2xl font-semibold">{zh ? '已批准的测试域名' : 'Approved test domain'}</h2>
        <p className="mt-2 font-mono text-sm">https://veyfront.com/</p>
        <label className="mt-6 flex items-start gap-3 text-sm">
          <input type="checkbox" checked={consent} onChange={e=>setConsent(e.target.checked)} className="mt-1 size-4" />
          <span>{zh ? '我确认有权对该公开网站首页进行本次受控读取，并理解这不是商业诊断。' :
            'I confirm authority to assess this public homepage and understand that this is not a commercial diagnosis.'}</span>
        </label>
        <button onClick={()=>void run()} disabled={!consent||busy}
          className="mt-6 inline-flex min-h-12 items-center gap-2 rounded-lg bg-ink px-6 font-semibold text-ivory disabled:opacity-50">
          <FileSearch className="size-4"/>{busy ? (zh?'正在读取…':'Reading…') : (zh?'执行真实首页观察':'Observe live homepage')}
        </button>
        {error && <p role="alert" className="mt-4 flex items-center gap-2 rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-800"><CircleAlert className="size-4"/>{error}</p>}
      </div>
      {data && <div aria-live="polite" className="space-y-5">
        <div className="rounded-xl border border-ink/15 bg-mist/40 p-6">
          <h2 className="text-xl font-semibold">{zh?'真实采集已返回证据':'Live evidence received'}</h2>
          <p className="mt-2 break-all font-mono text-xs">{data.assessment_id}</p>
          <p className="mt-2 text-sm">Source: {data.source.canonical_url} · {data.source.captured_at_utc}</p>
          <p className="mt-2 text-sm">Version: {data.contract_version} · {data.source.pages.length} page · {data.execution.model_calls} model calls</p>
        </div>
        {data.source.pages.map(page=><div key={page.sha256} className="rounded-xl border border-ink/15 bg-white p-6">
          <h3 className="font-semibold">{page.route}</h3>
          <p className="mt-2 text-sm">Title: {page.title_observed || 'Not observed'}</p>
          <p className="mt-2 text-sm">Heading: {page.heading_observed || 'Not observed'}</p>
          <p className="mt-2 break-all font-mono text-xs text-ink/60">SHA-256: {page.sha256}</p>
        </div>)}
        <div className="rounded-xl border border-ink/15 bg-white p-6">
          <h3 className="text-lg font-semibold">{zh?'有限观察结论':'Bounded findings'}</h3>
          {data.findings.length === 0 ? <p className="mt-3 text-sm">No deterministic issue observed. This does not establish commercial effectiveness.</p> :
            data.findings.map(f=><div key={f.code+f.route} className="mt-4 border-t border-ink/10 pt-4">
              <p className="font-semibold">{f.code}</p><p className="mt-2 text-sm">{f.observation}</p>
              <p className="mt-2 text-sm text-ink/65">Review: {f.suggested_next_step}</p>
            </div>)}
        </div>
      </div>}
      <div className="flex items-start gap-3 rounded-xl border border-ink/15 p-6 text-sm text-ink/70">
        <ShieldCheck className="mt-0.5 size-5 shrink-0"/>
        <p>{zh ? '安全边界：部署预览保护、白名单、DNS/IP 校验、robots、HTML 体积限制、无重定向。网站所有内容均为未核实观察，不代表可交付或可报价。' :
          'Private preview, domain allowlist, DNS/IP checks, robots, HTML size caps and no redirects. All website content remains unverified observation.'}</p>
      </div>
    </section>
  </main>
}
