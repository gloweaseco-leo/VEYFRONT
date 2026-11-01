import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { p2a3Enabled } from '@/lib/l2m-p2a3'
import { AcyGroundedPlanPreview } from '@/components/veyfront/acy-grounded-plan-preview'

export const dynamic='force-dynamic'
export const metadata:Metadata={
 title:'VEYFRONT × L2M P2-A3 · Private Evidence-Bound Planning',
 robots:{index:false,follow:false},
}
export default function Page(){
 if(!p2a3Enabled())notFound()
 return <AcyGroundedPlanPreview/>
}
