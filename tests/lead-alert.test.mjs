import test from 'node:test'
import assert from 'node:assert/strict'
import { sendLeadAlert } from '../lib/lead-alert.ts'

const sample={reference:'VF-TESTONLY',service:'launch',receivedAt:'2026-10-31T10:00:00Z'}
const keys=['RESEND_API_KEY','VF_ALERT_TO_EMAIL','VF_ALERT_FROM_EMAIL']
const originals=Object.fromEntries(keys.map(k=>[k,process.env[k]]))
const restore=()=>{
  for(const k of keys) if(originals[k]===undefined) delete process.env[k]; else process.env[k]=originals[k]
}
const install=()=>{
  process.env.RESEND_API_KEY='test-only-placeholder'
  process.env.VF_ALERT_TO_EMAIL='ops@example.invalid'
  process.env.VF_ALERT_FROM_EMAIL='alert@example.invalid'
}

test('no configured alert does not call third party',async()=>{
  const saved=globalThis.fetch
  try {
    keys.forEach(k=>delete process.env[k])
    globalThis.fetch=()=>{throw new Error('must not send')}
    assert.equal(await sendLeadAlert(sample),'disabled')
  }finally{globalThis.fetch=saved;restore()}
})

test('successful alert excludes customer data and is idempotency keyed',async()=>{
  const saved=globalThis.fetch
  let calls=[]
  try {
    install()
    globalThis.fetch=async(url,opts)=>{calls.push({url,opts});return {ok:true}}
    assert.equal(await sendLeadAlert(sample),'sent')
    assert.equal(calls.length,1)
    assert.equal(calls[0].url,'https://api.resend.com/emails')
    assert.match(calls[0].opts.headers['Idempotency-Key'],/VF-TESTONLY/)
    const body=JSON.parse(calls[0].opts.body)
    assert.ok(body.text.includes(sample.reference))
    assert.ok(!body.text.includes('private@example.invalid'))
    assert.equal(Object.keys(body).sort().join(','),'from,subject,text,to')
  }finally{globalThis.fetch=saved;restore()}
})

test('bad provider response is nonfatal',async()=>{
  const saved=globalThis.fetch
  try{install();globalThis.fetch=async()=>({ok:false,status:500});assert.equal(await sendLeadAlert(sample),'failed')}
  finally{globalThis.fetch=saved;restore()}
})

test('network errors are nonfatal',async()=>{
  const saved=globalThis.fetch
  try{install();globalThis.fetch=async()=>{throw new Error('transient')};assert.equal(await sendLeadAlert(sample),'failed')}
  finally{globalThis.fetch=saved;restore()}
})

test('invalid alert addresses fail without sending',async()=>{
  const saved=globalThis.fetch
  try{install();process.env.VF_ALERT_TO_EMAIL='not-email';globalThis.fetch=()=>{throw new Error('must not send')};assert.equal(await sendLeadAlert(sample),'failed')}
  finally{globalThis.fetch=saved;restore()}
})
