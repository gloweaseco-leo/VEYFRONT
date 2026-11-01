import test from 'node:test'
import assert from 'node:assert/strict'
import {registerHooks} from 'node:module'
import {randomUUID} from 'node:crypto'
registerHooks({resolve(specifier,context,nextResolve){
 if(context.parentURL?.endsWith('.ts')&&specifier.startsWith('.')&&!/\.(ts|js|mjs|json)$/.test(specifier))
  return nextResolve(specifier+'.ts',context)
 return nextResolve(specifier,context)
}})
const {makeP2Review,P2ReviewError}=await import('../lib/p0-p2-service.ts')
const {makeP0,changeP0,beginP2Review,linkP2Review,verifyLedger}=await import('../lib/p0-journey.ts')

const address='https://l2m-acy-p2a-preview-git-featur-a7e4a7-gloweaseco-1757s-projects.vercel.app/api/acy_plan'
const options={endpoint:address,secret:'test-only-p2-hmac-'+ 'x'.repeat(48),now:new Date('2026-11-01T00:30:00Z')}
function qualified(website='https://veyfront.com/',service='rebuild'){
 const initial=makeP0({service,name:'Internal Tester',email:'qa@example.invalid',company:'VEYFRONT QA',
  website,markets:'European Union',details:'Internal test of an owned public homepage review.'},randomUUID(),
  'test-internal-'+ 's'.repeat(45),new Date('2026-11-01T00:00:00Z')).journey
 const completed=changeP0(initial,{type:'complete_brief',markets:'European Union',desiredAction:'Request quotation',actionId:randomUUID()})
 assert.equal(completed.kind,'updated')
 return completed.journey
}
function packet(){
 const assessment={
  contract_version:'l2m.acy.assessment/0.2',assessment_id:'assessment-'+'a'.repeat(20),snapshot_id:'public-'+'9'.repeat(20),
  source:{type:'AUTHORIZED_PUBLIC_URL_CAPTURE',scope:'CAPTURED_PUBLIC_HOMEPAGE_ONLY',
   source_rights:'USER_ASSERTED_NOT_INDEPENDENTLY_VERIFIED',network_fetch_performed:true,
   canonical_url:'https://veyfront.com/',captured_at_utc:'2026-11-01T00:15:21Z',manifest_sha256:'c'.repeat(64),
   pages:[{route:'/',sha256:'b'.repeat(64),title_observed:'Observed brand',heading_observed:'Global business',
    form_count_observed:0,nav_destinations_in_snapshot:[]}]},
  findings:[],limitations:[],execution:{mode:'DETERMINISTIC_LIVE_HOMEPAGE_ONLY',model_calls:0,
   generation_calls:0,customer_ready:false,review_required:true}
 }
 const plan={contract_version:'l2m.acy.plan/0.1',plan_id:'plan-'+'e'.repeat(20),assessment_id:assessment.assessment_id,
  source_manifest_sha256:assessment.source.manifest_sha256,
  source:{canonical_url:'https://veyfront.com/',route:'/',page_sha256:'b'.repeat(64),scope:'SINGLE_LIVE_HTML_HOMEPAGE'},
  context:{observed:{title:'Observed brand',heading:'Global business',html_form_count:0,nav_destinations_in_snapshot:[]},
   unknowns:['Buyer roles','Proof','Conversion','Market']},
  opportunities:['discover','understand','trust','convert'].map((stage,i)=>({
   id:['CHANNEL_DISCOVERY_REVIEW','BUYER_CLARITY_REVIEW','PROOF_REQUIREMENTS_REVIEW','INQUIRY_PATH_REVIEW'][i],
   stage,claim_status:'UNVERIFIED_HYPOTHESIS',
   evidence:{route:'/',source_page_sha256:'b'.repeat(64),basis:['SCOPE_LIMITATION','OBSERVED_METADATA','SCOPE_LIMITATION','OBSERVED_METADATA'][i],
    observed_field:['capture_scope','title_heading_observed','capture_scope','form_count_observed'][i]},
   hypothesis:'No verified deficiency is established.',proposed_action:'Ask for evidence before changing the site.',
   customer_question:'What independently verified evidence do you have?',review_required:true
  })),
  execution:{mode:'DETERMINISTIC_EVIDENCE_GROUNDED_HYPOTHESES',model_calls:0,generation_calls:0,
   customer_ready:false,plan_ready:false,requires_customer_confirmation:true},
  limitations:['Single page only','All hypotheses require verification','No generated plan or priced offer']
 }
 return {ok:true,assessment,plan}
}
test('P2 cannot scan external URLs, Launch, unqualified intake or missing OIDC',async()=>{
 for(const bad of [qualified('https://example.com/'),qualified('https://veyfront.com/contact'),
  qualified('https://veyfront.com/','launch')]){
  await assert.rejects(makeP2Review(bad,'header.body.signature',options),e=>e instanceof P2ReviewError&&e.category==='NOT_ELIGIBLE')
 }
 const j=qualified()
 await assert.rejects(makeP2Review(j,null,options),e=>e.category==='IDENTITY_REQUIRED')
 await assert.rejects(makeP2Review(j,'header.body.signature',{...options,endpoint:'https://attacker.vercel.app/api/acy_plan'}),
  e=>e.category==='NOT_CONFIGURED')
})
test('P2 verifies HMAC envelope and versioned live source/plan before linking a single Journey',async()=>{
 const j=qualified(),nonce=randomUUID(),started=beginP2Review(j,nonce,new Date('2026-11-01T00:28:00Z'))
 assert.equal(started.kind,'updated')
 let outbound=0
 const fetchFn=async(url,init)=>{
  outbound++
  assert.equal(url.hostname,'l2m-acy-p2a-preview-git-featur-a7e4a7-gloweaseco-1757s-projects.vercel.app')
  assert.equal(init.headers['x-vercel-trusted-oidc-idp-token'],'header.body.signature')
  const payload=JSON.parse(init.body)
  assert.equal(payload.url,'https://veyfront.com/')
  assert.equal(payload.authorization_confirmed,true)
  assert.match(payload.signature,/^[a-f0-9]{64}$/)
  assert.equal(payload.issued_at,Math.floor(options.now.getTime()/1000))
  return Response.json(packet())
 }
 const review=await makeP2Review(started.journey,'header.body.signature',{...options,fetchFn})
 assert.equal(outbound,1)
 assert.equal(review.status,'REVIEW_REQUIRED')
 assert.equal(review.sourcePageSha256,'b'.repeat(64))
 assert.equal(review.opportunities.length,4)
 assert.equal(review.opportunities.every(x=>x.claim==='UNVERIFIED_HYPOTHESIS'),true)
 const linked=linkP2Review(started.journey,review,nonce)
 assert.equal(linked.kind,'updated')
 assert.equal(verifyLedger(linked.journey),true)
 assert.equal(linked.journey.p2.planId,'plan-'+'e'.repeat(20))
 assert.equal(linked.journey.events.at(-1).evidence.sha256,'b'.repeat(64))
 assert.deepEqual([linked.journey.costs.modelCalls,linked.journey.costs.generationCalls],[0,0])
 await assert.rejects(makeP2Review(linked.journey,'header.body.signature',options),e=>e.category==='NOT_ELIGIBLE')
})
test('P2 rejects forged hashes, invented verified claims and upstream failures',async()=>{
 const j=qualified()
 for(const mutate of [
  x=>{x.plan.source.page_sha256='f'.repeat(64)},
  x=>{x.plan.opportunities[0].claim_status='VERIFIED_DEFICIENCY'},
  x=>{x.plan.execution.model_calls=1},
  x=>{x.assessment.source.network_fetch_performed=false},
  x=>{x.assessment.source.pages.push({...x.assessment.source.pages[0]})}
 ]){
  const d=packet();mutate(d)
  await assert.rejects(makeP2Review(j,'header.body.signature',{...options,fetchFn:async()=>Response.json(d)}),
   e=>e.category==='INVALID_EVIDENCE')
 }
 await assert.rejects(makeP2Review(j,'header.body.signature',{...options,fetchFn:async()=>new Response('{}',{status:401})}),
  e=>e.category==='UPSTREAM_FAILED')
})
