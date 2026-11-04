#!/usr/bin/env node
/**
 * PRIVATE operator-only CLI for confirmed WeCom leads and follow-up events.
 * No public admin endpoint, no secrets in code, no raw chat transcripts.
 * Supply JSON via stdin, not shell arguments/history. No PII is printed.
 */
import { put } from '@vercel/blob'
import { randomUUID } from 'node:crypto'
import { validateContactDetails } from '../lib/contact-validation.ts'

const allowedServices = ['launch', 'rebuild', 'general']
const allowedStates = ['contacted', 'qualified', 'proposal', 'won', 'lost', 'followup']
const cmd = process.argv[2]
if (!process.env.BLOB_READ_WRITE_TOKEN) {
  console.error('Private Blob credentials unavailable. Nothing saved.')
  process.exit(2)
}
if (!['register-wecom', 'transition'].includes(cmd)) {
  console.error('Usage: node scripts/contact-ops.mjs register-wecom|transition < private-record.json')
  process.exit(2)
}
async function readInput() {
  const chunks = []
  let bytes = 0
  for await (const chunk of process.stdin) {
    bytes += chunk.byteLength
    if (bytes > 10_000) throw new Error('Input too large')
    chunks.push(chunk)
  }
  const value = JSON.parse(Buffer.concat(chunks).toString('utf8'))
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Expected object')
  return value
}
function short(value, max, required = false) {
  if (value === undefined || value === null) value = ''
  if (typeof value !== 'string' || value.length > max) throw new Error('Invalid field')
  const cleaned = value.trim()
  if (required && !cleaned) throw new Error('Required field missing')
  return cleaned
}
function dueDate(value) {
  const date = short(value, 10)
  if (date && (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(Date.parse(date + 'T00:00:00Z'))))
    throw new Error('Invalid due date')
  return date || null
}
async function store(prefix, record) {
  const now = new Date()
  const path = `${prefix}/${now.getUTCFullYear()}/${String(now.getUTCMonth()+1).padStart(2,'0')}/${randomUUID()}.json`
  await put(path, JSON.stringify(record), {
    access: 'private', addRandomSuffix: false, contentType: 'application/json', cacheControlMaxAge: 60,
  })
}
try {
  const data = await readInput()
  const owner = short(data.owner, 80, true)
  const nextAction = short(data.nextAction, 200)
  const followupDueAt = dueDate(data.followupDueAt)
  if (cmd === 'register-wecom') {
    if (data.confirmedContact !== true) throw new Error('Operator must confirm an actual WeCom conversation')
    if (!allowedServices.includes(data.service)) throw new Error('Invalid service')
    const name = short(data.name, 100)
    const company = short(data.company, 160)
    const wechat = short(data.wechat, 40)
    const phone = short(data.phone, 32)
    const email = short(data.email, 254)
    const details = short(data.summary, 1200, true)
    if (details.length < 10) throw new Error('A brief project summary is required')
    if (validateContactDetails({email, phone, wechat, preferredContact:'any'}) && (email || phone || wechat))
      throw new Error('Invalid contact detail')
    const reference = 'VF-' + randomUUID().slice(0, 8).toUpperCase()
    await store('inquiries', {
      reference, receivedAt: new Date().toISOString(),
      source: 'wecom-manual', contactEstablished: true, status: 'contacted',
      service: data.service, name: name || null, company: company || null,
      email: email || null, phone: phone || null, wechat: wechat || null,
      preferredContact: 'wechat', website: null, markets: null, details,
      owner, nextAction: nextAction || null, followupDueAt,
      consent: { accepted: false, source: 'customer-initiated-wecom-conversation', operatorConfirmed: true },
      // No IP, cookies, chat transcripts or WeCom raw messages.
    })
    console.log('Confirmed WeCom lead stored privately. Reference: ' + reference)
  } else {
    const reference = short(data.reference, 11, true)
    if (!/^VF-[0-9A-F]{8}$/.test(reference)) throw new Error('Invalid reference')
    if (!allowedStates.includes(data.status)) throw new Error('Invalid status')
    await store('inquiry-events', {
      reference, status: data.status, owner,
      nextAction: nextAction || null, followupDueAt,
      occurredAt: new Date().toISOString(),
      source: 'operator-manual',
    })
    console.log('Follow-up event stored privately. Reference: ' + reference + ' / status: ' + data.status)
  }
} catch (error) {
  // Do not echo untrusted input or business/personal data.
  console.error('Contact operations failed safely. Check input format and private storage access.')
  process.exitCode = 1
}
