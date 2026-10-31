import test from 'node:test'
import assert from 'node:assert/strict'
import { advanceJourney, authenticate, deriveStatus, makeJourney, missingBriefFields, p1Enabled, publicJourney, validQaEmail, validateBrief } from '../lib/acy-p1.ts'
const brief = {company:'QA Company', website:'https://example.com', markets:'', desiredAction:'',description:'Synthetic test brief for VEYFRONT P1, not a real customer.'}
test('P1 is disabled in production even if a feature flag exists', () => {
 assert.equal(p1Enabled({VERCEL_ENV:'production',ACY_P1_ENABLED:'true'}),false)
 assert.equal(p1Enabled({VERCEL_ENV:'preview',ACY_P1_ENABLED:'false'}),false)
 assert.equal(p1Enabled({VERCEL_ENV:'preview',ACY_P1_ENABLED:'true'}),true)
})
test('preview only accepts internal QA recipients', () => {
 assert.equal(validQaEmail('hello@veyfront.com'),true)
 assert.equal(validQaEmail('qa@example.invalid'),true)
 assert.equal(validQaEmail('stranger@example.com'),false)
})
test('Rebuild demands public-looking URL and detailed description',()=>{
 assert.equal(validateBrief('rebuild',{...brief,website:''}),null)
 assert.ok(validateBrief('rebuild',brief))
 assert.equal(validateBrief('rebuild',{...brief,description:'too short'}),null)
})
test('missing data is explicitly requested; no fabricated AI output',()=>{
 assert.deepEqual(missingBriefFields(brief),['markets','desiredAction'])
 assert.equal(deriveStatus(brief),'needs_completion')
})
test('bearer proof is random, hash-only at rest and time-bound',()=>{
 const {journey,accessToken}=makeJourney({service:'rebuild',name:'QA',email:'qa@example.invalid',brief,now:new Date('2026-10-31T00:00:00Z')})
 assert.equal(journey.accessHash.includes(accessToken),false)
 assert.equal(authenticate(journey,accessToken,new Date('2026-11-01T00:00:00Z')),true)
 assert.equal(authenticate(journey,'not-a-valid-token'),false)
 assert.equal(authenticate(journey,accessToken,new Date('2026-11-03T00:00:00Z')),false)
 assert.equal(JSON.stringify(publicJourney(journey)).includes('accessHash'),false)
 assert.equal(JSON.stringify(publicJourney(journey)).includes('email'),false)
})
test('completion advances deterministically, duplicates do not change state',()=>{
 const {journey}=makeJourney({service:'launch',name:'QA',email:'qa@example.invalid',brief})
 const action={actionId:'12345678-1234-1234-1234-1234567890ab',type:'complete_brief',markets:'European Union',desiredAction:'Request a quote'}
 const result=advanceJourney(journey,action)
 assert.equal(result.kind,'updated')
 if(result.kind!=='updated')return
 assert.equal(result.journey.status,'qualified')
 const duplicate=advanceJourney(result.journey,action)
 assert.equal(duplicate.kind,'duplicate')
 assert.deepEqual(duplicate.journey.events,result.journey.events)
})
test('channel choice does not claim external system connection; escalation is durable',()=>{
 const {journey}=makeJourney({service:'launch',name:'QA',email:'qa@example.invalid',brief})
 const next=advanceJourney(journey,{actionId:'12345678-1234-1234-1234-1234567890ab',type:'choose_channel',channel:'wechat'})
 assert.equal(next.kind,'updated')
 if(next.kind!=='updated')return
 assert.equal(next.journey.channel,'wechat')
 const exception=advanceJourney(next.journey,{actionId:'12345678-1234-1234-1234-1234567890ac',type:'request_human'})
 assert.equal(exception.kind,'updated')
 if(exception.kind==='updated') assert.equal(exception.journey.status,'human_review')
})
test('invalid actions fail closed',()=>{
 const {journey}=makeJourney({service:'rebuild',name:'QA',email:'qa@example.invalid',brief})
 assert.equal(advanceJourney(journey,{actionId:'nope',type:'choose_channel',channel:'email'}).kind,'invalid')
 assert.equal(advanceJourney(journey,{actionId:'12345678-1234-1234-1234-1234567890ab',type:'pay_now'}).kind,'invalid')
})
