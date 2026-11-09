'use client'

import { useEffect } from 'react'
import { ACQUISITION_SESSION_KEY, LANDING_PAGE_SESSION_KEY, classifyAcquisitionReferrer, safeAcquisitionLandingPage } from '@/lib/acquisition-channel'

/** First-party session-only coarse hint. Never persists the original referrer. */
export function AcquisitionCapture() {
  useEffect(() => {
    try {
      if (window.sessionStorage.getItem(ACQUISITION_SESSION_KEY) !== null) return
      const category = classifyAcquisitionReferrer(document.referrer, window.location.hostname)
      window.sessionStorage.setItem(ACQUISITION_SESSION_KEY, category)
      const path = safeAcquisitionLandingPage(window.location.pathname)
      if (path) window.sessionStorage.setItem(LANDING_PAGE_SESSION_KEY, path)
    } catch {
      // Storage restrictions must never impair website navigation or inquiry receipt.
    }
  }, [])
  return null
}
