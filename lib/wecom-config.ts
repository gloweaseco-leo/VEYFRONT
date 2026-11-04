/**
 * Only enable the WeCom card after a real, tested QR image has been placed in
 * public/contact/ and the matching Vercel Preview env var has been configured.
 * Relative first-party raster files only; no arbitrary remote URL or deep link.
 */
export function wecomQrPath(): string | null {
  const path = process.env.NEXT_PUBLIC_VF_WECOM_QR_PATH?.trim()
  return path && /^\/contact\/[A-Za-z0-9_-]+\.(?:png|jpe?g|webp)$/.test(path) ? path : null
}
