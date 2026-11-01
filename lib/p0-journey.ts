import {createHash,createHmac,timingSafeEqual} from 'node:crypto'
import type {AcyBrief,AcyChannel,AcyStatus} from './acy-p1'
import type {EvidenceInventory} from './l2m-p2-evidence'
// Mirror frozen P1 rule contract; the parity regression covers both implementations.
const missingBriefFields=(brief:AcyBrief)=>(['markets','desiredAction'] as const).filter(x=>brief[x].trim().length<3)
const deriveStatus=(brief:AcyBrief):AcyStatus=>missingBriefFields(brief).length?'needs_completion':'qualified'

export type P0EventCode='intake_received'|'missing_information_requested'|'intake_qualified'|
 'email_provider_accepted'|'email_failed'|'email_disabled'|'brief_completed'|'channel_preference_recorded'|'human_review_requested'|'p2_evidence_plan_review_drafted'|'p2_review_started'|'p2_review_failed'
export type P0Event={
 sequence:number;eventId:string;actionId:string;code:P0EventCode;at:string;previousHash:string|null;entryHash:string;
 from:AcyStatus|null;to:AcyStatus;why:string;
 evidence:{kind:'CUSTOMER_SELF_REPORTED'|'SYSTEM_RULE'|'PROVIDER_RESPONSE'|'BOUNDED_PUBLIC_SNAPSHOT'|'EXPLICIT_SOURCE_AUTHORIZATION';sha256:string|null;consentVersion:string|null}
 usage:{modelCalls:0;generationCalls:0;billableAmountMinor:null;billing:'NOT_MEASURED'}
}
export type P0P2Review={
 status:'REVIEW_REQUIRED';sourceUrl:'https://veyfront.com/';sourcePageSha256:string;sourceManifestSha256:string;
 assessmentId:string;planId:string;observedAt:string;capturedAt:string;contract:'l2m.acy.plan/0.1';
 opportunities:Array<{stage:'discover'|'understand'|'trust'|'convert';hypothesis:string;question:string;claim:'UNVERIFIED_HYPOTHESIS'}>;
 customerReady:false;modelCalls:0;generationCalls:0;sourceRights:'USER_ASSERTED_NOT_INDEPENDENTLY_VERIFIED';
 commercialEvidence?:EvidenceInventory;commercialEvidenceSha256?:string
}
export type P0Journey={
 version:2;id:string;reference:string;createdAt:string;updatedAt:string;expiresAt:string;
 accessHash:string;service:'launch'|'rebuild';name:string;email:string;
 brief:AcyBrief;status:AcyStatus;channel:AcyChannel;consent:{accepted:true;version:'VEYFRONT-PRIVACY-2026-10-30';at:string};
 notification:'pending'|'provider_accepted'|'failed'|'disabled';
 p2?:P0P2Review;
 p2Attempt?:{actionId:string;startedAt:string;state:'IN_PROGRESS'|'FAILED';reason:string};
 events:P0Event[];ownerStatus:'unassigned';costs:{currency:null;knownMinorUnits:null;modelCalls:0;generationCalls:0;status:'NOT_RECONCILED'};
}
export const P0_PREFIX='acy-p0/preview/journeys/'
export const P0_CONSENT='VEYFRONT-PRIVACY-2026-10-30'
export const P2_SOURCE_CONSENT='VEYFRONT-READONLY-HOMEPAGE-2026-10-31'
const allowedStatus=['needs_completion','qualified','human_review']
export function enabledP0(env?:{VERCEL_ENV?:string;VERCEL_GIT_COMMIT_REF?:string;ACY_P0_ENABLED?:string}):boolean{
 const e=env??process.env
 return e.VERCEL_ENV==='preview'&&e.VERCEL_GIT_COMMIT_REF==='feature/p0-unified-journey-ledger'&&e.ACY_P0_ENABLED==='true'
}
export function p0Origin(request:Pick<Request,'url'|'headers'>,env?:{VERCEL_ENV?:string;ACY_P0_ALLOWED_ORIGIN?:string}):boolean{
 const e=env??process.env
 if(e.VERCEL_ENV!=='preview')return false
 const allowed=e.ACY_P0_ALLOWED_ORIGIN?.trim()
 if(!allowed||!/^https:\/\/veyfront-git-feature-p0-[a-z0-9-]+\.vercel\.app$/.test(allowed))return false
 const origin=request.headers.get('origin')
 if(origin)return origin===allowed
 return request.headers.get('sec-fetch-site')==='same-origin'&&request.headers.get('x-vf-preview-p0')==='journey'
}
export function qaOnly(email:string):boolean{
 return email.toLowerCase()==='qa@example.invalid'||email.toLowerCase()==='hello@veyfront.com'
}
export function idempotentIdentity(key:string,email:string,secret:string):{id:string;token:string}{
 if(!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(key)||secret.length<32)throw Error('Invalid idempotency envelope')
 const v=createHmac('sha256',secret).update('journey|'+key.toLowerCase()+'|'+email.toLowerCase()).digest('hex')
 const id=v.slice(0,8)+'-'+v.slice(8,12)+'-4'+v.slice(13,16)+'-a'+v.slice(17,20)+'-'+v.slice(20,32)
 const token=createHmac('sha256',secret).update('access|'+key.toLowerCase()+'|'+email.toLowerCase()).digest('base64url')
 return {id,token}
}
export const sha=(x:string)=>createHash('sha256').update(x).digest('hex')
export function authentic(j:P0Journey,token:unknown,now=new Date()):boolean{
 if(typeof token!=='string'||token.length<32||token.length>128||Date.parse(j.expiresAt)<=now.getTime())return false
 const x=Buffer.from(sha(token),'hex'),y=Buffer.from(j.accessHash,'hex')
 return y.length===x.length&&timingSafeEqual(x,y)
}
export function event(j:P0Journey,code:P0EventCode,why:string,actionId:string,kind:P0Event['evidence']['kind'],
 at:string,from:AcyStatus|null,sourceHash:string|null):P0Event{
 const base={
  sequence:j.events.length+1,eventId:sha(j.id+'|'+actionId+'|'+code).slice(0,32),actionId,code,at,
  from,to:j.status,previousHash:j.events.at(-1)?.entryHash??null,why,
  evidence:{kind,sha256:sourceHash,consentVersion:kind==='EXPLICIT_SOURCE_AUTHORIZATION'?P2_SOURCE_CONSENT:kind==='CUSTOMER_SELF_REPORTED'?P0_CONSENT:null},
  usage:{modelCalls:0 as const,generationCalls:0 as const,billableAmountMinor:null,billing:'NOT_MEASURED' as const}
 }
 return {...base,entryHash:sha(JSON.stringify(base))}
}
export function verifyLedger(j:P0Journey):boolean{
 if(!Array.isArray(j.events)||j.events.length<2||j.events.length>60)return false
 let previous:string|null=null
 for(let i=0;i<j.events.length;i++){
  const e=j.events[i]
  if(e.sequence!==i+1||e.previousHash!==previous||!/^([a-f0-9]{64})$/.test(e.entryHash))return false
  const {entryHash,...base}=e
  if(sha(JSON.stringify(base))!==entryHash)return false
  if(e.usage.modelCalls!==0||e.usage.generationCalls!==0||e.usage.billableAmountMinor!==null)return false
  previous=entryHash
 }
 if(j.status!==j.events[j.events.length-1]?.to)return false
 if(j.p2Attempt){
  const attempts=j.events.filter(e=>e.code==='p2_review_started'&&e.actionId===j.p2Attempt?.actionId)
  if(attempts.length!==1)return false
  const ended=j.events.filter(e=>e.code==='p2_review_failed'&&e.actionId===j.p2Attempt?.actionId)
  if(j.p2Attempt.state==='IN_PROGRESS'&&(ended.length!==0||j.p2))return false
  if(j.p2Attempt.state==='FAILED'&&(ended.length!==1||ended[0].why!==j.p2Attempt.reason||j.p2))return false
 }
 if(j.p2){
  const p=j.p2
  const linked=j.events.filter(e=>e.code==='p2_evidence_plan_review_drafted')
  if(linked.length!==1||linked[0].evidence.sha256!==p.sourcePageSha256||
    p.status!=='REVIEW_REQUIRED'||p.customerReady!==false||
    p.sourceUrl!=='https://veyfront.com/'||p.sourceRights!=='USER_ASSERTED_NOT_INDEPENDENTLY_VERIFIED'||
    !/^[a-f0-9]{64}$/.test(p.sourceManifestSha256)||!/^[a-f0-9]{64}$/.test(p.sourcePageSha256)||
    !/^assessment-[a-f0-9]{20}$/.test(p.assessmentId)||!/^plan-[a-f0-9]{20}$/.test(p.planId)||
    p.opportunities.length!==4||p.modelCalls!==0||p.generationCalls!==0)return false
  if(p.commercialEvidence){
   if(!p.commercialEvidenceSha256||p.commercialEvidence.source.source_page_sha256!==p.sourcePageSha256||
      sha(JSON.stringify(p.commercialEvidence))!==p.commercialEvidenceSha256)return false
  }
  if(!['discover','understand','trust','convert'].every((stage,i)=>
   p.opportunities[i]?.stage===stage&&p.opportunities[i]?.claim==='UNVERIFIED_HYPOTHESIS'))return false
 }
 return true
}

