import test from 'node:test'
import assert from 'node:assert/strict'
import { isLiveAssessment, p2a2Enabled } from '../lib/l2m-p2a2.ts'
import { signP2A2, P2A2_APPROVED_URL } from '../lib/acy-p2a2-signature.ts'
import { allowedP2A2Origin } from '../lib/acy-p2a2-origin.ts'

function fixture() {
  return {
    contract_version:'l2m.acy.assessment/0.2',
    assessment_id:'assessment-'+'a'.repeat(20),
    snapshot_id:'public-'+'b'.repeat(20),
    source:{
      type:'AUTHORIZED_PUBLIC_URL_CAPTURE',scope:'CAPTURED_PUBLIC_HOMEPAGE_ONLY',
      source_rights:'USER_ASSERTED_NOT_INDEPENDENTLY_VERIFIED',
      network_fetch_performed:true,canonical_url:'https://veyfront.com/',
      captured_at_utc:'2026-10-31T12:00:00+00:00',manifest_sha256:'c'.repeat(64),
      pages:[{route:'/',sha256:'d'.repeat(64),title_observed:'Test',
        heading_observed:'Test',form_count_observed:0,nav_destinations_in_snapshot:[]}],
    },
    findings:[],
    limitations:['Only homepage was captured'],
    execution:{mode:'DETERMINISTIC_LIVE_HOMEPAGE_ONLY',
      model_calls:0,generation_calls:0,customer_ready:false,review_required:true},
  }
}
test('P2-A2 only exists behind a preview flag',()=>{
  assert.equal(p2a2Enabled({VERCEL_ENV:'production',ACY_P2A2_ENABLED:'true'}),false)
  assert.equal(p2a2Enabled({VERCEL_ENV:'preview',ACY_P2A2_ENABLED:'false'}),false)
  assert.equal(p2a2Enabled({VERCEL_ENV:'preview',ACY_P2A2_ENABLED:'true'}),true)
})
test('Accepts one evidence-only live homepage',()=>{
  assert.equal(isLiveAssessment(fixture()),true)
})
test('Rejects false provenance and false commercial readiness',()=>{
  for (const edit of [
    v=>{v.source.network_fetch_performed=false},
    v=>{v.source.canonical_url='https://internal.local/'},
    v=>{v.source.pages.push({...v.source.pages[0],route:'/contact/'})},
    v=>{v.execution.model_calls=1},
    v=>{v.execution.customer_ready=true},
    v=>{v.execution.mode='AI_COMMERCIAL_DIAGNOSIS'},
    v=>{v.source.source_rights='VERIFIED_BY_VEYFRONT'},
  ]) {
    const c=fixture();edit(c);assert.equal(isLiveAssessment(c),false)
  }
})
test('Rejects findings whose evidence hash or route does not match',()=>{
  const c=fixture()
  c.findings.push({code:'UNSUPPORTED',severity:'review',route:'/',
    source_page_sha256:'e'.repeat(64),observation:'Claim',suggested_next_step:'Review',
    claim_type:'BOUNDED_OBSERVATION',customer_verified:false})
  assert.equal(isLiveAssessment(c),false)
})

test('HMAC proof matches the independent Python L2M cross-language test vector',()=>{
  const signature=signP2A2(100000, '0123456789abcdef'.repeat(2), 'a'.repeat(40))
  assert.equal(P2A2_APPROVED_URL,'https://veyfront.com/')
  assert.equal(signature,'4e49e44bc1c7bc3424ac8b85b354d156bbab03a000e0c1769e1418a298780c7d')
  assert.notEqual(signature,signP2A2(100001,'0123456789abcdef'.repeat(2),'a'.repeat(40)))
})

test('Vercel Preview alias requires exact origin and cannot weaken production',()=>{
 const allowed='https://veyfront-git-feature-acy-p2a2-3988c5-gloweaseco-1757s-projects.vercel.app'
 const testRequest = origin=>({url:'https://veyfront-immutable-hash.vercel.app/api/acy/p2a2',headers:new Headers(origin?{origin}:{})})
 const preview={VERCEL_ENV:'preview',ACY_P2A2_ALLOWED_ORIGIN:allowed}
 assert.equal(allowedP2A2Origin(testRequest(allowed),preview),true)
 assert.equal(allowedP2A2Origin(testRequest(allowed),{...preview,VERCEL_ENV:'production'}),false)
 assert.equal(allowedP2A2Origin(testRequest('https://evil.example'),preview),false)
 assert.equal(allowedP2A2Origin(testRequest('https://veyfront.com'),preview),false)
 assert.equal(allowedP2A2Origin(testRequest(null),preview),false)
 assert.equal(allowedP2A2Origin(testRequest(allowed),{...preview,ACY_P2A2_ALLOWED_ORIGIN:'https://evil.example'}),false)
})

test('Origin-less protected browser POST is allowed only with same-origin Fetch Metadata',()=>{
 const allowed='https://veyfront-git-feature-acy-p2a2-3988c5-gloweaseco-1757s-projects.vercel.app'
 const preview={VERCEL_ENV:'preview',ACY_P2A2_ALLOWED_ORIGIN:allowed}
 const req = (fetchSite,marker)=>({url:'https://veyfront-random.vercel.app/api/acy/p2a2',
   headers:new Headers({'sec-fetch-site':fetchSite,'x-acy-preview-request':marker})})
 assert.equal(allowedP2A2Origin(req('same-origin','p2a2'),preview),true)
 assert.equal(allowedP2A2Origin(req('cross-site','p2a2'),preview),false)
 assert.equal(allowedP2A2Origin(req('same-site','p2a2'),preview),false)
 assert.equal(allowedP2A2Origin(req('same-origin','incorrect'),preview),false)
 assert.equal(allowedP2A2Origin(req('same-origin','p2a2'),{...preview,VERCEL_ENV:'production'}),false)
})
