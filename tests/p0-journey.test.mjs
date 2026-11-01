import test from 'node:test'
import assert from 'node:assert/strict'
import {randomUUID} from 'node:crypto'
import {enabledP0,p0Origin,qaOnly,idempotentIdentity,makeP0,authentic,changeP0,visibleP0,recordDelivery,verifyLedger,beginP2Review,linkP2Review,failP2Review} from '../lib/p0-journey.ts'
import {deriveStatus,missingBriefFields} from '../lib/acy-p1.ts'

const SECRET='P0-TEST-SECRET-'+'z'.repeat(50)
const key=randomUUID()
const input={service:'rebuild',name:'Test Client',email:'qa@example.invalid',company:'Test Company',website:'https://example.com',
 markets:'',details:'Synthetic QA test for unified journey continuity. No real client information.'}
const build=(nonce=key)=>makeP0(input,nonce,SECRET,new Date('2026-11-01T00:00:00Z'))

test('branch-fenced Preview is never active in production',()=>{
 assert.equal(enabledP0({VERCEL_ENV:'preview',ACY_P0_ENABLED:'true',VERCEL_GIT_COMMIT_REF:'feature/p0-unified-journey-ledger'}),true)
 assert.equal(enabledP0({VERCEL_ENV:'production',ACY_P0_ENABLED:'true',VERCEL_GIT_COMMIT_REF:'feature/p0-unified-journey-ledger'}),false)
 assert.equal(enabledP0({VERCEL_ENV:'preview',ACY_P0_ENABLED:'true',VERCEL_GIT_COMMIT_REF:'main'}),false)
 assert.equal(enabledP0({VERCEL_ENV:'preview',ACY_P0_ENABLED:'false',VERCEL_GIT_COMMIT_REF:'feature/p0-unified-journey-ledger'}),false)
})
test('preview allows QA addresses, refuses real customers and invalid idempotency',()=>{
 assert.equal(qaOnly('hello@veyfront.com'),true)
 assert.equal(qaOnly('qa@example.invalid'),true)
 assert.equal(qaOnly('real@customer.example'),false)
 assert.throws(()=>idempotentIdentity('weak','qa@example.invalid',SECRET))
 assert.throws(()=>idempotentIdentity(key,'qa@example.invalid','short'))
})
test('same submission key is idempotent; different email/key derives new journey',()=>{
 const a=build(),b=build(),c=build(randomUUID())
 assert.equal(a.journey.id,b.journey.id)
 assert.equal(a.token,b.token)
 assert.notEqual(a.journey.id,c.journey.id)
 assert.equal(a.journey.reference,b.journey.reference)
})
test('one authoritative record starts with persisted intake and follow-up events',()=>{
 const {journey:j,token}=build()
 assert.equal(j.version,2)
 assert.equal(j.status,'needs_completion')
 assert.equal(j.events.length,2)
 assert.deepEqual(j.events.map(x=>x.code),['intake_received','missing_information_requested'])
 assert.equal(j.events[0].evidence.kind,'CUSTOMER_SELF_REPORTED')
 assert.match(j.events[0].evidence.sha256,/^[0-9a-f]{64}$/)
 assert.equal(j.events[0].evidence.consentVersion,'VEYFRONT-PRIVACY-2026-10-30')
 assert.equal(j.costs.knownMinorUnits,null)
 assert.equal(j.costs.status,'NOT_RECONCILED')
 assert.equal(j.events[0].usage.billableAmountMinor,null)
 assert.equal(j.events[0].usage.billing,'NOT_MEASURED')
 assert.equal(authentic(j,token,new Date('2026-11-01T00:15:00Z')),true)
 assert.equal(authentic(j,'wrong',new Date('2026-11-01T00:15:00Z')),false)
 assert.equal(authentic(j,token,new Date('2026-11-03T00:00:01Z')),false)
})
test('consecutive P1 steps and state transitions are attributed and recoverable',()=>{
 const {journey:j}=build()
 const actionId=randomUUID()
 const first=changeP0(j,{actionId,type:'complete_brief',markets:'European Union',desiredAction:'Request a quote'},new Date('2026-11-01T00:10:00Z'))
 assert.equal(first.kind,'updated')
 const qualified=first.journey
 assert.equal(qualified.status,'qualified')
 assert.equal(changeP0(qualified,{actionId:randomUUID(),type:'complete_brief',markets:'',desiredAction:''}).kind,'invalid')
 assert.equal(qualified.events.at(-1).code,'brief_completed')
 assert.equal(qualified.events.at(-1).from,'needs_completion')
 assert.equal(qualified.events.at(-1).to,'qualified')
 assert.equal(qualified.events.at(-1).evidence.kind,'CUSTOMER_SELF_REPORTED')
 assert.equal(visibleP0(qualified).blockedReason.includes('P2 needs'),true)
 const duplicate=changeP0(qualified,{actionId,type:'complete_brief',markets:'Different',desiredAction:'Different'},new Date('2026-11-01T00:11:00Z'))
 assert.equal(duplicate.kind,'duplicate')
 assert.equal(duplicate.journey.events.length,3)
 const channel=changeP0(qualified,{actionId:randomUUID(),type:'choose_channel',channel:'feishu'})
 assert.equal(channel.kind,'updated')
 assert.equal(channel.journey.channel,'feishu')
 const human=changeP0(channel.journey,{actionId:randomUUID(),type:'request_human'})
 assert.equal(human.kind,'updated')
 assert.equal(human.journey.status,'human_review')
 assert.equal(changeP0(human.journey,{actionId:randomUUID(),type:'complete_brief',markets:'US',desiredAction:'Buy'}).kind,'invalid')
 assert.equal(human.journey.events.length,5)
})
test('operational alert only says provider accepted, never delivered',()=>{
 const {journey}=build()
 const a=recordDelivery(journey,'sent',new Date('2026-11-01T00:01:00Z'))
 assert.equal(a.notification,'provider_accepted')
 assert.match(a.events.at(-1).why,/delivery not independently verified/)
 assert.equal(recordDelivery(journey,'failed').notification,'failed')
 assert.equal(recordDelivery(journey,'disabled').notification,'disabled')
})
test('same-origin metadata fallback denies cross-site, production and malformed aliases',()=>{
 const alias='https://veyfront-git-feature-p0-unified-jou-123-gloweaseco-1757s-projects.vercel.app'
 const env={VERCEL_ENV:'preview',ACY_P0_ALLOWED_ORIGIN:alias}
 const req=headers=>({url:'https://internal.vercel.app/api/leads',headers:new Headers(headers)})
 assert.equal(p0Origin(req({origin:alias}),env),true)
 assert.equal(p0Origin(req({origin:'https://evil.example'}),env),false)
 assert.equal(p0Origin(req({'sec-fetch-site':'same-origin','x-vf-preview-p0':'journey'}),env),true)
 assert.equal(p0Origin(req({'sec-fetch-site':'cross-site','x-vf-preview-p0':'journey'}),env),false)
 assert.equal(p0Origin(req({'sec-fetch-site':'same-origin','x-vf-preview-p0':'wrong'}),env),false)
 assert.equal(p0Origin(req({'sec-fetch-site':'same-origin','x-vf-preview-p0':'journey'}),{...env,VERCEL_ENV:'production'}),false)
})
test('P1 qualification and missing-field rules are preserved',()=>{
 const {journey}=build()
 assert.equal(deriveStatus(journey.brief),journey.status)
 assert.deepEqual(missingBriefFields(journey.brief),['markets','desiredAction'])
})

