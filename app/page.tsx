import type { Metadata } from 'next'
import { releaseRobots } from '@/lib/seo-release'
import { SiteHeader } from '@/components/l2m/site-header'
import { HomeDemoProvider } from '@/components/home/home-state'
import { Hero } from '@/components/home/hero'
import { BuyerCapabilities } from '@/components/home/buyer-capabilities'
import { Transformation } from '@/components/home/transformation'
import { JourneySteps } from '@/components/veyfront/journey-steps'
import { CommercialOffers } from '@/components/veyfront/commercial-offers'
import { Proof } from '@/components/home/proof'
import { Invitation, SiteFooter } from '@/components/home/invitation'

export const metadata: Metadata = {
 title:'VEYFRONT — Building Digital Frontiers for Global Business',
 description:'Build or rebuild an international B2B website with SEO-Native foundations, buyer-ready content, working inquiries and first-year basic hosting.',
 robots: releaseRobots,
 alternates:{canonical:'https://veyfront.com'},
}
export default function HomePage(){
 return <HomeDemoProvider>
  <SiteHeader tone="dark"/>
  <main>
   <Hero/>
   <CommercialOffers/>
   <BuyerCapabilities/>
   <Transformation/>
   <JourneySteps/>
   <Proof/>
   <Invitation/>
  </main>
  <SiteFooter/>
 </HomeDemoProvider>
}
