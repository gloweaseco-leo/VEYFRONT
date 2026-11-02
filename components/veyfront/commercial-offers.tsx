'use client'

import Link from 'next/link'
import { ArrowUpRight, Check, ShieldCheck } from 'lucide-react'
import { useLang } from '@/lib/i18n'
import offers from '@/lib/commercial-offers.json'

const money=(n:number)=>'¥'+n.toLocaleString('en-US')

const deliverables:[string,string][]=[
  ['专业视觉及移动端适配，完整企业与产品信息架构','Professional design, responsive experience and a complete business/product structure'],
  ['常规企业产品目录批量整理（通常最多50条），中英文双语','Organized product catalogue (normally up to 50 supplied records), English and Chinese'],
  ['可适配时增加一门同结构目标市场语言，签约前确认','An additional same-structure market language where feasible, confirmed before signing'],
  ['SEO-Native：产品与应用内容、规范网址、元数据、内部链接及国际化搜索基础','SEO-Native: product and application content, canonical URLs, metadata, internal links and international search foundations'],
  ['产品关联的真实询盘接收验证与基础转化数据追踪','Verified receipt of product-related inquiries and basic conversion-event tracking'],
  ['约定范围内修改至验收通过，源码交付及30天交付缺陷保障','In-scope refinements through acceptance, source handover and 30-day defect remedy'],
  ['首年基础托管与上线支持，常规域名首年注册额度内包含','First-year basic hosting, launch support and a standard domain registration allowance'],
]
const benefits:[string,string][]=[
  ['SEO-Native / 从建站开始为搜索发现做好准备','SEO-Native / structured from the start for search discovery'],
  ['Buyer-Ready / 让采购商更容易理解产品与应用','Buyer-Ready / help buyers evaluate products and applications'],
  ['Inquiry-Ready / 让客户询盘能够真正送达','Inquiry-Ready / working inquiry submission and receipt'],
  ['Measure-Ready / 为后续网站优化留下数据基础','Measure-Ready / analytics foundations for future improvement'],
]

