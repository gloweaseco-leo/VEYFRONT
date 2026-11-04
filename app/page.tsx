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
  return localizedMetadata("/", "International B2B Website Design & Rebuild | VEYFRONT", "外贸独立站建设与旧站升级｜B2B企业网站服务 - VEYFRONT", "Launch or redesign your international B2B website with multilingual product pages, SEO foundations, verified inquiry paths and first-year hosting. Clear scope from ¥9,800.", "VEYFRONT为中国出口企业提供外贸独立站建设与旧网站升级：中英文产品展示、SEO基础、真实询盘接收及首年基础托管，标准参考价¥9,800。")
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
