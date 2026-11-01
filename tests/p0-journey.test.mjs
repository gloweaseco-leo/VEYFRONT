import test from 'node:test'
import assert from 'node:assert/strict'
import {randomUUID} from 'node:crypto'
import {enabledP0,p0Origin,qaOnly,idempotentIdentity,makeP0,authentic,changeP0,visibleP0,recordDelivery} from '../lib/p0-journey.ts'
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
 assert.equal(qualified.events.at(-1).code,'brief_completed')
 assert.equal(qualified.events.at(-1).from,'needs_completion')
 assert.equal(qualified.events.at(-1).to,'qualified')
 assert.equal(qualified.events.at(-1).evidence.kind,'CUSTOMER_SELF_REPORTED')
 assert.equal(visibleP0(qualified).blockedReason.includes('P2/P3'),true)
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
