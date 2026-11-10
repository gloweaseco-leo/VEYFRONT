import { localizedMetadata } from '@/lib/locale-metadata'
import { SiteHeader } from '@/components/l2m/site-header'
import { HomeDemoProvider } from '@/components/home/home-state'
import { Hero } from '@/components/home/hero'
import { BuyerCapabilities } from '@/components/home/buyer-capabilities'
import { Transformation } from '@/components/home/transformation'
import { JourneySteps } from '@/components/veyfront/journey-steps'
import { PricingTeaserV35 } from '@/components/veyfront/pricing-v35'
import { Proof } from '@/components/home/proof'
import { Invitation, SiteFooter } from '@/components/home/invitation'

export async function generateMetadata() {
  return localizedMetadata("/", "International B2B Website Design & Rebuild | VEYFRONT", "外贸独立站建设与旧站升级｜B2B企业网站服务 - VEYFRONT", "Bilingual B2B websites with verified inquiry paths, first-year hosting, and three months of services. Three indicative packages from ¥3,680.", "VEYFRONT为中国出海企业提供中英文海外官网建设与常规旧站升级，含真实询盘接收、首年基础托管及3个月服务权益，三档参考价¥3,680、¥6,680、¥9,680。")
}
export default function HomePage(){
 return <HomeDemoProvider>
  <SiteHeader tone="dark"/>
  <main>
   <Hero/>
   <PricingTeaserV35/>
   <BuyerCapabilities/>
   <Transformation/>
   <JourneySteps/>
   <Proof/>
   <Invitation/>
  </main>
  <SiteFooter/>
 </HomeDemoProvider>
}
