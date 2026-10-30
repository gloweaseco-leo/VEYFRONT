import type { Metadata } from 'next'
import { SiteHeader } from '@/components/l2m/site-header'
import { UrlFlowProvider } from '@/components/l2m/url-flow'
import { HERO_INPUT_ID, HomeDemoProvider } from '@/components/home/home-state'
import { ProtoBar } from '@/components/home/proto-bar'
import { Hero } from '@/components/home/hero'
import { Transformation } from '@/components/home/transformation'
import { Journey } from '@/components/home/journey'
import { Report } from '@/components/home/report'
import { DeliveryPath } from '@/components/home/delivery-path'
import { WhatYouGet } from '@/components/home/what-you-get'
import { Proof } from '@/components/home/proof'
import { Invitation, SiteFooter } from '@/components/home/invitation'

export const metadata: Metadata = {
  title: 'VEYFRONT — Building Digital Frontiers for Global Business',
  description:
    'Build or rebuild a B2B website that helps global buyers discover, evaluate and contact your business. Submit a Launch or Rebuild inquiry.',
  robots: { index: false, follow: false },
}

export default function HomePage() {
  return (
    <UrlFlowProvider>
      <HomeDemoProvider>
        <ProtoBar />
        <SiteHeader tone="dark" inputId={HERO_INPUT_ID} />
        <main>
          <Hero />
          <Transformation />
          <Journey />
          <Report />
          <DeliveryPath />
          <WhatYouGet />
          <Proof />
          <Invitation />
        </main>
        <SiteFooter />
      </HomeDemoProvider>
    </UrlFlowProvider>
  )
}
