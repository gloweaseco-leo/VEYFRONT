'use client'
import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, FileSearch, ShieldCheck, CircleAlert } from 'lucide-react'
import type { LiveHomeAssessment } from '@/lib/l2m-p2a2'
import type { GroundedPlan } from '@/lib/l2m-p2a3'
import { useLang } from '@/lib/i18n'

const labels:{[stage:string]:string}={
 discover:'01 / DISCOVER',understand:'02 / UNDERSTAND',trust:'03 / TRUST',convert:'04 / CONVERT'
}
export function AcyGroundedPlanPreview(){
 const {lang}=useLang(),zh=lang==='zh'
 const [consent,setConsent]=useState(false)
 const [busy,setBusy]=useState(false)
 const [error,setError]=useState('')
 const [outcome,setOutcome]=useState<{assessment:LiveHomeAssessment;plan:GroundedPlan}|null>(null)
 async function run(){
  if(!consent||busy)return
  setBusy(true);setError('');setOutcome(null)
  try{
   const response=await fetch('/api/acy/p2a3',{
    method:'POST',headers:{'Content-Type':'application/json','x-acy-preview-request':'p2a3'},
    body:JSON.stringify({url:'https://veyfront.com/',authorization_confirmed:true}),
    cache:'no-store',
   })
   const result=await response.json() as {
    ok:boolean;message?:string;assessment?:LiveHomeAssessment;plan?:GroundedPlan
   }
   if(!response.ok||!result.ok||!result.assessment||!result.plan)
     throw new Error(result.message||'The bounded plan is not available.')
   setOutcome({assessment:result.assessment,plan:result.plan})
  }catch(e){setError(e instanceof Error?e.message:'Unable to create preview plan.')}
  finally{setBusy(false)}
 }
 return <main className="min-h-screen bg-ivory text-ink">
  <section className="bg-ink text-ivory">
   <div className="mx-auto max-w-[1080px] px-5 py-14 md:px-10 md:py-20">
    <Link href="/" className="inline-flex min-h-11 items-center gap-2 text-sm text-ivory/70">
     <ArrowLeft className="size-4"/> VEYFRONT
    </Link>
    <p className="mt-8 font-mono text-xs tracking-widest text-lime">P2-A3 · EVIDENCE-BOUND CONTEXT & PLANNING · PRIVATE PREVIEW</p>
    <h1 className="mt-4 max-w-4xl text-4xl font-semibold leading-tight md:text-6xl">
     {zh?'从网页事实，走向可核实的商业升级方向。':'From observed evidence to reviewable commercial hypotheses.'}
    </h1>
    <p className="mt-5 max-w-3xl text-ivory/70">
     {zh?'本次仅评估 VEYFRONT 公共首页。商业机会是待审核假设，不是已验证缺陷、AI 诊断、报价或建站承诺。':
      'One authorized public homepage, no claims of verified deficiencies, generative diagnosis, pricing or site delivery.'}
    </p>
   </div>
  </section>
  <div className="mx-auto max-w-[1080px] space-y-7 px-5 py-10 md:px-10 md:py-16">
   <div className="rounded-xl border border-ink/15 bg-white p-6 md:p-8">
    <p className="font-mono text-xs uppercase tracking-wide text-ink/50">Approved public source</p>
    <p className="mt-2 font-mono text-sm">https://veyfront.com/</p>
    <label className="mt-6 flex items-start gap-3 text-sm">
     <input type="checkbox" checked={consent} onChange={e=>setConsent(e.target.checked)} className="mt-1 size-4"/>
     <span>{zh?'我确认有权对 VEYFRONT 公开首页进行受控读取，并理解所有商业建议必须继续核实。':
      'I confirm authority to read this public homepage and understand all commercial hypotheses require review.'}</span>
    </label>
    <button disabled={!consent||busy} onClick={()=>void run()}
      className="mt-6 inline-flex min-h-12 items-center gap-2 rounded-lg bg-ink px-6 font-semibold text-ivory disabled:opacity-50">
     <FileSearch className="size-4"/>{busy?(zh?'正在核对证据…':'Reading evidence…'):(zh?'生成受控规划草案':'Build grounded planning draft')}
    </button>
    {error&&<p role="alert" className="mt-4 rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-800"><CircleAlert className="mr-2 inline size-4"/>{error}</p>}
   </div>
   {outcome&&<div aria-live="polite" className="space-y-7">
    <div className="rounded-xl border border-ink/15 bg-mist/40 p-6 md:p-8">
     <p className="font-mono text-xs text-ink/60">OBSERVED · NOT A COMMERCIAL CONCLUSION</p>
     <h2 className="mt-2 text-2xl font-semibold">{zh?'已观察到的网页事实':'Verified snapshot linkage'}</h2>
     <div className="mt-4 grid gap-4 text-sm md:grid-cols-2">
      <div><p className="text-ink/60">Document title</p><p className="mt-1">{outcome.plan.context.observed.title||'Not observed'}</p></div>
      <div><p className="text-ink/60">Page heading</p><p className="mt-1">{outcome.plan.context.observed.heading||'Not observed'}</p></div>
      <div><p className="text-ink/60">HTML forms observed</p><p className="mt-1">{outcome.plan.context.observed.html_form_count}</p></div>
      <div><p className="text-ink/60">Captured route</p><p className="mt-1 font-mono">/ · 1 HTML page</p></div>
     </div>
     <p className="mt-4 break-all font-mono text-xs text-ink/60">SHA-256: {outcome.plan.source.page_sha256}</p>
     <p className="mt-1 break-all font-mono text-xs text-ink/60">Plan: {outcome.plan.plan_id} · {outcome.plan.contract_version}</p>
    </div>
    <section className="space-y-4">
     <div><p className="font-mono text-xs text-ink/55">HYPOTHESES · CUSTOMER REVIEW REQUIRED</p>
      <h2 className="mt-2 text-2xl font-semibold">{zh?'获客与转化路径的四个核实方向':'Four buyer-journey review directions'}</h2></div>
     {outcome.plan.opportunities.map(op=><div key={op.id} className="rounded-xl border border-ink/15 bg-white p-6 md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
       <p className="font-mono text-xs font-semibold tracking-wider">{labels[op.stage]}</p>
       <span className="rounded-full border border-ink/20 px-3 py-1 text-xs">UNVERIFIED HYPOTHESIS</span>
      </div>
      <h3 className="mt-4 text-lg font-semibold">{op.hypothesis}</h3>
      <p className="mt-3 text-sm text-ink/75"><strong>{zh?'建议核查：':'Review action: '}</strong>{op.proposed_action}</p>
      <p className="mt-3 text-sm text-ink/75"><strong>{zh?'向客户确认：':'Ask the customer: '}</strong>{op.customer_question}</p>
      <p className="mt-4 break-all font-mono text-xs text-ink/50">Evidence: / · {op.evidence.observed_field} · {op.evidence.source_page_sha256.slice(0,20)}…</p>
     </div>)}
    </section>
    <section className="rounded-xl border border-ink/15 p-6 md:p-8">
     <h2 className="text-lg font-semibold">{zh?'仍然未知的四类经营事实':'Important unknowns'}</h2>
     <ul className="mt-3 space-y-2 text-sm text-ink/75">{outcome.plan.context.unknowns.map(x=><li key={x}>— {x}</li>)}</ul>
     <p className="mt-5 text-sm text-ink/60">Model calls: {outcome.plan.execution.model_calls} · Plan ready: No · Customer review required: Yes</p>
    </section>
   </div>}
   <div className="flex items-start gap-3 rounded-xl border border-ink/15 p-6 text-sm text-ink/70">
    <ShieldCheck className="mt-0.5 size-5 shrink-0"/>
    <p>{zh?'严格限定：HTTPS 白名单首页、来源哈希、受保护的 Preview、无模型调用、无建站生成；不会把未观察到的内容说成不存在。':
     'Strict single-homepage scope, source hashes, protected Preview, zero model or generation calls. Absence of observed evidence is never presented as proof of absence.'}</p>
   </div>
  </div>
 </main>
}
