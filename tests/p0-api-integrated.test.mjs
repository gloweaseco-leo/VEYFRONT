import test from 'node:test'
import assert from 'node:assert/strict'
import {registerHooks} from 'node:module'
import {randomUUID} from 'node:crypto'

const blobCode=`
const objects=new Map()
export async function put(path,value,options={}){
 const old=objects.get(path)
 if(old&&options.allowOverwrite===false)throw new Error('DUPLICATE_BLOB')
 if(options.ifMatch&&(!old||options.ifMatch!==old.etag))throw new Error('ETAG_CONFLICT')
 const etag=String(Number(old?.etag||0)+1)
 objects.set(path,{value,etag})
 return {pathname:path,etag}
}
export async function head(path){const x=objects.get(path);return x?{etag:x.etag}:null}
export async function get(path){const x=objects.get(path);return x?{stream:new Response(x.value).body}:null}
`
const dataUrl='data:text/javascript;base64,'+Buffer.from(blobCode).toString('base64')
registerHooks({resolve(specifier,context,nextResolve){
 if(specifier==='@vercel/blob')return {url:dataUrl,shortCircuit:true}
 if(specifier.startsWith('@/lib/'))return nextResolve(new URL('../lib/'+specifier.slice(6)+'.ts',import.meta.url).href,context)
 if(context.parentURL?.endsWith('.ts')&&specifier.startsWith('.')&&!/\.(ts|js|mjs|json)$/.test(specifier))
   return nextResolve(specifier+'.ts',context)
 return nextResolve(specifier,context)
}})
const {receiveP0}=await import('../lib/p0-intake.ts')
const {POST}=await import('../app/api/acy/p0/route.ts')
const alias='https://veyfront-git-feature-p0-unifie-af1514-gloweaseco-1757s-projects.vercel.app'
const secret='P0-API-INTEGRATION-SECRET-'+'x'.repeat(44)
Object.assign(process.env,{
 VERCEL_ENV:'preview',VERCEL_GIT_COMMIT_REF:'feature/p0-unified-journey-ledger',ACY_P0_ENABLED:'true',
 ACY_P0_ALLOWED_ORIGIN:alias,ACY_P0_IDEMPOTENCY_SECRET:secret,BLOB_READ_WRITE_TOKEN:'fake-private-storage',
 L2M_ACY_P0_UPSTREAM_URL:'https://l2m-acy-p2a-preview-git-featur-a7e4a7-gloweaseco-1757s-projects.vercel.app/api/acy_plan',
 L2M_ACY_P0_SERVICE_TOKEN:'P2-API-INTEGRATION-'+ 'y'.repeat(44)
})
delete process.env.ACY_P0_QA_RESEND_KEY
const hdr={'origin':alias,'content-type':'application/json','x-vf-preview-p0':'journey','x-vercel-oidc-token':'header.body.signature'}
function request(body){return new Request(alias+'/api/acy/p0',{method:'POST',headers:hdr,body:JSON.stringify(body)})}
function fixture(){
 const assessment={contract_version:'l2m.acy.assessment/0.2',assessment_id:'assessment-'+'a'.repeat(20),
  snapshot_id:'public-'+'9'.repeat(20),source:{type:'AUTHORIZED_PUBLIC_URL_CAPTURE',
  scope:'CAPTURED_PUBLIC_HOMEPAGE_ONLY',source_rights:'USER_ASSERTED_NOT_INDEPENDENTLY_VERIFIED',
  network_fetch_performed:true,canonical_url:'https://veyfront.com/',
  captured_at_utc:'2026-11-01T00:15:21Z',manifest_sha256:'c'.repeat(64),
  pages:[{route:'/',sha256:'b'.repeat(64),title_observed:'VEYFRONT',heading_observed:'Building Digital Frontiers',
   form_count_observed:0,nav_destinations_in_snapshot:[]}]},findings:[],limitations:[],
  execution:{mode:'DETERMINISTIC_LIVE_HOMEPAGE_ONLY',model_calls:0,generation_calls:0,customer_ready:false,review_required:true}}
 const plan={contract_version:'l2m.acy.plan/0.1',plan_id:'plan-'+'d'.repeat(20),
  assessment_id:assessment.assessment_id,source_manifest_sha256:assessment.source.manifest_sha256,
  source:{canonical_url:'https://veyfront.com/',route:'/',page_sha256:'b'.repeat(64),scope:'SINGLE_LIVE_HTML_HOMEPAGE'},
  context:{observed:{title:'VEYFRONT',heading:'Building Digital Frontiers',html_form_count:0,nav_destinations_in_snapshot:[]},
  unknowns:['Buyer markets','Buyer roles','Evidence rights','Inquiry conversion']},
  opportunities:['discover','understand','trust','convert'].map((stage,i)=>({
   id:['CHANNEL_DISCOVERY_REVIEW','BUYER_CLARITY_REVIEW','PROOF_REQUIREMENTS_REVIEW','INQUIRY_PATH_REVIEW'][i],stage,
   claim_status:'UNVERIFIED_HYPOTHESIS',evidence:{route:'/',source_page_sha256:'b'.repeat(64),
   basis:['SCOPE_LIMITATION','OBSERVED_METADATA','SCOPE_LIMITATION','OBSERVED_METADATA'][i],
   observed_field:['capture_scope','title_heading_observed','capture_scope','form_count_observed'][i]},
   hypothesis:'Evidence needs customer verification.',proposed_action:'Ask for corroboration.',
   customer_question:'What claim can you independently verify?',review_required:true
  })),execution:{mode:'DETERMINISTIC_EVIDENCE_GROUNDED_HYPOTHESES',model_calls:0,generation_calls:0,
   customer_ready:false,plan_ready:false,requires_customer_confirmation:true},
   limitations:['Only one HTML page','All hypotheses unverified','No sales or generation']}
 return {ok:true,assessment,plan}
}
test('real P0 API + mocked private CAS + bounded P2 provider use one Journey; P3/P4 never execute',async()=>{
 const info={service:'rebuild',name:'Synthetic QA',email:'qa@example.invalid',company:'Internal QA',
  website:'https://veyfront.com/',markets:'',details:'Internal synthetic project for P1 to P2 same journey contract.'}
 const key=randomUUID()
 const created=await receiveP0({url:alias+'/api/leads',headers:new Headers({'x-vf-intake-key':key})},info)
 assert.equal(created.status,201)
 const data=await created.json()
 assert.equal(data.journey.status,'needs_completion')
 const p=new URLSearchParams(new URL(data.resumeUrl).hash.slice(1)),id=p.get('id'),token=p.get('token')
 assert.equal((await POST(request({op:'read',id,token}))).status,200)
 assert.equal((await POST(request({op:'read',id,token:'badtoken'}))).status,404)
 assert.equal((await POST(request({op:'assess_p2',id,token,actionId:randomUUID(),authorization_confirmed:true}))).status,422)
 assert.equal((await POST(request({op:'update',id,token,type:'complete_brief',actionId:randomUUID(),
  markets:'European Union',desiredAction:'Request quote'}))).status,200)
 assert.equal((await POST(request({op:'assess_p2',id,token,actionId:randomUUID(),authorization_confirmed:false}))).status,422)
 let calls=0
 const original=globalThis.fetch
 globalThis.fetch=async(target,init)=>{
  calls++
  assert.equal(new URL(target).pathname,'/api/acy_plan')
  const body=JSON.parse(init.body)
  assert.equal(body.url,'https://veyfront.com/')
  assert.equal(body.authorization_confirmed,true)
  assert.match(body.signature,/^[a-f0-9]{64}$/)
  return Response.json(fixture())
 }
 try{
  const outcome=await POST(request({op:'assess_p2',id,token,actionId:randomUUID(),authorization_confirmed:true}))
  assert.equal(outcome.status,200)
  const response=await outcome.json()
  assert.equal(response.journey.p2.status,'REVIEW_REQUIRED')
  assert.equal(response.journey.ledger.integrity,'HASH_CHAIN_VALID')
  assert.equal(response.journey.ledger.stages.length,2)
  assert.equal(response.journey.ledger.stages[1].status,'REVIEW_REQUIRED')
  assert.equal(response.journey.p2.opportunities.length,4)
  assert.equal(response.journey.ledger.costs.knownMinorUnits,null)
  assert.equal(calls,1)
  const recovered=await POST(request({op:'read',id,token}))
  assert.equal(recovered.status,200)
  assert.equal((await recovered.json()).journey.p2.planId,'plan-'+'d'.repeat(20))
  const repeated=await POST(request({op:'assess_p2',id,token,actionId:randomUUID(),authorization_confirmed:true}))
  assert.equal(repeated.status,200)
  assert.equal((await repeated.json()).duplicate,true)
  assert.equal(calls,1)
 }finally{globalThis.fetch=original}
})
