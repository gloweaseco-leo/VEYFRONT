import type { Metadata } from 'next'
import { IntakePage } from '@/components/veyfront/intake-pages'
export const metadata: Metadata = { title: 'Launch Inquiry — VEYFRONT' }
export default function Page(){ return <IntakePage service="launch" /> }
