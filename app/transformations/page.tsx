import { localizedMetadata } from '@/lib/locale-metadata'
import { TransformationsPage } from '@/components/pages/transformations'

export async function generateMetadata() {
  return localizedMetadata("/transformations", "B2B Website Experience Comparison — VEYFRONT", "B2B网站体验升级对比｜VEYFRONT", "Explore how B2B website structure helps overseas buyers find products, review technical specifications and submit inquiries.", "从采购商视角了解B2B网站升级前后的产品查找、规格评估与询盘体验差异。", { index: false, follow: true })
}
export default function Page() {
  return <TransformationsPage />
}
