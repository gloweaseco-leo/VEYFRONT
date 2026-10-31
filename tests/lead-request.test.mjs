import test from 'node:test'
import assert from 'node:assert/strict'
import { MAX_LEAD_BYTES, isSameOrigin, isJsonContentType, readLeadBody } from '../lib/lead-request.ts'

const url = 'https://veyfront.com/api/leads'
const req = (body, origin='https://veyfront.com', headers={}) =>
  new Request(url, { method:'POST', headers: { 'Content-Type':'application/json; charset=utf-8', ...(origin?{'Origin':origin}:{}),...headers }, body })

test('only exact first-party browser Origin is accepted', () => {
  assert.equal(isSameOrigin(req('{}')),true)
  assert.equal(isSameOrigin(req('{}',null)),false)
  assert.equal(isSameOrigin(req('{}','https://evil.example')),false)
  assert.equal(isSameOrigin(req('{}','https://veyfront.com.evil.example')),false)
  assert.equal(isSameOrigin(req('{}','http://veyfront.com')),false)
  assert.equal(isSameOrigin(req('{}','https://veyfront.com:443')),false)
})

test('JSON content type is parsed exactly, including charset', () => {
  assert.equal(isJsonContentType(req('{}')),true)
  assert.equal(isJsonContentType(req('{}',undefined,{'Content-Type':'APPLICATION/JSON ; charset=utf-8'})),true)
  assert.equal(isJsonContentType(req('{}',undefined,{'Content-Type':'application/json-evil'})),false)
  assert.equal(isJsonContentType(req('{}',undefined,{'Content-Type':'text/plain'})),false)
})

test('small valid JSON round-trips', async () => {
  assert.deepEqual(await readLeadBody(req('{"service":"general"}')),{kind:'ok',text:'{"service":"general"}'})
})

test('declared oversize rejected before body processing', async () => {
  const r=req('{}',undefined,{'Content-Length':String(MAX_LEAD_BYTES+1)})
  assert.deepEqual(await readLeadBody(r),{kind:'too-large'})
})

test('unknown-length streamed body is byte-bounded',async()=>{
  const payload=new Uint8Array(MAX_LEAD_BYTES+1)
  payload.fill(65)
  const stream=new ReadableStream({start(controller){controller.enqueue(payload.subarray(0,5000));controller.enqueue(payload.subarray(5000));controller.close()}})
  const request=new Request(url,{method:'POST',headers:{Origin:'https://veyfront.com','Content-Type':'application/json'},body:stream,duplex:'half'})
  assert.deepEqual(await readLeadBody(request),{kind:'too-large'})
})

test('actual UTF-8 bytes matter, not JavaScript character count',async()=>{
  const value='中'.repeat(4001)
  const request=req(value)
  assert.equal((await readLeadBody(request)).kind,'too-large')
})

test('malformed UTF-8 rejected',async()=>{
  const payload=new Uint8Array([0xff,0xfe,0xfd])
  const request=new Request(url,{method:'POST',headers:{Origin:'https://veyfront.com','Content-Type':'application/json'},body:payload})
  assert.deepEqual(await readLeadBody(request),{kind:'invalid'})
})
