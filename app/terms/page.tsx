import { localizedMetadata } from '@/lib/locale-metadata'
import { PolicyPage } from '@/components/veyfront/policy-pages'
export async function generateMetadata() {
  return localizedMetadata("/terms", "Website Terms — VEYFRONT", "网站使用条款｜VEYFRONT", "Read terms for VEYFRONT's website and commercial inquiries.", "VEYFRONT服务参考价格、网站演示案例及正式签约条款说明。")
}
export default function Page(){ return <PolicyPage kind="terms"/> }
