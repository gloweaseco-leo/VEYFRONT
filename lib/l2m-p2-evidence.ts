import {createHash} from 'node:crypto'
import type {LiveHomeAssessment} from './l2m-p2a2'

export type ObservedHTMLFact = {
 id:string;kind:'CTA'|'OFFERING_CANDIDATE'|'CASE_CANDIDATE'|'CONTACT_LINK'|'FORM_MARKUP';
 claim_status:'OBSERVED_UNVERIFIED'|'CANDIDATE_NOT_A_VERIFIED_CUSTOMER_CASE'|'CANDIDATE_NOT_A_VERIFIED_PRODUCT_OR_SERVICE'|'HTML_PRESENT_NOT_FUNCTIONALLY_TESTED';
 route:'/';selector:string;source_page_sha256:string;excerpt:string;excerpt_sha256:string;target_observed:string
}
export type EvidenceInventory={
 contract_version:'l2m.acy.commercial-evidence/0.1';
 source:{canonical_url:'https://veyfront.com/';route:'/';source_page_sha256:string;scope:'ONE_AUTHORIZED_PUBLIC_HOMEPAGE_HTML'};
 observations:ObservedHTMLFact[];
 counts:Record<ObservedHTMLFact['kind'],number>;
 capabilities:Array<{name:'buyer_action_links'|'direct_contact_links'|'html_inquiry_form_markup';status:'HTML_OBSERVED_NOT_EXECUTED'|'NOT_OBSERVED_IN_CAPTURE';supporting_observation_ids:string[]}>;
 limitations:string[];
 execution:{mode:'READ_ONLY_HTML_FACT_INVENTORY';model_calls:0;generation_calls:0;customer_ready:false;requires_customer_review:true}
}
const obj=(v:unknown):v is Record<string,unknown>=>!!v&&typeof v==='object'&&!Array.isArray(v)
const kinds=['CTA','OFFERING_CANDIDATE','CASE_CANDIDATE','CONTACT_LINK','FORM_MARKUP'] as const
const capabilityNames=['buyer_action_links','direct_contact_links','html_inquiry_form_markup'] as const
const sha=(s:string)=>createHash('sha256').update(s).digest('hex')
const hex=(v:unknown)=>typeof v==='string'&&/^[0-9a-f]{64}$/.test(v)
const bounded=(v:unknown,min:number,max:number)=>typeof v==='string'&&v.length>=min&&v.length<=max
export function validateEvidence(value:unknown,assessment:LiveHomeAssessment):value is EvidenceInventory{
 if(!obj(value)||!obj(value.source)||!obj(value.counts)||!obj(value.execution)||
  value.contract_version!=='l2m.acy.commercial-evidence/0.1')return false
 const s=value.source,x=value.execution
 if(s.canonical_url!==assessment.source.canonical_url||s.route!=='/'||
  s.scope!=='ONE_AUTHORIZED_PUBLIC_HOMEPAGE_HTML'||
  s.source_page_sha256!==assessment.source.pages[0].sha256||
  x.mode!=='READ_ONLY_HTML_FACT_INVENTORY'||x.model_calls!==0||
  x.generation_calls!==0||x.customer_ready!==false||x.requires_customer_review!==true)return false
 if(!Array.isArray(value.observations)||value.observations.length>40||
  !Array.isArray(value.capabilities)||value.capabilities.length!==3||
  !Array.isArray(value.limitations)||value.limitations.length<3||value.limitations.length>8||
  !value.limitations.every(q=>bounded(q,12,280)))return false
 const seen=new Set<string>()
 for(const v of value.observations){
  if(!obj(v)||!kinds.includes(v.kind as typeof kinds[number])||
   !bounded(v.id,24,64)||!/^observed-[a-f0-9]{20}$/.test(v.id as string)||
   seen.has(v.id as string)||v.route!=='/'||
   !bounded(v.selector,1,300)||!bounded(v.excerpt,1,180)||
   !bounded(v.target_observed,0,350)||v.source_page_sha256!==s.source_page_sha256||
   !hex(v.excerpt_sha256)||v.excerpt_sha256!==sha(v.excerpt as string))return false
  const expected=v.kind==='OFFERING_CANDIDATE'?'CANDIDATE_NOT_A_VERIFIED_PRODUCT_OR_SERVICE':
    v.kind==='CASE_CANDIDATE'?'CANDIDATE_NOT_A_VERIFIED_CUSTOMER_CASE':
    v.kind==='FORM_MARKUP'?'HTML_PRESENT_NOT_FUNCTIONALLY_TESTED':'OBSERVED_UNVERIFIED'
  if(v.claim_status!==expected)return false
  seen.add(v.id as string)
 }
 for(const kind of kinds){
  if(value.counts[kind]!==value.observations.filter(o=>(o as ObservedHTMLFact).kind===kind).length)return false
 }
 const countOrder=[value.counts.CTA,value.counts.CONTACT_LINK,value.counts.FORM_MARKUP]
 for(let i=0;i<3;i++){
  const c=value.capabilities[i]
  if(!obj(c)||c.name!==capabilityNames[i]||
   c.status!==(countOrder[i]?'HTML_OBSERVED_NOT_EXECUTED':'NOT_OBSERVED_IN_CAPTURE')||
   !Array.isArray(c.supporting_observation_ids)||c.supporting_observation_ids.length>10||
   !c.supporting_observation_ids.every(id=>typeof id==='string'&&seen.has(id)))return false
 }
 return true
}
