import { diagnosisPreviewEnabled } from '@/lib/diagnosis-preview'
import { localizedMetadata } from '@/lib/locale-metadata'
import { SiteHeader } from '@/components/l2m/site-header'
import { HomeDemoProvider } from '@/components/home/home-state'
import { Hero } from '@/components/home/hero'
import { BuyerCapabilities } from '@/components/home/buyer-capabilities'
import { CustomerScenarios } from '@/components/home/customer-scenarios'
import { Transformation } from '@/components/home/transformation'
import { JourneySteps } from '@/components/veyfront/journey-steps'
import { PricingTeaserV35 } from '@/components/veyfront/pricing-v35'
import { Proof } from '@/components/home/proof'
import { Invitation, SiteFooter } from '@/components/home/invitation'

export async function generateMetadata() {
  return localizedMetadata("/", "International B2B Website Design & Rebuild | VEYFRONT", "中国制造业外贸官网建设与升级｜VEYFRONT", "Bilingual B2B websites with verified inquiry paths, first-year hosting, and three months of services. Three indicative packages from ¥3,680.", "VEYFRONT为中国制造业和B2B外贸企业新建或升级海外官网，提供产品展示、在线询盘、基础SEO、首年托管及约定的后续服务。")
}
export default function HomePage(){
 return <HomeDemoProvider>
  <SiteHeader tone="dark"/>
  <main>
   <Hero showDiagnosis={diagnosisPreviewEnabled}/>
   <CustomerScenarios/>
   <BuyerCapabilities/>
   <Transformation/>
   <Proof/>
   <PricingTeaserV35/>
   <JourneySteps/>
   <Invitation/>
  </main>
  <SiteFooter/>
 </HomeDemoProvider>
}
