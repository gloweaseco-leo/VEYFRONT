import type { Metadata } from 'next'
import { IntakePage } from '@/components/veyfront/intake-pages'
export const metadata: Metadata = { title: 'Privacy Requests — VEYFRONT', robots: { index: false, follow: false } }
export default function Page(){ return <IntakePage service="privacy"/> }
