'use client'
import {useEffect,useState,type FormEvent} from 'react'
import Link from 'next/link'
import {ArrowLeft,CheckCircle2,ShieldCheck,RefreshCw} from 'lucide-react'
type Status='needs_completion'|'qualified'|'human_review'
type Journey={
 id:string;reference:string;service:'launch'|'rebuild';status:Status;expiresAt:string;channel:'email'|'wechat'|'feishu'
 brief:{company:string;website:string;markets:string;desiredAction:string;description:string}
 nextQuestions:string[];notification:string;blockedReason:string
 ledger:{eventCount:number;events:{sequence:number;code:string;at:string;why:string;to:Status;
  evidence:{kind:string;sha256:string|null;consentVersion:string|null};
  usage:{modelCalls:number;generationCalls:number;billableAmountMinor:number|null;billing:string}}[];
 costs:{knownMinorUnits:null;modelCalls:0;generationCalls:0;status:string};evidenceLabel:string;sourceOfTruth:string}
}
export function JourneyConsole(){
 const [id,setId]=useState(''),[token,setToken]=useState('')
 const [j,setJ]=useState<Journey|null>(null),[markets,setMarkets]=useState(''),[action,setAction]=useState('')
 const [busy,setBusy]=useState(false),[error,setError]=useState('')
 async function call(body:Record<string,unknown>){
  const r=await fetch('/api/acy/p0',{method:'POST',headers:{'Content-Type':'application/json',
   'x-vf-preview-p0':'journey'},body:JSON.stringify(body),cache:'no-store'})
  const out=await r.json() as {ok?:boolean;message?:string;journey?:Journey}
  if(!r.ok||!out.ok||!out.journey)throw Error(out.message||'Journey unavailable')
  setJ(out.journey);setMarkets(out.journey.brief.markets);setAction(out.journey.brief.desiredAction)
 }
 useEffect(()=>{
  const p=new URLSearchParams(window.location.hash.slice(1))
  const storedId=p.get('id')||'',storedToken=p.get('token')||''
  if(!storedId||!storedToken){setError('Private resume link missing. Open the original continuation link.');return}
  setId(storedId);setToken(storedToken);setBusy(true)
  call({op:'read',id:storedId,token:storedToken})
   .catch(e=>setError(e instanceof Error?e.message:'Unable to resume'))
   .finally(()=>setBusy(false))
 },[])
 async function update(input:Record<string,unknown>){
  if(busy||!j)return
  setBusy(true);setError('')
  try{await call({op:'update',id,token,actionId:crypto.randomUUID(),...input})}
  catch(e){setError(e instanceof Error?e.message:'Update failed')}
  finally{setBusy(false)}
 }
 function complete(e:FormEvent){e.preventDefault();void update({type:'complete_brief',markets,desiredAction:action})}
 return <main className="min-h-screen bg-ivory text-ink">
  <header className="bg-ink px-5 py-12 text-ivory md:px-12">
   <Link href="/" className="inline-flex min-h-11 items-center gap-2"><ArrowLeft className="size-4"/>VEYFRONT</Link>
   <p className="mt-8 font-mono text-xs uppercase tracking-widest text-lime">P0 · PRIVATE PREVIEW · CUSTOMER JOURNEY</p>
   <h1 className="mt-4 text-4xl font-semibold">Resume your project brief</h1>
   <p className="mt-3 max-w-2xl text-ivory/70">Your original inquiry, next questions, event evidence and cost-accounting state share one private journey record. This QA Preview is not customer email verification or a public launch.</p>
  </header>
  <div className="mx-auto grid max-w-6xl gap-6 px-5 py-10 md:grid-cols-2 md:px-12">
   {busy&&<p role="status">Loading your private journey…</p>}
   {error&&<p role="alert" className="col-span-full rounded-lg border border-red-300 bg-red-50 p-4 text-red-800">{error}</p>}
   {j&&<><section className="space-y-6">
    <div className="rounded-xl border border-ink/15 bg-white p-6">
     <div className="flex items-center gap-3"><CheckCircle2 className="size-6"/><h2 className="text-xl font-semibold">{j.reference}</h2></div>
     <p className="mt-3 font-mono text-sm">P1 · {j.status.replaceAll('_',' ').toUpperCase()}</p>
     <p className="mt-2 text-sm text-ink/70">{j.blockedReason}</p>
     <p className="mt-3 text-xs text-ink/60">Expires: {new Date(j.expiresAt).toLocaleString()} · {j.service}</p>
     <p className="mt-2 text-xs text-ink/60">Operational email alert: {j.notification==='provider_accepted'?'Provider accepted (delivery unverified)':j.notification}</p>
    </div>
    {j.status==='needs_completion'&&<form onSubmit={complete} className="space-y-4 rounded-xl border border-ink/15 bg-white p-6">
     <h3 className="text-lg font-semibold">Complete the missing facts</h3>
     <p className="text-sm text-ink/70">The next questions come from deterministic validation, not an AI diagnosis.</p>
     {j.nextQuestions.includes('markets')&&<label className="block text-sm font-semibold">Target buyer markets<input required minLength={3} maxLength={240} className="mt-2 min-h-12 w-full rounded-md border border-ink/30 px-3" value={markets} onChange={e=>setMarkets(e.target.value)}/></label>}
     {j.nextQuestions.includes('desiredAction')&&<label className="block text-sm font-semibold">Desired buyer action<input required minLength={3} maxLength={240} className="mt-2 min-h-12 w-full rounded-md border border-ink/30 px-3" value={action} onChange={e=>setAction(e.target.value)}/></label>}
     <button disabled={busy} className="min-h-12 rounded-md bg-ink px-5 font-semibold text-ivory disabled:opacity-50">Save and continue</button>
    </form>}
    {j.status==='qualified'&&<div className="rounded-xl border border-ink/20 bg-mist/40 p-6"><h3 className="text-lg font-semibold">Information completed</h3><p className="mt-2 text-sm">P1 is qualified for human/business review; P2 analysis, offer, contract and payment remain separate gated stages.</p></div>}
    {j.status==='human_review'&&<p className="rounded-xl border border-ink/20 bg-mist/40 p-6">Human exception flagged. No operator SLA or response is claimed.</p>}
    <div className="rounded-xl border border-ink/15 bg-white p-6">
     <h3 className="font-semibold">Preferred communication channel</h3>
     <p className="my-3 text-xs text-ink/60">Preferences only; WeChat and Feishu are not connected.</p>
     <div className="flex flex-wrap gap-2">{(['email','wechat','feishu'] as const).map(ch=>
      <button type="button" disabled={busy} key={ch} onClick={()=>void update({type:'choose_channel',channel:ch})}
       className={'min-h-11 rounded-md border px-4 text-sm '+(j.channel===ch?'border-ink bg-ink text-ivory':'border-ink/20')}>{ch}</button>)}</div>
    </div>
    {j.status!=='human_review'&&<button type="button" disabled={busy} onClick={()=>void update({type:'request_human'})}
     className="min-h-11 font-semibold underline underline-offset-4">Request human exception review</button>}
   </section>
   <aside className="space-y-6">
    <div className="rounded-xl border border-ink/15 bg-white p-6">
     <div className="flex items-center gap-2"><ShieldCheck className="size-5"/><h3 className="text-lg font-semibold">Event, evidence and cost ledger</h3></div>
     <p className="mt-2 text-xs text-ink/60">Private record · {j.ledger.sourceOfTruth} · {j.ledger.eventCount} events</p>
     <p className="mt-3 text-sm">Recorded model calls: {j.ledger.costs.modelCalls}. Generation calls: {j.ledger.costs.generationCalls}. Monetary costs: <strong>NOT RECONCILED</strong> (no zero-cost claim).</p>
     <ol className="mt-5 space-y-4">{j.ledger.events.map(e=><li className="border-t border-ink/10 pt-3 text-sm" key={e.sequence}>
      <div className="flex justify-between gap-2 font-semibold"><span>{e.sequence}. {e.code.replaceAll('_',' ')}</span><time className="text-xs font-normal text-ink/60">{new Date(e.at).toLocaleString()}</time></div>
      <p className="mt-2 text-ink/75">{e.why}</p>
      <p className="mt-1 font-mono text-xs text-ink/55">Source: {e.evidence.kind} · State: {e.to}</p>
      {e.evidence.sha256&&<p className="mt-1 break-all font-mono text-xs text-ink/55">SHA-256 {e.evidence.sha256}</p>}
     </li>)}</ol>
    </div>
    <div className="rounded-xl border border-ink/15 bg-mist/40 p-6 text-sm">
     <div className="flex items-center gap-2"><RefreshCw className="size-4"/><strong>Safety and limits</strong></div>
     <p className="mt-3">This link carries a 48-hour secret in the URL fragment. Do not share or forward it. The browser only sends it inside authenticated POST requests. The company's details are customer supplied, not independently verified.</p>
    </div>
   </aside></>}
  </div>
 </main>
}
