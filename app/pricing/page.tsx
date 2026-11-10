import { localizedMetadata } from '@/lib/locale-metadata'
import { PageShell } from '@/components/site/page-shell'
import { PricingV35 } from '@/components/veyfront/pricing-v35'

export async function generateMetadata() {
  return localizedMetadata("/pricing", "B2B Website Packages & Pricing | VEYFRONT", "外贸网站建设服务与价格｜三档方案 - VEYFRONT", "Compare three B2B website packages from ¥3,680 to ¥9,680 with buyer trust, SEO-native content, first-year hosting and three months of professional services.", "比较VEYFRONT外贸独立站三档方案：¥3,680专业启航、¥6,680商业拓展、¥9,680增长领航，包含首年基础托管和3个月专业服务权益。")
}
export default function PricingPage() {
  return <PageShell><PricingV35 /></PageShell>
}
