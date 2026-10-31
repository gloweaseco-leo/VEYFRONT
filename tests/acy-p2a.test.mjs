import test from 'node:test'
import assert from 'node:assert/strict'
import { isL2MAssessment, p2aPreviewEnabled } from '../lib/l2m-p2a.ts'
function fixture() {
 return {
  contract_version:'l2m.acy.assessment/0.1',assessment_id:'assessment-'+'a'.repeat(20),
  snapshot_id:'qa-alt-treesite',
  source:{type:'AUTHORIZED_LOCAL_HTML_SNAPSHOT',inventory_schema:'site-snapshot-inventory/0.2',scope:'SUPPLIED_PAGES_ONLY',source_rights:'NOT_VERIFIED',
   manifest_sha256:'b'.repeat(64),network_fetch_performed:false,evidence_ids:[],
   pages:[{route:'/',sha256:'c'.repeat(64),title_observed:'QA',heading_observed:'QA',form_count_observed:0,nav_destinations_in_snapshot:[]}]},
  findings:[],limitations:['This is not a live crawl'],
  execution:{mode:'DETERMINISTIC_EVIDENCE_ONLY',model_calls:0,generation_calls:0,customer_ready:false,review_required:true}
 }
}
test('P2-A remains disabled on production',()=>{
 assert.equal(p2aPreviewEnabled({VERCEL_ENV:'production',ACY_P2A_ENABLED:'true'}),false)
 assert.equal(p2aPreviewEnabled({VERCEL_ENV:'preview',ACY_P2A_ENABLED:'true'}),true)
})
test('strict L2M contract accepts evidence-only QA data',()=>{
 assert.equal(isL2MAssessment(fixture()),true)
})
test('rejects forged commercial readiness, live crawl or model invocation',()=>{
 for(const edit of [
  v=>{v.execution.customer_ready=true},
  v=>{v.execution.model_calls=1},
  v=>{v.source.network_fetch_performed=true},
  v=>{v.snapshot_id='https://somewhere.example'},
  v=>{v.source.pages[0].sha256='invalid'},
 ]){
  const c=fixture();edit(c);assert.equal(isL2MAssessment(c),false)
 }
})
test('rejects unsupported findings with unknown evidence',()=>{
 const c=fixture();c.findings.push({code:'FAKE',severity:'review',route:'/other/',source_page_sha256:'d'.repeat(64),
  observation:'fake',suggested_next_step:'none',claim_type:'BOUNDED_OBSERVATION',customer_verified:false})
 assert.equal(isL2MAssessment(c),false)
})
