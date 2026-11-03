import test from 'node:test'
import assert from 'node:assert/strict'
import { sendLeadConfirmation } from '../lib/lead-confirmation.ts'

const keys=['VF_CONFIRM_ENABLED','RESEND_API_KEY','VF_CONFIRM_FROM_EMAIL']
const saved=Object.fromEntries(keys.map(k=>[k,process.env[k]]))
function restore(){ for(const k of keys) if(saved[k]===undefined)delete process.env[k];else process.env[k]=saved[k] }
function enable(){
 process.env.VF_CONFIRM_ENABLED='true'
 process.env.RESEND_API_KEY='test-token'
 process.env.VF_CONFIRM_FROM_EMAIL='hello@example.invalid'
}
const lead={reference:'VF-TESTONLY',email:'buyer@example.invalid',lang:'zh',service:'launch'}

test('disabled by default: never calls outside service',async()=>{
 const prior=globalThis.fetch
 try {
  keys.forEach(k=>delete process.env[k]);globalThis.fetch=()=>{throw Error('No network allowed')}
  assert.equal(await sendLeadConfirmation(lead),'disabled')
 } finally {globalThis.fetch=prior;restore()}
})
test('privacy requests never send automatic acknowledgement',async()=>{
 const prior=globalThis.fetch
 try {
  enable();globalThis.fetch=()=>{throw Error('No network allowed')}
  assert.equal(await sendLeadConfirmation({...lead,service:'privacy'}),'disabled')
 } finally {globalThis.fetch=prior;restore()}
})
test('Chinese receipt contains only reference and next steps, not project data',async()=>{
 const prior=globalThis.fetch
 let sent=null
 try{
  enable();globalThis.fetch=async(url,opts)=>{sent={url,opts};return {ok:true}}
  assert.equal(await sendLeadConfirmation(lead),'sent')
  assert.equal(sent.url,'https://api.resend.com/emails')
  const payload=JSON.parse(sent.opts.body)
  assert.deepEqual(payload.to,['buyer@example.invalid'])
  assert.match(payload.subject,/建站咨询/)
  assert.match(payload.text,/VF-TESTONLY/)
  assert.doesNotMatch(payload.text,/buyer@example.invalid|password|私人资料/)
  assert.match(sent.opts.headers['Idempotency-Key'],/VF-TESTONLY/)
 }finally{globalThis.fetch=prior;restore()}
})
test('failure is nonfatal and does not claim confirmation sent',async()=>{
 const prior=globalThis.fetch
 try{
  enable();globalThis.fetch=async()=>({ok:false,status:500})
  assert.equal(await sendLeadConfirmation(lead),'failed')
 }finally{globalThis.fetch=prior;restore()}
})