test('tamper-evident event chain rejects changed status/evidence and projects P2–P4 blockers',()=>{
 const {journey}=build()
 assert.equal(verifyLedger(journey),true)
 assert.equal(visibleP0(journey).ledger.integrity,'HASH_CHAIN_VALID')
 const stages=visibleP0(journey).ledger.stages
 assert.deepEqual(stages.map(x=>x.stage),['P1','P2'])
 assert.deepEqual(stages.map(x=>x.status),['needs_completion','NOT_STARTED'])
 const bad=structuredClone(journey);bad.events[0].why='History rewritten by attacker'
 assert.equal(verifyLedger(bad),false)
 const missing=structuredClone(journey);missing.events.pop()
 assert.equal(verifyLedger(missing),false)
 const result=changeP0(journey,{actionId:randomUUID(),type:'complete_brief',markets:'EU',desiredAction:'RFQ'})
 assert.equal(result.kind,'updated')
 assert.equal(verifyLedger(result.journey),true)
})

test('P2 is a consented review in same journey; duplicate, busy and failure are explicit',()=>{
 const initial=build().journey
 const done=changeP0(initial,{type:'complete_brief',markets:'European Union',desiredAction:'Request quotation',actionId:randomUUID()})
 assert.equal(done.kind,'updated')
 const qualified=done.journey
 const attemptId=randomUUID()
 const started=beginP2Review(qualified,attemptId,new Date('2026-11-01T00:30:00Z'))
 assert.equal(started.kind,'updated')
 assert.equal(verifyLedger(started.journey),true)
 const tamperLease=structuredClone(started.journey)
 tamperLease.p2Attempt.actionId=randomUUID()
 assert.equal(verifyLedger(tamperLease),false)
 const tamperState=structuredClone(started.journey)
 tamperState.status='needs_completion'
 assert.equal(verifyLedger(tamperState),false)
 assert.equal(changeP0(started.journey,{actionId:randomUUID(),type:'complete_brief',markets:'',desiredAction:''}).kind,'invalid')
 assert.equal(started.journey.events.at(-1).evidence.consentVersion,'VEYFRONT-READONLY-HOMEPAGE-2026-10-31')
 assert.equal(started.journey.events.at(-1).evidence.kind,'EXPLICIT_SOURCE_AUTHORIZATION')
 assert.equal(visibleP0(started.journey).ledger.stages[1].status,'IN_PROGRESS')
 assert.equal(beginP2Review(started.journey,randomUUID(),new Date('2026-11-01T00:30:10Z')).kind,'busy')
 assert.equal(beginP2Review(started.journey,attemptId,new Date('2026-11-01T00:30:10Z')).kind,'duplicate')
 const review={
  status:'REVIEW_REQUIRED',sourceUrl:'https://veyfront.com/',sourcePageSha256:'a'.repeat(64),sourceManifestSha256:'b'.repeat(64),
  assessmentId:'assessment-'+'c'.repeat(20),planId:'plan-'+'d'.repeat(20),observedAt:'2026-11-01T00:30:12Z',
  capturedAt:'2026-11-01T00:30:10Z',contract:'l2m.acy.plan/0.1',
  opportunities:['discover','understand','trust','convert'].map(stage=>({stage,hypothesis:'Unverified',question:'Which authorized evidence?',claim:'UNVERIFIED_HYPOTHESIS'})),
  customerReady:false,modelCalls:0,generationCalls:0,sourceRights:'USER_ASSERTED_NOT_INDEPENDENTLY_VERIFIED'
 }
 const finished=linkP2Review(started.journey,review,attemptId,new Date('2026-11-01T00:30:14Z'))
 assert.equal(finished.kind,'updated')
 assert.equal(verifyLedger(finished.journey),true)
 assert.equal(visibleP0(finished.journey).ledger.stages[1].status,'REVIEW_REQUIRED')
 assert.equal(visibleP0(finished.journey).p2.sourcePageSha256,'a'.repeat(64))
 const tampered=structuredClone(finished.journey)
 tampered.p2.opportunities[0].claim='VERIFIED_DEFICIENCY'
 assert.equal(verifyLedger(tampered),false)
 assert.equal(beginP2Review(finished.journey,randomUUID()).kind,'invalid')
 assert.equal(finished.journey.events.at(-1).evidence.kind,'BOUNDED_PUBLIC_SNAPSHOT')
 const fail=failP2Review(started.journey,attemptId,'UPSTREAM_FAILED',new Date('2026-11-01T00:30:20Z'))
 assert.equal(fail.p2Attempt.state,'FAILED')
 assert.equal(verifyLedger(fail),true)
 const tamperFailure=structuredClone(fail)
 tamperFailure.p2Attempt.reason='SUCCEEDED'
 assert.equal(verifyLedger(tamperFailure),false)
 const retry=beginP2Review(fail,randomUUID(),new Date('2026-11-01T00:30:22Z'))
 assert.equal(retry.kind,'updated')
 assert.equal(beginP2Review(initial,randomUUID()).kind,'invalid')
})

