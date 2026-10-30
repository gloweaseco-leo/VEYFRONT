import type { Metadata } from 'next'
import { ServicesPage } from '@/components/veyfront/services-page'
export const metadata: Metadata = { title: 'Services — VEYFRONT', description: 'Launch, Rebuild and future Grow: VEYFRONT B2B website services.' }
export default function Page() { return <ServicesPage /> }
