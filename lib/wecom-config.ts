/**
 * QR supplied by the VEYFRONT operator on 2026-11-18.
 * Show the user-supplied image; do not parse its payload or create a deep link.
 * Account verification was reported by the operator, not independently tested.
 */
export const WECOM_QR_PATH = '/contact/veyfront-wecom-verified-20261118.png'
export function wecomQrPath(): string {
  return WECOM_QR_PATH
}
