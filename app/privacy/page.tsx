import { localizedMetadata } from '@/lib/locale-metadata'
import { PolicyPage } from '@/components/veyfront/policy-pages'
export async function generateMetadata() {
  return localizedMetadata("/privacy", "Privacy Notice — VEYFRONT", "隐私说明｜VEYFRONT", "Read how VEYFRONT handles inquiries and contact data.", "了解VEYFRONT对咨询资料、联系信息及隐私请求的处理方式。")
}
export default function Page(){ return <PolicyPage kind="privacy"/> }