export function makeP0(input:{service:'launch'|'rebuild';name:string;email:string;company:string;website:string;markets:string;details:string},
 key:string,secret:string,now=new Date()):{journey:P0Journey;token:string}{
 const {id,token}=idempotentIdentity(key,input.email,secret)
 const time=now.toISOString(),brief:AcyBrief={company:input.company,website:input.website,markets:input.markets,desiredAction:'',description:input.details}
 const status=deriveStatus(brief)
 const j:P0Journey={
  version:2,id,reference:'VF-'+id.replaceAll('-','').slice(0,8).toUpperCase(),createdAt:time,updatedAt:time,
  expiresAt:new Date(now.getTime()+48*60*60*1000).toISOString(),accessHash:sha(token),
  service:input.service,name:input.name,email:input.email.toLowerCase(),brief,status,channel:'email',
  consent:{accepted:true,version:P0_CONSENT,at:time},notification:'pending',
  events:[],ownerStatus:'unassigned',
  costs:{currency:null,knownMinorUnits:null,modelCalls:0,generationCalls:0,status:'NOT_RECONCILED'}
 }
 const evidenceHash=sha(JSON.stringify({service:input.service,name:input.name,email:j.email,brief,consent:P0_CONSENT}))
 j.events.push(event(j,'intake_received','Consent received and private intake persisted.',key,'CUSTOMER_SELF_REPORTED',time,null,evidenceHash))
 if(status==='needs_completion')j.events.push(event(j,'missing_information_requested','Target markets and/or desired buyer action need confirmation.',key,'SYSTEM_RULE',time,status,null))
 else j.events.push(event(j,'intake_qualified','Required brief fields completed; not a sales decision.',key,'SYSTEM_RULE',time,status,null))
 return {journey:j,token}
}
export function recordDelivery(j:P0Journey,result:'sent'|'failed'|'disabled',now=new Date()):P0Journey{
 const next:P0Journey={...j,events:[...j.events],updatedAt:now.toISOString(),
 notification:result==='sent'?'provider_accepted':result}
 const code:P0EventCode=result==='sent'?'email_provider_accepted':result==='failed'?'email_failed':'email_disabled'
 const why=result==='sent'?'Resend API accepted alert; mailbox delivery not independently verified.':
 result==='failed'?'Notification attempt failed; operator must check private intake.':'Notification not configured; manual inbox review required.'
 next.events.push(event(next,code,why,'alert-'+j.id,'PROVIDER_RESPONSE',now.toISOString(),j.status,null))
 return next
}
export function beginP2Review(j:P0Journey,actionId:string,now=new Date()):
 {kind:'updated';journey:P0Journey}|{kind:'duplicate'|'busy'|'invalid'}{
 if(!/^[0-9a-f-]{36}$/i.test(actionId))return {kind:'invalid'}
 if(j.events.some(e=>e.actionId===actionId))return {kind:'duplicate'}
 if(j.service!=='rebuild'||j.status!=='qualified'||j.p2||j.events.length>=48)return {kind:'invalid'}
 if(j.p2Attempt?.state==='IN_PROGRESS'&&now.getTime()-Date.parse(j.p2Attempt.startedAt)<45_000)return {kind:'busy'}
 const at=now.toISOString()
 const next:P0Journey={...j,events:[...j.events],updatedAt:at,
  p2Attempt:{actionId,startedAt:at,state:'IN_PROGRESS',reason:'Source evidence request running.'}}
 next.events.push(event(next,'p2_review_started','Authorized source review started; not a verified customer claim.',
  actionId,'EXPLICIT_SOURCE_AUTHORIZATION',at,j.status,sha('https://veyfront.com/|'+actionId+'|consented')))
 return {kind:'updated',journey:next}
}
export function failP2Review(j:P0Journey,actionId:string,category:string,now=new Date()):P0Journey|null{
 if(j.p2Attempt?.actionId!==actionId||j.p2Attempt.state!=='IN_PROGRESS'||j.events.length>=50)return null
 const reason=['UPSTREAM_FAILED','INVALID_EVIDENCE','IDENTITY_REQUIRED','NOT_CONFIGURED','NOT_ELIGIBLE'].includes(category)?category:'UNKNOWN_FAILURE'
 const at=now.toISOString()
 const next:P0Journey={...j,events:[...j.events],updatedAt:at,
  p2Attempt:{actionId,startedAt:j.p2Attempt.startedAt,state:'FAILED',reason}}
 next.events.push(event(next,'p2_review_failed',reason,actionId,'SYSTEM_RULE',at,j.status,null))
 return next
}
export function linkP2Review(j:P0Journey,review:P0P2Review,actionId:string,now=new Date()):
 {kind:'updated';journey:P0Journey}|{kind:'invalid'}{
 if(j.service!=='rebuild'||j.status!=='qualified'||j.events.length>=50||
    j.p2Attempt?.actionId!==actionId||j.p2Attempt.state!=='IN_PROGRESS'||
    !/^[0-9a-f-]{36}$/i.test(actionId)||review.customerReady!==false||
    review.sourceUrl!=='https://veyfront.com/'||!(/^[a-f0-9]{64}$/).test(review.sourcePageSha256)||
    review.opportunities.length!==4||review.modelCalls!==0||review.generationCalls!==0||
    (review.commercialEvidence&&(review.commercialEvidence.source.source_page_sha256!==review.sourcePageSha256||
      sha(JSON.stringify(review.commercialEvidence))!==review.commercialEvidenceSha256)))return {kind:'invalid'}
 if(j.p2)return {kind:'invalid'}
 const at=now.toISOString()
 const next:P0Journey={...j,p2:review,p2Attempt:undefined,events:[...j.events],updatedAt:at}
 next.events.push(event(next,'p2_evidence_plan_review_drafted',
  'One whitelisted live homepage observed; four review hypotheses remain unverified. No sale or site generation.',
  actionId,'BOUNDED_PUBLIC_SNAPSHOT',at,j.status,review.sourcePageSha256))
 return {kind:'updated',journey:next}
}