test('Launch can prepare URL-free Context on the same Journey without inventing industry or invoking CBP2',()=>{
 const initial=makeP0({service:'launch',name:'Internal QA',email:'qa@example.invalid',
  company:'Launch Pilot',website:'',markets:'',details:'We want a new overseas business site with inquiry capabilities.'},
  randomUUID(),SECRET,new Date('2026-11-01T01:00:00Z')).journey
 assert.equal(initial.status,'needs_completion')
 const complete=changeP0(initial,{type:'complete_brief',actionId:randomUUID(),
  markets:'European Union',desiredAction:'Request product details'})
 assert.equal(complete.kind,'updated')
 assert.equal(complete.journey.status,'qualified')
 const prepared=changeP0(complete.journey,{type:'prepare_launch_context',actionId:randomUUID()})
 assert.equal(prepared.kind,'updated')
 assert.equal(prepared.journey.launch.source,'CUSTOMER_ONLY_NO_SOURCE_URL')
 assert.equal(prepared.journey.launch.cbp2PlannerAuthorized,false)
 assert.equal(prepared.journey.launch.modelCalls,0)
 assert.equal(prepared.journey.launch.facts.every(f=>f.provenance==='CUSTOMER_SELF_REPORTED_UNVERIFIED'),true)
 assert.equal(prepared.journey.launch.missing.includes('buyer_roles'),true)
 assert.equal(verifyLedger(prepared.journey),true)
 assert.equal(visibleP0(prepared.journey).ledger.stages[1].status,'REVIEW_REQUIRED')
 assert.equal(changeP0(prepared.journey,{type:'prepare_launch_context',actionId:randomUUID()}).kind,'invalid')
 const tampered=structuredClone(prepared.journey)
 tampered.launch.facts[0].value='fabricated approved customer'
 assert.equal(verifyLedger(tampered),false)
})
