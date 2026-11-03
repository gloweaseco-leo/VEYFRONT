import { localizedMetadata } from '@/lib/locale-metadata'
import { IntakePage } from '@/components/veyfront/intake-pages'
export async function generateMetadata() {
  return localizedMetadata("/start/rebuild", "Rebuild Inquiry — VEYFRONT", "旧网站升级咨询｜VEYFRONT", "Tell us about your existing B2B website and improvement goals.", "提供现有网站网址，咨询网站视觉升级、产品展示、在线询盘和海外买家体验优化。")
}
export default function Page(){ return <IntakePage service="rebuild" /> }
