import { localizedMetadata } from '@/lib/locale-metadata'
import { IntakePage } from '@/components/veyfront/intake-pages'
export async function generateMetadata() {
  return localizedMetadata("/contact/privacy", "Privacy Requests — VEYFRONT", "个人信息与隐私请求｜VEYFRONT", "Request access, correction or deletion of information sent to VEYFRONT.", "申请查阅、更正或删除此前向VEYFRONT提交的联系信息和个人资料。", { index: false, follow: false })
}
export default function Page(){ return <IntakePage service="privacy"/> }
