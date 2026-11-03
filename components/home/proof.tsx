'use client'
import { ShieldCheck, FileCheck2, LockKeyhole } from 'lucide-react'
import { useLang } from '@/lib/i18n'
const assurances=[
 {icon:FileCheck2,zh:['企业事实有依据','产品规格、企业资质和客户案例以提供的资料及授权为准；无法证实的内容不编造。'],en:['Business facts you can verify','Product claims and company evidence come from approved sources. We do not invent cases or certifications.']},
 {icon:ShieldCheck,zh:['上线前逐项验收','手机适配、基础 SEO、实际询盘接收和关键链接，按照双方确认的范围检查。'],en:['Clear acceptance before launch','Mobile layouts, SEO basics, actual inquiry receipt and key links are checked against the agreed scope.']},
 {icon:LockKeyhole,zh:['网站资产与域名由客户掌控','域名由客户掌控，约定源码及资产移交；首年基础托管包含，后续续费或迁移可选择。'],en:['Your website stays in your control','Client-controlled domain and agreed source handover. First-year basic hosting is included; renewal or migration remains optional.']}
]
export function Proof(){
 const {lang}=useLang(),zh=lang==='zh'
 return <section id="proof" aria-labelledby="proof-title" className="bg-mist/40 text-ink">
  <div className="mx-auto max-w-[1440px] px-5 py-16 md:px-10 lg:py-20">
   <p className="font-mono text-xs uppercase tracking-widest text-ink/60">DELIVERY PRINCIPLES</p>
   <h2 id="proof-title" className="mt-3 max-w-4xl text-balance text-3xl font-semibold sm:text-[42px]">{zh?'交付内容清晰可查，网站资产由您掌控。':'Clear work. Verifiable delivery. Your control.'}</h2>
   <div className="mt-8 grid gap-4 lg:grid-cols-3">
    {assurances.map(({icon:Icon,zh:z,en:e},i)=>{const c=zh?z:e;return <div key={i} className="flex flex-col gap-4 rounded-xl border border-ink/15 bg-ivory p-6"><Icon className="size-7" aria-hidden="true"/><h3 className="text-xl font-semibold">{c[0]}</h3><p className="leading-relaxed text-ink/70">{c[1]}</p></div>})}
   </div>
  </div>
 </section>
}
