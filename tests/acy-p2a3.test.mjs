import test from 'node:test'
import assert from 'node:assert/strict'
import {p2a3Enabled,isGroundedPlan} from '../lib/l2m-p2a3.ts'
import {allowedP2A3Origin} from '../lib/acy-p2a3-origin.ts'

function fixture(){
 const assessment={
  contract_version:'l2m.acy.assessment/0.2',assessment_id:'assessment-'+'a'.repeat(20),
  snapshot_id:'public-'+'9'.repeat(20),
  source:{type:'AUTHORIZED_PUBLIC_URL_CAPTURE',scope:'CAPTURED_PUBLIC_HOMEPAGE_ONLY',
   source_rights:'USER_ASSERTED_NOT_INDEPENDENTLY_VERIFIED',network_fetch_performed:true,
   canonical_url:'https://veyfront.com/',captured_at_utc:'2026-11-01T00:15:21Z',
   manifest_sha256:'c'.repeat(64),pages:[{route:'/',sha256:'b'.repeat(64),
    title_observed:'Title',heading_observed:'Heading',form_count_observed:0,nav_destinations_in_snapshot:[]}]},
  findings:[],limitations:[],execution:{mode:'DETERMINISTIC_LIVE_HOMEPAGE_ONLY',
   model_calls:0,generation_calls:0,customer_ready:false,review_required:true}
 }
 const stages=['discover','understand','trust','convert']
 const codes=['CHANNEL_DISCOVERY_REVIEW','BUYER_CLARITY_REVIEW','PROOF_REQUIREMENTS_REVIEW','INQUIRY_PATH_REVIEW']
 const basis=['SCOPE_LIMITATION','OBSERVED_METADATA','SCOPE_LIMITATION','OBSERVED_METADATA']
 const fields=['capture_scope','title_heading_observed','capture_scope','form_count_observed']
 const plan={contract_version:'l2m.acy.plan/0.1',plan_id:'plan-'+'e'.repeat(20),
  assessment_id:assessment.assessment_id,source_manifest_sha256:assessment.source.manifest_sha256,
  source:{canonical_url:'https://veyfront.com/',route:'/',page_sha256:'b'.repeat(64),scope:'SINGLE_LIVE_HTML_HOMEPAGE'},
  context:{observed:{title:'Title',heading:'Heading',html_form_count:0,nav_destinations_in_snapshot:[]},
   unknowns:['Buyers','Proof','Markets','Channels']},
  opportunities:stages.map((stage,i)=>({id:codes[i],stage,claim_status:'UNVERIFIED_HYPOTHESIS',
   evidence:{route:'/',source_page_sha256:'b'.repeat(64),basis:basis[i],observed_field:fields[i]},
   hypothesis:'Not enough captured evidence to conclude.',proposed_action:'Review authorized customer evidence.',
   customer_question:'What evidence would a real buyer need?',review_required:true})),
  execution:{mode:'DETERMINISTIC_EVIDENCE_GROUNDED_HYPOTHESES',
   model_calls:0,generation_calls:0,customer_ready:false,plan_ready:false,requires_customer_confirmation:true},
  limitations:['Only homepage','Unverified content','No generative planner']
 }
 return {assessment,plan}
}

test('P2-A3 is unavailable on production, other branches or without flag',()=>{
 assert.equal(p2a3Enabled({VERCEL_ENV:'preview',ACY_P2A3_ENABLED:'true',VERCEL_GIT_COMMIT_REF:'feature/acy-p2a3-consumer'}),true)
 assert.equal(p2a3Enabled({VERCEL_ENV:'production',ACY_P2A3_ENABLED:'true',VERCEL_GIT_COMMIT_REF:'feature/acy-p2a3-consumer'}),false)
 assert.equal(p2a3Enabled({VERCEL_ENV:'preview',ACY_P2A3_ENABLED:'false',VERCEL_GIT_COMMIT_REF:'feature/acy-p2a3-consumer'}),false)
 assert.equal(p2a3Enabled({VERCEL_ENV:'preview',ACY_P2A3_ENABLED:'true',VERCEL_GIT_COMMIT_REF:'feature/acy-p2a2-consumer'}),false)
})
test('Plan is precisely linked to observed source and unverified hypotheses',()=>{
 const {assessment,plan}=fixture()
 assert.equal(isGroundedPlan(plan,assessment),true)
})
test('Rejects contradictory evidence and fabricated commercial readiness',()=>{
 const paths=[
  a=>a.plan.source.page_sha256='d'.repeat(64),
  a=>a.plan.source_manifest_sha256='d'.repeat(64),
  a=>a.plan.assessment_id='assessment-'+'0'.repeat(20),
  a=>a.plan.context.observed.html_form_count=99,
  a=>a.plan.context.observed.title='Different title',
  a=>a.plan.opportunities[0].claim_status='VERIFIED_FACT',
  a=>a.plan.opportunities[2].evidence.source_page_sha256='f'.repeat(64),
  a=>a.plan.opportunities[1].evidence.observed_field='not-evidence',
  a=>a.plan.opportunities[3].review_required=false,
  a=>a.plan.execution.model_calls=1,
  a=>a.plan.execution.plan_ready=true,
  a=>a.plan.execution.customer_ready=true,
  a=>a.plan.context.unknowns=[],
 ]
 for(const m of paths){const a=fixture();m(a);assert.equal(isGroundedPlan(a.plan,a.assessment),false)}
})
test('Protected browser origin guard requires exact branch or same-origin metadata + marker',()=>{
 const alias='https://veyfront-git-feature-acy-p2a3-9999-gloweaseco-1757s-projects.vercel.app'
 const env={VERCEL_ENV:'preview',ACY_P2A3_ALLOWED_ORIGIN:alias}
 const req=(h)=>({url:'https://veyfront-hash.vercel.app/api/acy/p2a3',headers:new Headers(h)})
 assert.equal(allowedP2A3Origin(req({origin:alias}),env),true)
 assert.equal(allowedP2A3Origin(req({origin:'https://evil.example'}),env),false)
 assert.equal(allowedP2A3Origin(req({'sec-fetch-site':'same-origin','x-acy-preview-request':'p2a3'}),env),true)
 assert.equal(allowedP2A3Origin(req({'sec-fetch-site':'cross-site','x-acy-preview-request':'p2a3'}),env),false)
 assert.equal(allowedP2A3Origin(req({'sec-fetch-site':'same-origin','x-acy-preview-request':'p2a2'}),env),false)
 assert.equal(allowedP2A3Origin(req({'sec-fetch-site':'same-origin','x-acy-preview-request':'p2a3'}),{...env,VERCEL_ENV:'production'}),false)
})
