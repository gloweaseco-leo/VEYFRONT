import test from 'node:test'
import assert from 'node:assert/strict'
import { createLeadSourceSummary, addSavedFormReceipt } from '../lib/acquisition-report.ts'

test('aggregation counts only saved website-form project inquiries and never exports PII', () => {
  const summary = createLeadSourceSummary()
  addSavedFormReceipt(summary, {source:'website-form',service:'launch',name:'PRIVATE NAME',email:'secret@example.com',details:'CUSTOMER SECRET',
    acquisition:{channel:'google-organic',landingPage:'/zh/pricing'}})
  addSavedFormReceipt(summary, {source:'website-form',service:'rebuild',
    acquisition:{channel:'https://google.com?q=secret',landingPage:'/contact?secret=1'}})
  addSavedFormReceipt(summary, {source:'website-form',service:'privacy',acquisition:{channel:'google-organic'}})
  addSavedFormReceipt(summary, {source:'wecom-manual',service:'general',acquisition:{channel:'google-organic'}})
  assert.equal(summary.savedFormInquiries, 2)
  assert.equal(summary.byChannel['google-organic'], 1)
  assert.equal(summary.byChannel.unknown, 1)
  assert.equal(summary.byLandingPage['/zh/pricing'], 1)
  assert.equal(summary.byLandingPage.unknown, 1)
  const output=JSON.stringify(summary)
  assert.equal(output.includes('PRIVATE NAME'), false)
  assert.equal(output.includes('secret@example.com'), false)
  assert.equal(output.includes('CUSTOMER SECRET'), false)
  assert.equal(output.includes('?secret=1'), false)
})
