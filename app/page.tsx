import { localizedMetadata } from '@/lib/locale-metadata'
import { SiteHeader } from '@/components/l2m/site-header'
import { HomeDemoProvider } from '@/components/home/home-state'
import { Hero } from '@/components/home/hero'
import { BuyerCapabilities } from '@/components/home/buyer-capabilities'
import { Transformation } from '@/components/home/transformation'
import { JourneySteps } from '@/components/veyfront/journey-steps'
import { CommercialOffers } from '@/components/veyfront/commercial-offers'
import { Proof } from '@/components/home/proof'
import { Invitation, SiteFooter } from '@/components/home/invitation'

export async function generateMetadata() {
  return localizedMetadata("/", "VEYFRONT — Building Digital Frontiers for Global Business", "VEYFRONT｜面向海外采购商的B2B企业网站建设与升级", "Build or rebuild an international B2B website with SEO-Native foundations, buyer-ready content, working inquiries and first-year basic hosting.", "为中国跨境B2B企业建设和升级海外官网：专业设计、中英文产品展示、搜索优化基础、在线询盘及首年基础托管。")
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
