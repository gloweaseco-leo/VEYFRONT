'use client'
import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, CheckCircle2, CircleAlert, FileSearch, ShieldCheck } from 'lucide-react'
import type { L2MP2Assessment } from '@/lib/l2m-p2a'
import { useLang } from '@/lib/i18n'
export function AcyP2Preview() {
  const {lang}=useLang()
  const zh=lang==='zh'
  const [data,setData]=useState<L2MP2Assessment|null>(null)
  const [error,setError]=useState('')
  const [busy,setBusy]=useState(false)
  async function run() {
    setBusy(true);setError('')
    try {
      const r=await fetch('/api/acy/p2a',{method:'POST',headers:{'Content-Type':'application/json'},
        body:JSON.stringify({snapshot:'qa-alt-treesite'}),cache:'no-store'})
      const body=await r.json() as {ok:boolean;message?:string;assessment?:L2MP2Assessment}
      if(!r.ok||!body.ok||!body.assessment)throw new Error(body.message||'L2M returned no assessment.')
      setData(body.assessment)
    }catch(e){setError(e instanceof Error?e.message:'Preview failed.')}
    finally{setBusy(false)}
  }
  return <main className="min-h-screen bg-ivory text-ink">
    <section className="bg-ink text-ivory">
      <div className="mx-auto max-w-[1100px] px-5 py-12 md:px-10 md:py-20">
        <Link className="inline-flex min-h-11 items-center gap-2 text-sm text-ivory/75" href="/"><ArrowLeft className="size-4"/>VEYFRONT</Link>
        <p className="mt-8 font-mono text-xs tracking-widest text-lime">P2-A · L2M SERVICE BRIDGE · PREVIEW ONLY</p>
        <h1 className="mt-4 max-w-3xl text-balance text-4xl font-semibold md:text-6xl">
          {zh?'一条真实证据链，从 L2M 到 VEYFRONT。':'Evidence, delivered from L2M to VEYFRONT.'}
        </h1>
        <p className="mt-5 max-w-2xl text-ivory/70">
          {zh?'这是两个独立服务之间的集成验收。当前仅扫描预先授权的合成网站快照，不访问客户网站、不调用 AI、不生成或报价。':'A cross-service integration preview using a pre-approved synthetic website snapshot. No live client website, AI generation or pricing.'}
        </p>
      </div>
    </section>
    <div className="mx-auto max-w-[1100px] px-5 py-10 md:px-10 md:py-16">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,.8fr)]">
        <div className="space-y-6">
          <section className="rounded-xl border border-ink/15 bg-white p-6 md:p-8">
            <h2 className="text-2xl font-semibold">{zh?'受控网站快照':'Approved QA website snapshot'}</h2>
            <p className="mt-2 text-sm text-ink/70">qa-alt-treesite · 3 local HTML pages · L2M local_ingest</p>
            <button onClick={()=>void run()} disabled={busy} className="mt-6 inline-flex min-h-12 items-center gap-2 rounded-lg bg-ink px-6 font-semibold text-ivory disabled:opacity-60">
              <FileSearch className="size-4"/>{busy?'Loading…':zh?'从 L2M 服务获取真实观察报告':'Run L2M assessment contract'}<ArrowRight className="size-4"/>
            </button>
            {error&&<p role="alert" className="mt-5 flex items-center gap-2 rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-800"><CircleAlert className="size-4"/>{error}</p>}
          </section>
          {data&&<section aria-live="polite" className="space-y-5">
            <div className="rounded-xl border border-ink/15 bg-mist/40 p-6">
              <div className="flex items-center gap-2"><CheckCircle2 className="size-5 text-green-700"/><h2 className="text-xl font-semibold">L2M assessment received</h2></div>
              <p className="mt-3 font-mono text-xs text-ink/75">{data.assessment_id}</p>
              <p className="mt-2 text-sm text-ink/65">Version: {data.contract_version} · {data.source.pages.length} pages · {data.findings.length} bounded findings</p>
            </div>
            {data.source.pages.map(p=><div key={p.route} className="rounded-xl border border-ink/15 bg-white p-6">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <h3 className="font-semibold">{p.route}</h3>
                <span className="font-mono text-xs text-ink/55">SHA256: {p.sha256.slice(0,16)}…</span>
              </div>
              <p className="mt-3 text-sm"><b>Title:</b> {p.title_observed||'Not observed'}</p>
              <p className="mt-2 text-sm"><b>Heading:</b> {p.heading_observed||'Not observed'}</p>
              <p className="mt-2 text-sm text-ink/60">HTML forms observed: {p.form_count_observed}</p>
            </div>)}
            <div className="rounded-xl border border-ink/15 bg-white p-6">
              <h3 className="text-xl font-semibold">Bounded findings</h3>
              {data.findings.length===0?<p className="mt-3 text-sm text-ink/70">No findings from the narrow deterministic rules. This does not mean the website is commercially effective.</p>:
                <div className="mt-4 space-y-4">{data.findings.map(f=><div key={f.route+f.code} className="border-t border-ink/10 pt-4">
                  <p className="font-semibold">{f.code}</p><p className="mt-2 text-sm">{f.observation}</p>
                  <p className="mt-2 text-sm text-ink/65">Check: {f.suggested_next_step}</p></div>)}</div>}
            </div>
          </section>}
        </div>
        <aside className="space-y-5">
          <div className="rounded-xl border border-ink/15 bg-mist/40 p-6">
            <div className="flex items-center gap-2"><ShieldCheck className="size-5"/><h2 className="font-semibold">Safety and scope</h2></div>
            <p className="mt-4 text-sm text-ink/70">L2M owns source observation. VEYFRONT owns presentation. The contract rejects unverified facts and AI delivery claims.</p>
            <div className="mt-4 space-y-2 text-xs text-ink/65">
              <p>Source: authorized synthetic HTML snapshot</p><p>Model calls: 0</p><p>Generation calls: 0</p>
              <p>Client business facts: not verified</p><p>Commercial score: not provided</p>
            </div>
          </div>
          <div className="rounded-xl border border-ink/15 p-6">
            <h2 className="font-semibold">Next capability</h2>
            <p className="mt-2 text-sm text-ink/70">Customer-authorized public-URL ingestion, business-context evidence, true Planner validation and a bounded AI report are separate gates.</p>
            <Link href="/p1" className="mt-4 inline-flex min-h-11 items-center gap-2 underline underline-offset-4">{zh?'查看 P1（另一受控预览分支）':'P1 is on a separate preview branch'}<ArrowRight className="size-4"/></Link>
          </div>
        </aside>
      </div>
    </div>
  </main>
}