export function CommercialOffers({detail=false}:{detail?:boolean}){
 const {lang}=useLang()
 const zh=lang==='zh'
 const t=(p:[string,string])=>p[zh?0:1]
 return <section id="commercial-offers" aria-labelledby="commercial-offers-title" className="scroll-mt-8 border-t border-ink/15 bg-mist/30 text-ink">
  <div className="mx-auto flex max-w-[1440px] flex-col gap-9 px-5 py-16 md:px-10 lg:py-20">
   <div className="max-w-4xl space-y-3">
    <p className="font-mono text-xs uppercase tracking-widest text-ink/60">VEYFRONT / BUILD · REBUILD · RUN</p>
    <h2 id="commercial-offers-title" className="text-balance text-3xl font-semibold leading-tight sm:text-4xl">
     {zh?'一个价格，完整建设你的海外 B2B 商业网站。':'One clear price for a complete international B2B website.'}
    </h2>
    <p className="text-base leading-relaxed text-ink/75">
     {zh?'不靠增加页面、产品条数、修改轮次来层层收费。专业视觉、双语、原生 SEO、真实询盘、上线与首年基础运行，正常企业网站一价包含。':'A complete business website, without small surcharges for routine pages, catalogue entries or in-scope refinements. Design, multilingual foundations, SEO-Native, working inquiries, launch and first-year basic hosting are included.'}
    </p>
   </div>

   <div className="grid gap-5 lg:grid-cols-[minmax(0,1.16fr)_minmax(0,0.84fr)]">
    <article className="flex min-w-0 flex-col gap-5 rounded-xl border border-ink/15 bg-ivory p-6 md:p-8">
     <div className="space-y-2">
      <p className="font-mono text-xs uppercase tracking-wider text-ink/60">FRONTIER BUILD / ONE COMPLETE WEBSITE</p>
      <h3 className="text-2xl font-semibold">{zh?'专业国际化商业网站':'Complete B2B business website'}</h3>
      <p className="pt-2 text-[38px] font-semibold leading-none tabular-nums sm:text-[44px]">{money(offers.build[0].price)}<span className="ml-2 align-middle text-xs font-normal text-ink/60">{zh?'一站完整建设 · 参考价':'complete standard site · guide price'}</span></p>
      <p className="text-sm leading-relaxed text-ink/70">{zh?'适用于从零新建或正常规模的旧站升级，均按确认范围完成交付。':'For a new website or a regular-size rebuild, delivered to an agreed acceptance checklist.'}</p>
     </div>
     <div className="grid gap-3 border-y border-ink/15 py-5 sm:grid-cols-2">
      {benefits.map(p=><div key={p[0]} className="flex items-start gap-2 text-sm leading-relaxed"><Check aria-hidden="true" className="mt-0.5 size-4 shrink-0"/><span>{t(p)}</span></div>)}
     </div>
     <ul className="flex flex-col gap-3">
      {deliverables.map(p=><li key={p[0]} className="flex items-start gap-2 text-sm leading-relaxed text-ink/80"><Check aria-hidden="true" className="mt-0.5 size-4 shrink-0"/><span>{t(p)}</span></li>)}
     </ul>
     <div className="mt-auto flex flex-wrap gap-3 pt-3">
      <Link href="/start/launch" className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-md bg-ink px-5 font-semibold text-ivory">{zh?'新建网站 · 提交需求':'Start a new site'}<ArrowUpRight className="size-4" aria-hidden="true"/></Link>
      <Link href="/start/rebuild" className="inline-flex min-h-12 flex-1 items-center justify-center rounded-md border border-ink/25 px-5 font-semibold">{zh?'旧站升级 · 提交需求':'Improve my site'}</Link>
     </div>
    </article>
    <aside className="flex flex-col gap-5 rounded-xl border border-ink/15 bg-ivory p-6 md:p-8">
     <div className="space-y-3">
      <ShieldCheck aria-hidden="true" className="size-7"/>
      <h3 className="text-xl font-semibold">{zh?'不用担心后续被逐项加价':'No surprise add-on invoices'}</h3>
      <p className="text-sm leading-relaxed text-ink/75">{zh?'正常网站的页面结构、批量产品录入、约定范围内的合理修改及常规旧站网址衔接，已包含在标准交付内。':'Ordinary site pages, supplied product records, in-scope corrections and a bounded legacy-URL transition are part of the standard work.'}</p>
     </div>
     <div className="space-y-3 border-t border-ink/15 pt-5">
      <h3 className="text-xl font-semibold">{zh?'特殊项目，开始前说明':'Special projects are scoped first'}</h3>
      <p className="text-sm leading-relaxed text-ink/75">{zh?'大型数据库、复杂旧站系统迁移、专业原创3D或定制业务应用，先评估、再书面确认；未经同意不增加费用。':'Large databases, complex legacy-system migrations, original 3D production and bespoke business software are assessed and agreed in writing before work. No added charges without approval.'}</p>
     </div>
     <div className="mt-auto space-y-2 border-t border-ink/15 pt-5">
      <h3 className="font-semibold">{zh?'网站始终属于客户':'You remain in control'}</h3>
      <p className="text-sm leading-relaxed text-ink/75">{zh?'域名由客户掌控；源码及约定素材随项目移交。首年基础运行包含，第二年是否续费或迁移由客户决定。':'The domain stays under your control, with agreed source and assets handed over. First-year basic hosting is included; renewal or migration is your choice.'}</p>
     </div>
    </aside>
   </div>

   <div className="flex flex-col gap-4 rounded-xl border border-ink/15 bg-ivory p-6 lg:flex-row lg:items-center lg:justify-between">
    <div className="space-y-2">
     <h3 className="text-xl font-semibold">Frontier Run · {money(offers.run.priceYear)}{zh?'/年':'/year'}</h3>
     <p className="max-w-3xl text-sm leading-relaxed text-ink/75">{zh?'非必购服务：首年基础运行已经包含；如需持续的内容调整、询盘检查、技术维护及季度搜索和询盘数据回顾，可选择 Run。':'Optional ongoing improvement beyond first-year basic hosting: small content edits, inquiry and technical health checks, and quarterly search/inquiry reviews.'}</p>
    </div>
    <Link href="/contact" className="inline-flex min-h-12 shrink-0 items-center justify-center rounded-md border border-ink/25 px-5 font-semibold">{zh?'了解持续运营':'Ask about Run'}</Link>
   </div>

   <p className="max-w-4xl text-xs leading-relaxed text-ink/65">
    {zh?'¥9,800 为正常规模项目参考完整价，签约前明确页面结构、原始资料、域名及合理资源用量，确认一次总价。常规域名首年注册限额 ¥150，超出限额或特殊第三方服务提前说明。SEO 为技术与内容基础，不保证搜索排名、流量或成交。':'¥9,800 is an indicative complete-site price for an agreed normal-size project. Scope, source material, fair-use hosting and domain details are confirmed before signing. Standard first-year domain registration allowance: up to ¥150. Exceptional third-party services are disclosed upfront. SEO foundations do not guarantee ranking, traffic or sales.'}
   </p>

   {detail ? <div className="grid gap-7 border-t border-ink/15 pt-8 md:grid-cols-2">
    <div className="space-y-3">
     <h3 className="text-xl font-semibold">{zh?'正常企业站如何验收？':'What makes delivery complete?'}</h3>
     <p className="text-sm leading-relaxed text-ink/75">{zh?'客户确认商业事实后，依照双方签约前约定的网站结构、产品目录、语言、手机布局、SEO 基础、实际询盘接收及数据事件逐项验收；约定范围内缺陷和合理修正不额外收费。':'Acceptance checks the agreed site structure, verified source materials, languages, mobile layouts, SEO foundations, actual inquiry receipt and analytics events. In-scope corrections do not incur extra charges.'}</p>
     <p className="text-sm leading-relaxed text-ink/75">{zh?'标准产品目录适用于结构清晰、可批量整理的客户资料，通常最多50条；同结构第三语言需评估术语、字体和排版支持。':'A normal structured catalogue generally covers up to 50 supplied records. A third same-structure language is considered where terminology and layout support are verified before signing.'}</p>
    </div>
    <div className="space-y-3">
     <h3 className="text-xl font-semibold">{zh?'首年之后怎么办？':'What happens after year one?'}</h3>
     <p className="text-sm leading-relaxed text-ink/75">{zh?'首年基础托管、HTTPS、基础运行检查及标准域名注册额度包含在建设服务中。续费方案与金额应在签约前明确；不购买 Frontier Run 也不会影响客户对域名和源码的所有权。':'First-year basic commercial hosting, HTTPS, baseline health checks and the agreed domain allowance are included. Any renewal fee and terms are disclosed before signing. Frontier Run is never required to retain your domain or source.'}</p>
     <p className="text-sm leading-relaxed text-ink/75">{zh?'旧站升级包含合理重要网址映射与上线切换核查；复杂 CMS、权限受限平台及大量历史资产迁移需要单独规划。':'Ordinary rebuilds include a bounded priority-URL map and cutover check. Complex CMS, restricted platforms and large historical migrations require separate planning.'}</p>
    </div>
   </div> : <Link href="/pricing" className="w-fit text-sm font-semibold underline underline-offset-4">{zh?'查看完整服务说明':'See the complete service scope'}</Link>}
  </div>
 </section>
}
