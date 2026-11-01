import type {NextRequest} from 'next/server'
import {isJsonContentType,readLeadBody} from '@/lib/lead-request'
import {authentic,changeP0,enabledP0,p0Origin,visibleP0} from '@/lib/p0-journey'
import {readP0,casP0} from '@/lib/p0-store'

export const runtime='nodejs'
export const dynamic='force-dynamic'
const H={'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer','X-Robots-Tag':'noindex, nofollow'}
const fail=(status:number,message:string)=>Response.json({ok:false,message},{status,headers:H})
const validId=(x:unknown):x is string=>typeof x==='string'&&/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-a[a-f0-9]{3}-[a-f0-9]{12}$/.test(x)

export async function POST(request:NextRequest){
 if(!enabledP0())return fail(404,'Not available.')
 if(!p0Origin(request))return fail(403,'Origin not allowed.')
 if(!isJsonContentType(request))return fail(415,'JSON only.')
 const body=await readLeadBody(request,4096)
 if(body.kind!=='ok')return fail(body.kind==='too-large'?413:400,'Invalid payload.')
 let data:Record<string,unknown>
 try{data=JSON.parse(body.text)}catch{return fail(400,'Invalid JSON.')}
 if(!data||typeof data!=='object'||Array.isArray(data)||!validId(data.id))return fail(422,'Invalid journey.')
 if(data.op!=='read'&&data.op!=='update')return fail(422,'Unsupported operation.')
 if(!process.env.BLOB_READ_WRITE_TOKEN)return fail(503,'Private storage unavailable.')
 const j=await readP0(data.id).catch(()=>null)
 if(!j||!authentic(j,data.token))return fail(404,'Journey not found or expired.')
 if(data.op==='read')return Response.json({ok:true,journey:visibleP0(j)},{headers:H})
 const result=changeP0(j,data)
 if(result.kind==='invalid')return fail(422,'Invalid or exhausted action.')
 if(result.kind==='duplicate')return Response.json({ok:true,duplicate:true,journey:visibleP0(j)},{headers:H})
 const saved=await casP0(result.journey)
 if(!saved)return fail(409,'Concurrent update. Read the latest journey and retry with the same action ID.')
 return Response.json({ok:true,journey:visibleP0(result.journey)},{headers:H})
}
export async function GET(){return fail(405,'POST only.')}
