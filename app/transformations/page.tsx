import { localizedMetadata } from '@/lib/locale-metadata'
import { TransformationsPage } from '@/components/pages/transformations'

export async function generateMetadata() {
  return localizedMetadata("/transformations", "Website Transformation Concepts — VEYFRONT", "网站设计示例｜VEYFRONT", "Illustrative before-and-after industrial B2B website design comparisons; not completed customer projects.", "虚构工业企业网站的设计对比，展示产品查找、技术规格与询盘体验可以如何改善。", { index: false, follow: true })
}
export default function Page() {
  return <TransformationsPage />
}
