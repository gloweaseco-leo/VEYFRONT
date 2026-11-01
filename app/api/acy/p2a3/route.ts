import type { NextRequest } from 'next/server'
import { randomBytes } from 'node:crypto'
import { signP2A2, P2A2_APPROVED_URL } from '@/lib/acy-p2a2-signature'
import { isJsonContentType, readLeadBody } from '@/lib/lead-request'
import { allowedP2A3Origin } from '@/lib/acy-p2a3-origin'
import { isLiveAssessment } from '@/lib/l2m-p2a2'
import { isGroundedPlan, p2a3Enabled } from '@/lib/l2m-p2a3'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
const headers = {'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff','X-Robots-Tag':'noindex, nofollow'}
const reject=(status:number,message:string)=>Response.json({ok:false,message},{status,headers})

export async function POST(request:NextRequest){
 if(!p2a3Enabled())return reject(404,'Not available.')
 if(!allowedP2A3Origin(request))return reject(403,'Origin not allowed.')
 if(!isJsonContentType(request))return reject(415,'JSON only.')
 const body=await readLeadBody(request,512)
 if(body.kind!=='ok')return reject(body.kind==='too-large'?413:400,'Invalid request.')
 let raw:unknown
 try{raw=JSON.parse(body.text)}catch{return reject(400,'Invalid JSON.')}
 if(!raw||typeof raw!=='object'||Array.isArray(raw))return reject(422,'Invalid input.')
 const input=raw as Record<string,unknown>
 if(Object.keys(input).length!==2||input.url!==P2A2_APPROVED_URL||input.authorization_confirmed!==true)
   return reject(422,'Only the authorized VEYFRONT homepage may be assessed.')

 const url=process.env.L2M_ACY_P2A3_URL?.trim()||''
 const secret=process.env.L2M_ACY_P2A3_SERVICE_TOKEN||''
 if(!url||secret.length<32)return reject(503,'P2-A3 is not configured.')
 let endpoint:URL
 try{endpoint=new URL(url)}catch{return reject(503,'Invalid upstream configuration.')}
 if(endpoint.protocol!=='https:'||!endpoint.hostname.endsWith('.vercel.app')||
    endpoint.pathname!=='/api/acy_plan'||endpoint.search||endpoint.hash||
    endpoint.username||endpoint.password||endpoint.port)return reject(503,'Unsupported upstream target.')
 const oidc=request.headers.get('x-vercel-oidc-token')
 if(!oidc||oidc.split('.').length!==3)return reject(503,'Preview identity is unavailable.')
 const issued_at=Math.floor(Date.now()/1000)
 const nonce=randomBytes(16).toString('hex')
 let upstream:Response
 try{
   upstream=await fetch(endpoint,{method:'POST',headers:{
     'Content-Type':'application/json','x-vercel-trusted-oidc-idp-token':oidc,
   },body:JSON.stringify({url:P2A2_APPROVED_URL,authorization_confirmed:true,
     issued_at,nonce,signature:signP2A2(issued_at,nonce,secret)}),
     cache:'no-store',redirect:'error',signal:AbortSignal.timeout(18000)})
 }catch{return reject(502,'L2M plan service could not be reached.')}
 if(!upstream.ok)return reject(502,`L2M plan service refused the request (HTTP ${upstream.status}).`)
 let data:unknown
 try{data=await upstream.json()}catch{return reject(502,'Invalid L2M response.')}
 if(!data||typeof data!=='object')return reject(502,'Missing L2M response.')
 const result=data as Record<string,unknown>
 if(result.ok!==true||!isLiveAssessment(result.assessment)||!isGroundedPlan(result.plan,result.assessment))
   return reject(502,'L2M evidence-plan provenance contract mismatch.')
 return Response.json({ok:true,assessment:result.assessment,plan:result.plan},{headers})
}
export async function GET(){return reject(405,'POST only.')}
