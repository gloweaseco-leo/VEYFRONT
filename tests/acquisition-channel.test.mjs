import test from 'node:test'
import assert from 'node:assert/strict'
import { classifyAcquisitionReferrer, safeAcquisitionChannel, safeAcquisitionLandingPage } from '../lib/acquisition-channel.ts'

const own = 'veyfront.com'

test('known search referrers are classified without persisting their URLs or search terms', () => {
  assert.equal(classifyAcquisitionReferrer('https://www.google.com/search?q=secret+query', own), 'google-referrer')
  assert.equal(classifyAcquisitionReferrer('https://google.com.hk/search?q=test', own), 'google-referrer')
  assert.equal(classifyAcquisitionReferrer('https://www.bing.com/search?q=test', own), 'bing-referrer')
  assert.equal(classifyAcquisitionReferrer('https://www.baidu.com/s?wd=test', own), 'baidu-referrer')
  assert.equal(classifyAcquisitionReferrer('https://duckduckgo.com/?q=test', own), 'other-search-referrer')
})

test('missing, malformed, internal or unrecognized sources never pretend to be organic', () => {
  assert.equal(classifyAcquisitionReferrer('', own), 'unknown')
  assert.equal(classifyAcquisitionReferrer('not-a-url', own), 'unknown')
  assert.equal(classifyAcquisitionReferrer('javascript:alert(1)', own), 'unknown')
  assert.equal(classifyAcquisitionReferrer('https://veyfront.com/pricing', own), 'unknown')
  assert.equal(classifyAcquisitionReferrer('https://www.veyfront.com/zh', own), 'unknown')
  assert.equal(classifyAcquisitionReferrer('https://google.com.evil.example', own), 'external-referral')
  assert.equal(classifyAcquisitionReferrer('https://partner.example/', own), 'external-referral')
})

test('only canonical public paths are eligible for landing attribution', () => {
  assert.equal(safeAcquisitionLandingPage('/en/pricing'), '/en/pricing')
  assert.equal(safeAcquisitionLandingPage('/'), '/')
  assert.equal(safeAcquisitionLandingPage('/en'), '/en')
  assert.equal(safeAcquisitionLandingPage('/zh/pricing'), null) // legacy redirect, not a canonical landing
  assert.equal(safeAcquisitionLandingPage('/api/leads'), null)
  assert.equal(safeAcquisitionLandingPage('/review/stage-1'), null)
  assert.equal(safeAcquisitionLandingPage('/contact?token=secret'), null)
  assert.equal(safeAcquisitionLandingPage('https://veyfront.com/contact'), null)
  assert.equal(safeAcquisitionLandingPage(null), null)
})

test('the server accepts only a closed source-category enumeration', () => {
  assert.equal(safeAcquisitionChannel('google-referrer'), 'google-referrer')
  assert.equal(safeAcquisitionChannel('google-organic'), 'google-referrer') // legacy session alias
  assert.equal(safeAcquisitionChannel('external-referral'), 'external-referral')
  assert.equal(safeAcquisitionChannel('https://www.google.com/search?q=user'), 'unknown')
  assert.equal(safeAcquisitionChannel({channel:'google-referrer'}), 'unknown')
  assert.equal(safeAcquisitionChannel(null), 'unknown')
})
