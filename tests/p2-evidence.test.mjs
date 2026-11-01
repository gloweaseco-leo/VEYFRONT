import test from 'node:test'
import assert from 'node:assert/strict'
import {createHash,randomUUID} from 'node:crypto'
import {registerHooks} from 'node:module'
registerHooks({resolve(specifier,context,nextResolve){
 if(context.parentURL?.endsWith('.ts')&&specifier.startsWith('.')&&!/\.(ts|js|mjs|json)$/.test(specifier))
  return nextResolve(specifier+'.ts',context)
 return nextResolve(specifier,context)
}})
const {validateEvidence}=await import('../lib/l2m-p2-evidence.ts')
const {makeP2Review}=await import('../lib/p0-p2-service.ts')
const {makeP0,changeP0,beginP2Review,linkP2Review,verifyLedger}=await import('../lib/p0-journey.ts')
const sha=s=>createHash('sha256').update(s).digest('hex')
const SRC='b'.repeat(64),MANIFEST='c'.repeat(64)
function packet(){
 const assessment={
  contract_version:'l2m.acy.assessment/0.2',assessment_id:'assessment-'+'a'.repeat(20),snapshot_id:'public-'+'9'.repeat(20),
  source:{type:'AUTHORIZED_PUBLIC_URL_CAPTURE',scope:'CAPTURED_PUBLIC_HOMEPAGE_ONLY',
   source_rights:'USER_ASSERTED_NOT_INDEPENDENTLY_VERIFIED',network_fetch_performed:true,
   canonical_url:'https://veyfront.com/',captured_at_utc:'2026-11-01T02:00:00Z',
   manifest_sha256:MANIFEST,pages:[{route:'/',sha256:SRC,title_observed:'Buyer website',
    heading_observed:'Industrial products',form_count_observed:1,nav_destinations_in_snapshot:[]}]},
  findings:[],limitations:[],execution:{mode:'DETERMINISTIC_LIVE_HOMEPAGE_ONLY',
   model_calls:0,generation_calls:0,customer_ready:false,review_required:true}
 }
 const counts={CTA:1,OFFERING_CANDIDATE:0,CASE_CANDIDATE:0,CONTACT_LINK:0,FORM_MARKUP:0}
 const excerpt='Request a quotation',selector='main:nth-of-type(1) > a:nth-of-type(1)'
 const observations=[{id:'observed-'+'f'.repeat(20),kind:'CTA',claim_status:'OBSERVED_UNVERIFIED',
  route:'/',selector,source_page_sha256:SRC,excerpt,excerpt_sha256:sha(excerpt),
  target_observed:'https://veyfront.com/contact'}]
 const evidence={contract_version:'l2m.acy.commercial-evidence/0.1',
  source:{canonical_url:'https://veyfront.com/',route:'/',source_page_sha256:SRC,
   scope:'ONE_AUTHORIZED_PUBLIC_HOMEPAGE_HTML'},observations,counts,
  capabilities:[
   {name:'buyer_action_links',status:'HTML_OBSERVED_NOT_EXECUTED',supporting_observation_ids:[observations[0].id]},
   {name:'direct_contact_links',status:'NOT_OBSERVED_IN_CAPTURE',supporting_observation_ids:[]},
   {name:'html_inquiry_form_markup',status:'NOT_OBSERVED_IN_CAPTURE',supporting_observation_ids:[]}
  ],limitations:['One page only; no external interaction.',
   'Customer case claims not verified.', 'Absence only describes this HTML snapshot.'],
  execution:{mode:'READ_ONLY_HTML_FACT_INVENTORY',model_calls:0,generation_calls:0,customer_ready:false,requires_customer_review:true}
 }
 const plan={contract_version:'l2m.acy.plan/0.1',plan_id:'plan-'+'e'.repeat(20),
  assessment_id:assessment.assessment_id,source_manifest_sha256:MANIFEST,
  source:{canonical_url:'https://veyfront.com/',route:'/',page_sha256:SRC,scope:'SINGLE_LIVE_HTML_HOMEPAGE'},
  context:{observed:{title:'Buyer website',heading:'Industrial products',
   html_form_count:1,nav_destinations_in_snapshot:[]},unknowns:['Buyer tasks','Proof','Markets','Conversion']},
  opportunities:['discover','understand','trust','convert'].map((stage,i)=>({
   id:['CHANNEL_DISCOVERY_REVIEW','BUYER_CLARITY_REVIEW','PROOF_REQUIREMENTS_REVIEW','INQUIRY_PATH_REVIEW'][i],
   stage,claim_status:'UNVERIFIED_HYPOTHESIS',
   evidence:{route:'/',source_page_sha256:SRC,
    basis:['SCOPE_LIMITATION','OBSERVED_METADATA','SCOPE_LIMITATION','OBSERVED_METADATA'][i],
    observed_field:['capture_scope','title_heading_observed','capture_scope','form_count_observed'][i]},
   hypothesis:'Unverified evidence requires review.',proposed_action:'Collect customer corroboration.',
   customer_question:'What is the verified fact?',review_required:true
  })),execution:{mode:'DETERMINISTIC_EVIDENCE_GROUNDED_HYPOTHESES',
   model_calls:0,generation_calls:0,customer_ready:false,plan_ready:false,requires_customer_confirmation:true},
  limitations:['Only authorized homepage','Cases are not verified','No generative planner was called']
 }
 return {ok:true,assessment:{...assessment,commercial_evidence:evidence},plan}
}
function qualified(){
 const initial=makeP0({service:'rebuild',name:'Synthetic',email:'qa@example.invalid',
  company:'VEYFRONT QA',website:'https://veyfront.com/',markets:'European Union',
  details:'Synthetic evidence contract test only.'},randomUUID(),'x'.repeat(45),
  new Date('2026-11-01T01:00:00Z')).journey
 const step=changeP0(initial,{actionId:randomUUID(),type:'complete_brief',
  markets:'European Union',desiredAction:'Request quotation'})
 assert.equal(step.kind,'updated')
 const reservation=beginP2Review(step.journey,randomUUID())
 assert.equal(reservation.kind,'updated')
 return reservation.journey
}
test('source-bound commercial evidence validation rejects forged observation, capability and claims',()=>{
 const original=packet()
 assert.equal(validateEvidence(original.assessment.commercial_evidence,original.assessment),true)
 for(const mutate of [
  p=>p.assessment.commercial_evidence.observations[0].excerpt='Fake case study',
  p=>p.assessment.commercial_evidence.source.source_page_sha256='d'.repeat(64),
  p=>p.assessment.commercial_evidence.counts.CTA=99,
  p=>p.assessment.commercial_evidence.observations[0].claim_status='CUSTOMER_VERIFIED',
  p=>p.assessment.commercial_evidence.capabilities[0].status='FUNCTIONAL_TEST_PASS',
  p=>p.assessment.commercial_evidence.execution.model_calls=1
 ]){
  const p=structuredClone(original);mutate(p)
  assert.equal(validateEvidence(p.assessment.commercial_evidence,p.assessment),false)
 }
})
test('P0 signed P2 review accepts new facts only from evidence endpoint, stores same-record manifest',async()=>{
 const before=qualified()
 const endpoint='https://l2m-acy-p2a-preview-git-featur-a7e4a7-gloweaseco-1757s-projects.vercel.app/api/acy_evidence'
 process.env.ACY_P2_FACTS_ENABLED='true'
 let calls=0
 try{
  const evidence=packet()
  const result=await makeP2Review(before,'header.body.signature',{
   endpoint,secret:'sample-only-'+ 'z'.repeat(48),now:new Date('2026-11-01T01:30:00Z'),
   fetchFn:async (url,options)=>{
    calls++
    assert.equal(url.pathname,'/api/acy_evidence')
    const payload=JSON.parse(options.body)
    assert.equal(payload.url,'https://veyfront.com/')
    assert.match(payload.signature,/^[a-f0-9]{64}$/)
    return Response.json(evidence)
   }
  })
  assert.equal(calls,1)
  assert.equal(result.commercialEvidence.observations.length,1)
  assert.equal(result.commercialEvidenceSha256,sha(JSON.stringify(result.commercialEvidence)))
  const linked=linkP2Review(before,result,before.p2Attempt.actionId)
  assert.equal(linked.kind,'updated')
  assert.equal(verifyLedger(linked.journey),true)
  const modified=structuredClone(linked.journey)
  modified.p2.commercialEvidence.observations[0].excerpt='altered'
  assert.equal(verifyLedger(modified),false)
 }finally{delete process.env.ACY_P2_FACTS_ENABLED}
})
