import { localizedMetadata } from '@/lib/locale-metadata'
import { PageShell } from '@/components/site/page-shell'
import { JourneySteps } from '@/components/veyfront/journey-steps'
export async function generateMetadata() {
  return localizedMetadata("/how-it-works", "B2B Website Build Process | VEYFRONT", "外贸网站建设流程｜需求、报价到验收 - VEYFRONT", "From inquiry and a written quote to supervised build, preview, acceptance and handover for B2B Launch or Rebuild websites.", "了解VEYFRONT从需求沟通、确认方案与报价，到预览、验收上线及网站交付的全过程。")
}
export default function Page(){return <PageShell><JourneySteps detail/></PageShell>}
