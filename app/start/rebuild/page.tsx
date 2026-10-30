import type { Metadata } from 'next'
import { IntakePage } from '@/components/veyfront/intake-pages'
export const metadata: Metadata = { title: 'Rebuild Inquiry — VEYFRONT' }
export default function Page(){ return <IntakePage service="rebuild" /> }
