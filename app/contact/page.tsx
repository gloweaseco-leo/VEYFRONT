import { diagnosisPreviewEnabled } from '@/lib/diagnosis-preview'
import { localizedMetadata } from '@/lib/locale-metadata'
import { ContactPage } from '@/components/veyfront/intake-pages'
export async function generateMetadata() {
  return localizedMetadata("/contact", "Contact VEYFRONT | Discuss Your B2B Website", "外贸建站咨询｜微信联系与项目需求 - VEYFRONT", "Start a B2B website project inquiry with VEYFRONT.", "免费提交企业建站或旧站升级需求，联系VEYFRONT了解交付范围和报价。")
}
export default function Page(){ return <ContactPage previewOnly={diagnosisPreviewEnabled}/> }
