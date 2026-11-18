'use client'
import { ShieldCheck, FileCheck2, LockKeyhole } from 'lucide-react'
import { useLang } from '@/lib/i18n'
const assurances=[
 {icon:FileCheck2,zh:['产品和企业资料真实可核对','企业介绍、产品参数和资质以客户提供并确认的资料为准，不编造业绩或认证。'],en:['Business facts you can verify','Product claims and company evidence come from approved sources. We do not invent cases or certifications.']},
 {icon:ShieldCheck,zh:['正式上线前完成实际检查','按约定检查手机端显示、基础SEO设置、关键按钮与询盘提交，提供可核对的验收记录。'],en:['Clear acceptance before launch','Mobile layouts, SEO basics, actual inquiry receipt and key links are checked against the agreed scope.']},
 {icon:LockKeyhole,zh:['域名和网站资产由客户掌控','客户掌握域名，获得约定的网站源码和素材；包含首年基础托管，后续可选择续费或迁移。'],en:['Your website stays in your control','Client-controlled domain and agreed source handover. First-year basic hosting is included; renewal or migration remains optional.']}
]
export function Proof(){
 const {lang}=useLang(),zh=lang==='zh'
 return <section id="proof" aria-labelledby="proof-title" className="bg-mist/40 text-ink">
  <div className="mx-auto max-w-[1440px] px-4 py-11 sm:px-5 sm:py-16 md:px-10 lg:py-20">
   <p className="font-mono text-xs uppercase tracking-widest text-ink/60">{zh ? '为什么选择我们' : 'DELIVERY PRINCIPLES'}</p>
   <h2 id="proof-title" className="mt-3 max-w-4xl text-balance text-[27px] font-semibold leading-[1.25] sm:text-[42px]">{zh?'为什么选择 VEYFRONT？把交付质量和客户控制权落实到每一步。':'Clear work. Verifiable delivery. Your control.'}</h2>
   <div className="mt-6 grid gap-3 sm:mt-8 sm:gap-4 lg:grid-cols-3">
    {assurances.map(({icon:Icon,zh:z,en:e},i)=>{const c=zh?z:e;return <div key={i} className="flex flex-col gap-3 rounded-xl border border-ink/15 bg-white p-4 sm:gap-4 sm:bg-ivory sm:p-6"><Icon className="size-7" aria-hidden="true"/><h3 className="text-[18px] font-semibold sm:text-xl">{c[0]}</h3><p className="text-[14px] leading-[1.7] text-ink/75 sm:text-base">{c[1]}</p></div>})}
   </div>
  </div>
 </section>
}
