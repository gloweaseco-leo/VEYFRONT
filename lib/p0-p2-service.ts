import {randomBytes} from 'node:crypto'
import {P2A2_APPROVED_URL,signP2A2} from './acy-p2a2-signature'
import {isLiveAssessment} from './l2m-p2a2'
import {isGroundedPlan} from './l2m-p2a3'
import {validateEvidence} from './l2m-p2-evidence'
import type {P0Journey,P0P2Review} from './p0-journey'

export class P2ReviewError extends Error {
 readonly category:'NOT_ELIGIBLE'|'NOT_CONFIGURED'|'IDENTITY_REQUIRED'|'UPSTREAM_FAILED'|'INVALID_EVIDENCE'
 constructor(category:P2ReviewError['category']){
  super(category)
  this.category=category
 }
}
/** Existing L2M P2-A3 service, reused only for the owner's allowlisted homepage. No new crawler. */
export async function makeP2Review(j:P0Journey,oidc:string|null,opts?:{
 now?:Date;endpoint?:string;secret?:string;fetchFn?:typeof fetch;
}):Promise<P0P2Review>{
 // A submitted URL is NOT site ownership verification. The private pilot cannot evaluate arbitrary customers.
 let canonical:string
 try{
  const u=new URL(j.brief.website)
  canonical=u.protocol==='https:'&&!u.username&&!u.password&&!u.search&&!u.hash&&!u.port&&
   u.hostname==='veyfront.com'&&u.pathname==='/'?u.toString():''
 }catch{canonical=''}
 if(j.service!=='rebuild'||j.status!=='qualified'||j.p2||canonical!==P2A2_APPROVED_URL)
  throw new P2ReviewError('NOT_ELIGIBLE')
 if(typeof oidc!=='string'||oidc.split('.').length!==3)
  throw new P2ReviewError('IDENTITY_REQUIRED')
 const evidenceEnabled=process.env.ACY_P2_FACTS_ENABLED==='true'
 const endpointString=opts?.endpoint??process.env.L2M_ACY_P0_UPSTREAM_URL??''
 const secret=opts?.secret??process.env.L2M_ACY_P0_SERVICE_TOKEN??''
 let endpoint:URL
 try{endpoint=new URL(endpointString)}catch{throw new P2ReviewError('NOT_CONFIGURED')}
 // Only the exact dedicated P2-A3 branch alias, not arbitrary Vercel projects.
 if(secret.length<32||endpoint.protocol!=='https:'||
  !/^l2m-acy-p2a-preview-git-featur-[a-z0-9-]+\.vercel\.app$/.test(endpoint.hostname)||
  endpoint.pathname!==(evidenceEnabled?'/api/acy_evidence':'/api/acy_plan')||endpoint.search||endpoint.hash||
  endpoint.port||endpoint.username||endpoint.password)
  throw new P2ReviewError('NOT_CONFIGURED')
 const now=opts?.now??new Date()
 const stamp=Math.floor(now.getTime()/1000),nonce=randomBytes(16).toString('hex')
 let response:Response
 try{
  response=await (opts?.fetchFn??fetch)(endpoint,{
   method:'POST',headers:{'Content-Type':'application/json','x-vercel-trusted-oidc-idp-token':oidc},
   body:JSON.stringify({url:P2A2_APPROVED_URL,authorization_confirmed:true,issued_at:stamp,nonce,
    signature:signP2A2(stamp,nonce,secret)}),
   cache:'no-store',redirect:'error',signal:AbortSignal.timeout(18000)
  })
 }catch{throw new P2ReviewError('UPSTREAM_FAILED')}
 if(!response.ok)throw new P2ReviewError('UPSTREAM_FAILED')
 let data:unknown
 try{data=await response.json()}catch{throw new P2ReviewError('INVALID_EVIDENCE')}
 if(!data||typeof data!=='object'||!('ok' in data)||(data as {ok:unknown}).ok!==true)
  throw new P2ReviewError('INVALID_EVIDENCE')
 const packet=data as {assessment?:unknown;plan?:unknown}
 if(!isLiveAssessment(packet.assessment)||!isGroundedPlan(packet.plan,packet.assessment))
  throw new P2ReviewError('INVALID_EVIDENCE')
 const a=packet.assessment,p=packet.plan
 const inventory=(a as typeof a & {commercial_evidence?:unknown}).commercial_evidence
 if(evidenceEnabled&&!validateEvidence(inventory,a))throw new P2ReviewError('INVALID_EVIDENCE')
 // Buyer questions remain explicitly unverified; do not score customers, quote or trigger builds.
 return {
  status:'REVIEW_REQUIRED',sourceUrl:P2A2_APPROVED_URL,
  sourcePageSha256:a.source.pages[0].sha256,sourceManifestSha256:a.source.manifest_sha256,
  assessmentId:a.assessment_id,planId:p.plan_id,
  observedAt:now.toISOString(),capturedAt:a.source.captured_at_utc,
  contract:'l2m.acy.plan/0.1',
  opportunities:p.opportunities.map(x=>({stage:x.stage,hypothesis:x.hypothesis,
    question:x.customer_question,claim:'UNVERIFIED_HYPOTHESIS' as const})),
  customerReady:false,modelCalls:0,generationCalls:0,
  sourceRights:'USER_ASSERTED_NOT_INDEPENDENTLY_VERIFIED',
  commercialEvidence:evidenceEnabled&&validateEvidence(inventory,a)?inventory:undefined
 }
}
