import { localizedMetadata } from '@/lib/locale-metadata'
import { ContactPage } from '@/components/veyfront/intake-pages'
export async function generateMetadata() {
  return localizedMetadata("/contact", "Contact — VEYFRONT", "建站咨询与联系我们｜VEYFRONT", "Start a B2B website project inquiry with VEYFRONT.", "免费提交企业建站或旧站升级需求，联系VEYFRONT了解交付范围和报价。")
}
export default function Page(){ return <ContactPage/> }
