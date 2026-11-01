import {get,head,put} from '@vercel/blob'
import {authentic,P0_PREFIX,type P0Journey} from './p0-journey'

export const p0Path=(id:string)=>P0_PREFIX+id+'.json'
export async function readP0(id:string):Promise<P0Journey|null>{
 const doc=await get(p0Path(id),{access:'private',useCache:false})
 if(!doc)return null
 const j=await new Response(doc.stream).json() as P0Journey
 if(j.version!==2||j.id!==id||!Array.isArray(j.events)||j.events.length>60)throw Error('Invalid journey version')
 return j
}
export async function createP0(j:P0Journey,token:string):Promise<'created'|'duplicate'|'conflict'>{
 try{
  await put(p0Path(j.id),JSON.stringify(j),{access:'private',addRandomSuffix:false,allowOverwrite:false,
   contentType:'application/json',cacheControlMaxAge:60})
  return 'created'
 }catch{
  // Retries return the same access proof; never create another inquiry or resend an alert.
  const prior=await readP0(j.id).catch(()=>null)
  if(prior&&authentic(prior,token)){
   return prior.events[0]?.evidence.sha256===j.events[0]?.evidence.sha256?'duplicate':'conflict'
  }
  throw Error('Private intake unavailable')
 }
}
export async function casP0(j:P0Journey):Promise<boolean>{
 const current=await head(p0Path(j.id))
 if(!current)return false
 try{
  await put(p0Path(j.id),JSON.stringify(j),{access:'private',allowOverwrite:true,ifMatch:current.etag,
   contentType:'application/json',cacheControlMaxAge:60})
  return true
 }catch{return false}
}
/** Provider HTTP success is an acceptance, not a verified mailbox delivery receipt.
    Preview sends only operational references to the owned QA address; never clients or tokens. */
export async function p0QAAlert(info:{reference:string;service:'launch'|'rebuild';at:string}):
 Promise<'sent'|'failed'|'disabled'>{
 const key=process.env.ACY_P0_QA_RESEND_KEY?.trim()
 const from=process.env.ACY_P0_QA_FROM_EMAIL?.trim()
 if(!key||!from)return 'disabled'
 if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(from))return 'failed'
 try{
  const r=await fetch('https://api.resend.com/emails',{method:'POST',headers:{
   Authorization:'Bearer '+key,'Content-Type':'application/json',
   'Idempotency-Key':'p0-qa-ops-'+info.reference,
  },body:JSON.stringify({
   from,to:['hello@veyfront.com'],subject:'[P0 PREVIEW QA] VEYFRONT inquiry received',
   text:'QA-only preview inquiry was stored privately.\nReference: '+info.reference+
   '\nService: '+info.service+'\nReceived UTC: '+info.at+
   '\nNo customer data, resume token or request URL is included.'
  }),signal:AbortSignal.timeout(4000),cache:'no-store'})
  return r.ok?'sent':'failed'
 }catch{return 'failed'}
}
