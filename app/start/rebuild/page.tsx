import type { Metadata } from 'next'
import { StartPage } from '@/components/veyfront/start-pages'
export const metadata: Metadata = { title: 'Website Rebuild — VEYFRONT (prototype)', robots: { index: false, follow: false } }
export default function Page() { return <StartPage kind="rebuild" /> }
