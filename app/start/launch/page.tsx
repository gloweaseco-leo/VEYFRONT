import { diagnosisPreviewEnabled } from '@/lib/diagnosis-preview'
import { localizedMetadata } from '@/lib/locale-metadata'
import { IntakePage } from '@/components/veyfront/intake-pages'
export async function generateMetadata() {
  return localizedMetadata("/start/launch", "Build a New International B2B Website | VEYFRONT", "新建外贸独立站咨询｜B2B企业建站 - VEYFRONT", "Tell us your goals for a new international B2B website.", "提交主营产品与目标市场，咨询从零建设面向海外采购商的B2B企业官网。")
}
export default function Page(){ return <IntakePage service="launch" previewOnly={diagnosisPreviewEnabled} /> }
