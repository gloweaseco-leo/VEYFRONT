import { localizedMetadata } from '@/lib/locale-metadata'
import { PageShell } from '@/components/site/page-shell'
import { CommercialOffers } from '@/components/veyfront/commercial-offers'

export async function generateMetadata() {
  return localizedMetadata("/pricing", "B2B Website Pricing: Build & Rebuild from ¥9,800 | VEYFRONT", "外贸网站建设报价｜¥9,800标准服务与价格 - VEYFRONT", "A complete B2B website from ¥9,800: professional design, SEO-Native foundation, structured product content, working inquiries and first-year basic hosting.", "B2B企业网站建设和常规升级标准参考价¥9,800，包含中英文网站、产品展示、在线询盘、搜索优化基础及首年托管。")
}
export default function PricingPage() {
  return <PageShell><CommercialOffers detail /></PageShell>
}
