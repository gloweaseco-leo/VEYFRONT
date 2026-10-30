import type { Metadata } from 'next'
import { PolicyPage } from '@/components/veyfront/policy-pages'
export const metadata: Metadata = { title: 'Website Terms — VEYFRONT' }
export default function Page(){ return <PolicyPage kind="terms"/> }