export function changeP0(j:P0Journey,input:Record<string,unknown>,now=new Date()):
 {kind:'updated'|'duplicate';journey:P0Journey}|{kind:'invalid'}{
 if(typeof input.actionId!=='string'||!/^[0-9a-f-]{36}$/i.test(input.actionId))return {kind:'invalid'}
 if(j.events.some(e=>e.actionId===input.actionId))return {kind:'duplicate',journey:j}
 if(j.events.length>=50)return {kind:'invalid'}
 let next:P0Journey={...j,brief:{...j.brief},events:[...j.events],updatedAt:now.toISOString()}
 let code:P0EventCode,why:string,hash:string|null=null,kind:P0Event['evidence']['kind']='SYSTEM_RULE'
 if(input.type==='complete_brief'&&j.status==='needs_completion'&&!j.p2&&!j.p2Attempt){
  if(typeof input.markets!=='string'||typeof input.desiredAction!=='string'||input.markets.trim().length>240||input.desiredAction.trim().length>240)return {kind:'invalid'}
  next.brief.markets=input.markets.trim();next.brief.desiredAction=input.desiredAction.trim()
  next.status=deriveStatus(next.brief);code='brief_completed';why=next.status==='qualified'?'Customer-supplied missing fields complete; ready for next stage, not yet approved.':'More information is needed.'
  kind='CUSTOMER_SELF_REPORTED';hash=sha(JSON.stringify({markets:next.brief.markets,desiredAction:next.brief.desiredAction}))
 }else if(input.type==='choose_channel'&&(input.channel==='email'||input.channel==='wechat'||input.channel==='feishu')){
  next.channel=input.channel;code='channel_preference_recorded';why='Preference saved only; third-party messaging not connected.'
 }else if(input.type==='request_human'){
  next.status='human_review';code='human_review_requested';why='Manual review requested, owner assignment pending.'
 }else return {kind:'invalid'}
 next.events.push(event(next,code,why,input.actionId,kind,now.toISOString(),j.status,hash))
 return {kind:'updated',journey:next}
}
export function visibleP0(j:P0Journey){
 return {id:j.id,reference:j.reference,service:j.service,status:j.status,createdAt:j.createdAt,updatedAt:j.updatedAt,
  expiresAt:j.expiresAt,channel:j.channel,brief:j.brief,nextQuestions:missingBriefFields(j.brief),
  notification:j.notification,blockedReason:j.status==='needs_completion'?'Waiting for target markets and/or desired buyer action.':
  j.status==='human_review'?'Awaiting a human operations owner.':'P1 qualified; P2 needs separate authorized source evidence.',
  p2:j.p2??null,
  ledger:{events:j.events.map(e=>({...e})),eventCount:j.events.length,
   integrity:verifyLedger(j)?'HASH_CHAIN_VALID':'INVALID',
   stages:[
    {stage:'P1',status:j.status,reason:j.status==='needs_completion'?'Customer needs to complete brief fields.':j.status==='human_review'?'Operations owner review pending.':'Brief sufficient for next-stage evaluation.'},
    {stage:'P2',status:j.p2?'REVIEW_REQUIRED':j.p2Attempt?.state??'NOT_STARTED',
     reason:j.p2?'Bounded homepage evidence and unverified plan require customer review.':
      j.p2Attempt?.state==='IN_PROGRESS'?'Read-only homepage observation is in progress.':
      j.p2Attempt?.state==='FAILED'?'Previous source review failed: '+j.p2Attempt.reason:
      'No authorized customer URL evidence linked to this journey.'},
   ],
   excludedPhases:['P3_ORDER_PAYMENT','P4_GENERATION_DELIVERY'],
   costs:j.costs,stage:'P1_INTAKE',sourceOfTruth:'PRIVATE_BLOB_VERSION_2',
   evidenceLabel:'CUSTOMER_SELF_REPORTED_NOT_INDEPENDENTLY_VERIFIED'}}
}
