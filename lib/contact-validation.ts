/**
 * First-party contact data validation shared by the browser and the server.
 * Contact preference does not imply that a WeChat friend request succeeded.
 */
export type ContactPreference = 'any' | 'wechat' | 'phone' | 'email'
export type ContactDetails = { email: string; phone: string; wechat: string; preferredContact: string }

export function validEmail(value: string): boolean {
  return value.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}
export function validPhone(value: string): boolean {
  return value.length <= 32 && /^\+?[\d\s()\-]+$/.test(value) && (value.match(/\d/g)?.length ?? 0) >= 7 && (value.match(/\d/g)?.length ?? 0) <= 15
}
export function validWechat(value: string): boolean {
  // WeChat ID, not a screen name or a QR image. Accept common legacy IDs.
  return value.length >= 4 && value.length <= 40 && /^[A-Za-z][A-Za-z0-9_-]*$/.test(value)
}
export function validateContactDetails(input: ContactDetails, privacy = false): string | null {
  const { email, phone, wechat, preferredContact } = input
  if (email && !validEmail(email)) return 'Please enter a valid email address.'
  if (phone && !validPhone(phone)) return 'Please enter a valid phone number.'
  if (wechat && !validWechat(wechat)) return 'Please provide a WeChat ID (not a nickname).'
  if (!['any', 'wechat', 'phone', 'email'].includes(preferredContact)) return 'Invalid contact preference.'
  if (privacy && !email) return 'An email address is required for data requests.'
  if (!privacy && !email && !phone && !wechat) return 'Please provide at least one way to contact you.'
  if (!privacy && preferredContact !== 'any' && !input[preferredContact as Exclude<ContactPreference,'any'>])
    return 'Please enter the contact detail for your preferred channel.'
  return null
}
