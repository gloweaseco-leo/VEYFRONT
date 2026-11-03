import type { Metadata } from 'next'
import { PageShell } from '@/components/site/page-shell'
import { JourneySteps } from '@/components/veyfront/journey-steps'
import { releaseRobots } from '@/lib/seo-release'
export const metadata:Metadata={
 title:'How Website Delivery Works — VEYFRONT',
 description:'From inquiry and a written quote to supervised build, preview, acceptance and handover for B2B Launch or Rebuild websites.',
 robots:releaseRobots,
 alternates:{canonical:'https://veyfront.com/how-it-works'},
}
export default function Page(){return <PageShell><JourneySteps detail/></PageShell>}
