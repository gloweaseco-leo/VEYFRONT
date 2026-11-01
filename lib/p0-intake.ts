import type {NextRequest} from 'next/server'
import {makeP0,recordDelivery,qaOnly,visibleP0,type P0Journey} from './p0-journey'
import {casP0,createP0,p0QAAlert,readP0} from './p0-store'

const H={'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer'}
const err=(status:number,message:string)=>Response.json({ok:false,message},{status,headers:H})

export async function receiveP0(request:NextRequest,data:{
 service:'launch'|'rebuild';name:string;email:string;company:string;website:string;markets:string;details:string
}):Promise<Response>{
 if(!qaOnly(data.email))return err(422,'Protected Preview accepts internal QA recipients only.')
 const key=request.headers.get('x-vf-intake-key')||''
 const secret=process.env.ACY_P0_IDEMPOTENCY_SECRET||''
 let journey:P0Journey,token:string
 try{({journey,token}=makeP0(data,key,secret))}catch{return err(422,'A valid intake idempotency key is required.')}
 let state:'created'|'duplicate'|'conflict'
 try{state=await createP0(journey,token)}catch{return err(503,'Unified intake storage unavailable.')}
 if(state==='conflict')return err(409,'This submission key belongs to another payload.')
 if(state==='duplicate'){
  const existing=await readP0(journey.id).catch(()=>null)
  if(!existing)return err(503,'Intake record unavailable.')
  return Response.json({ok:true,duplicate:true,reference:existing.reference,journey:visibleP0(existing),
   resumeUrl:resumeUrl(request,existing.id,token)}, {status:200,headers:H})
 }
 const alert=await p0QAAlert({reference:journey.reference,service:journey.service,at:journey.createdAt})
 for(let attempt=0;attempt<3;attempt++){
  const latest=await readP0(journey.id).catch(()=>null)
  if(!latest)break
  if(latest.notification!=='pending')break
  if(await casP0(recordDelivery(latest,alert)))break
 }
 const saved=await readP0(journey.id).catch(()=>null)
 if(!saved)return err(503,'Intake record unavailable.')
 return Response.json({ok:true,reference:saved.reference,journey:visibleP0(saved),
   resumeUrl:resumeUrl(request,saved.id,token),emailAlert:saved.notification}, {status:201,headers:H})
}
export function resumeUrl(request:Pick<Request,'url'>,id:string,token:string):string{
 const u=new URL('/journey',request.url)
 // Fragment is not sent in HTTP requests, Referer or server logs.
 u.hash=new URLSearchParams({id,token}).toString()
 return u.toString()
}
