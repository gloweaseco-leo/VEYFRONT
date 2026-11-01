import type { LiveHomeAssessment } from './l2m-p2a2'

export type GroundedOpportunity = {
  id: string
  stage: 'discover'|'understand'|'trust'|'convert'
  claim_status: 'UNVERIFIED_HYPOTHESIS'
  evidence: { route:'/';source_page_sha256:string;basis:'SCOPE_LIMITATION'|'OBSERVED_METADATA';observed_field:string }
  hypothesis: string; proposed_action: string; customer_question: string
  review_required: true
}
export type GroundedPlan = {
  contract_version:'l2m.acy.plan/0.1'
  plan_id:string; assessment_id:string; source_manifest_sha256:string
  source:{canonical_url:'https://veyfront.com/';route:'/';page_sha256:string;scope:'SINGLE_LIVE_HTML_HOMEPAGE'}
  context:{observed:{title:string;heading:string;html_form_count:number;nav_destinations_in_snapshot:string[]};unknowns:string[]}
  opportunities:GroundedOpportunity[]
  execution:{mode:'DETERMINISTIC_EVIDENCE_GROUNDED_HYPOTHESES';model_calls:0;generation_calls:0;customer_ready:false;plan_ready:false;requires_customer_confirmation:true}
  limitations:string[]
}
const obj=(x:unknown):x is Record<string,unknown>=>!!x&&typeof x==='object'&&!Array.isArray(x)
const hex64=(x:unknown)=>typeof x==='string'&&/^[a-f0-9]{64}$/.test(x)
const bounded=(x:unknown,max=400)=>typeof x==='string'&&x.length>0&&x.length<=max
const stages=['discover','understand','trust','convert'] as const
const codes=['CHANNEL_DISCOVERY_REVIEW','BUYER_CLARITY_REVIEW','PROOF_REQUIREMENTS_REVIEW','INQUIRY_PATH_REVIEW'] as const
const basis=['SCOPE_LIMITATION','OBSERVED_METADATA','SCOPE_LIMITATION','OBSERVED_METADATA'] as const
const fields=['capture_scope','title_heading_observed','capture_scope','form_count_observed'] as const

export function p2a3Enabled(env?:{VERCEL_ENV?:string;ACY_P2A3_ENABLED?:string;VERCEL_GIT_COMMIT_REF?:string}):boolean{
 const e=env??{VERCEL_ENV:process.env.VERCEL_ENV,ACY_P2A3_ENABLED:process.env.ACY_P2A3_ENABLED,VERCEL_GIT_COMMIT_REF:process.env.VERCEL_GIT_COMMIT_REF}
 return e.VERCEL_ENV==='preview'&&e.ACY_P2A3_ENABLED==='true'&&e.VERCEL_GIT_COMMIT_REF==='feature/acy-p2a3-consumer'
}
export function isGroundedPlan(value:unknown,assessment:LiveHomeAssessment):value is GroundedPlan{
 if(!assessment||!obj(value)||!obj(value.source)||!obj(value.context)||!obj(value.execution))return false
 const a=assessment as LiveHomeAssessment
 const s=value.source,c=value.context,x=value.execution,o=c.observed
 if(value.contract_version!=='l2m.acy.plan/0.1'||typeof value.plan_id!=='string'||!/^plan-[a-f0-9]{20}$/.test(value.plan_id)
   ||value.assessment_id!==a.assessment_id||value.source_manifest_sha256!==a.source.manifest_sha256
   ||s.canonical_url!=='https://veyfront.com/'||s.route!=='/'||s.scope!=='SINGLE_LIVE_HTML_HOMEPAGE'
   ||s.page_sha256!==a.source.pages[0].sha256
   ||!obj(o)||o.title!==a.source.pages[0].title_observed||o.heading!==a.source.pages[0].heading_observed
   ||o.html_form_count!==a.source.pages[0].form_count_observed
   ||!Array.isArray(o.nav_destinations_in_snapshot)
   ||JSON.stringify(o.nav_destinations_in_snapshot)!==JSON.stringify(a.source.pages[0].nav_destinations_in_snapshot)
   ||!Array.isArray(c.unknowns)||c.unknowns.length!==4||!c.unknowns.every(y=>bounded(y,180))
   ||!Array.isArray(value.opportunities)||value.opportunities.length!==4
   ||!Array.isArray(value.limitations)||value.limitations.length<3||value.limitations.length>8
   ||!value.limitations.every(y=>bounded(y,240))
   ||x.mode!=='DETERMINISTIC_EVIDENCE_GROUNDED_HYPOTHESES'||x.model_calls!==0||x.generation_calls!==0
   ||x.customer_ready!==false||x.plan_ready!==false||x.requires_customer_confirmation!==true)return false
 return value.opportunities.every((item,i)=>{
   if(!obj(item)||!obj(item.evidence))return false
   const e=item.evidence
   return item.id===codes[i]&&item.stage===stages[i]&&item.claim_status==='UNVERIFIED_HYPOTHESIS'
     &&item.review_required===true&&e.route==='/'&&e.source_page_sha256===a.source.pages[0].sha256
     &&e.basis===basis[i]&&e.observed_field===fields[i]
     &&bounded(item.hypothesis,400)&&bounded(item.proposed_action,400)&&bounded(item.customer_question,400)
 })
}
