import test from 'node:test'
import assert from 'node:assert/strict'
import { validateContactDetails } from '../lib/contact-validation.ts'

const contact = (values = {}) => ({ email: '', phone: '', wechat: '', preferredContact: 'any', ...values })
test('inquiries accept one or multiple contact methods', () => {
  assert.equal(validateContactDetails(contact({ wechat: 'Business_Leo' })), null)
  assert.equal(validateContactDetails(contact({ phone: '+86 188 0000 0000' })), null)
  assert.equal(validateContactDetails(contact({ email: 'buyer@example.com' })), null)
  assert.equal(validateContactDetails(contact({ email: 'buyer@example.com', wechat: 'buyer_01' })), null)
})
test('empty, invalid and preference mismatch are rejected', () => {
  assert.match(validateContactDetails(contact()), /at least one/)
  assert.match(validateContactDetails(contact({ phone: '123' })), /valid phone/)
  assert.match(validateContactDetails(contact({ wechat: '中文昵称' })), /WeChat ID/)
  assert.match(validateContactDetails(contact({ email: 'not-an-email' })), /valid email/)
  assert.match(validateContactDetails(contact({ email: 'buyer@example.com', preferredContact: 'wechat' })), /preferred/)
})
test('privacy request keeps email requirement independent of new inquiries', () => {
  assert.match(validateContactDetails(contact({ wechat: 'buyer_wechat' }), true), /email address is required/)
  assert.equal(validateContactDetails(contact({ email: 'buyer@example.com' }), true), null)
})
