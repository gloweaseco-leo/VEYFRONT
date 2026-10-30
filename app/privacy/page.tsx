import type { Metadata } from 'next'
import { PolicyPage } from '@/components/veyfront/policy-pages'
export const metadata: Metadata = { title: 'Privacy Notice — VEYFRONT' }
export default function Page(){ return <PolicyPage kind="privacy"/> }
