'use client'

import { useEffect } from 'react'
import { ACQUISITION_SESSION_KEY, classifyAcquisitionReferrer } from '@/lib/acquisition-channel'

/** First-party session-only coarse hint. Never persists the original referrer. */
export function AcquisitionCapture() {
  useEffect(() => {
    try {
      if (window.sessionStorage.getItem(ACQUISITION_SESSION_KEY) !== null) return
      const category = classifyAcquisitionReferrer(document.referrer, window.location.hostname)
      window.sessionStorage.setItem(ACQUISITION_SESSION_KEY, category)
    } catch {
      // Storage restrictions must never impair website navigation or inquiry receipt.
    }
  }, [])
  return null
}
