'use client'

import Link from 'next/link'
import { ArrowUpRight, Check, ShieldCheck } from 'lucide-react'
import { useLang } from '@/lib/i18n'
import prices from '@/lib/commercial-offers.json'

const money=(v:number)=>'¥'+v.toLocaleString('en-US')
const included:[string,string][]=[
 ['专业视觉与手机适配，完整的企业、产品及联系信息结构','Professional design, mobile-ready pages and a clear company/product/contact structure'],
 ['中英文双语；通常最多整理50条客户提供的产品资料','English and Chinese; usually up to 50 structured, customer-supplied product records'],
 ['围绕1个主要产品方向梳理买家搜索需求，并设计2个应用/解决方案主题','Buyer-search focus for one product area and two application/solution topics'],
 ['搜索优化基础（SEO）：页面标题、规范网址、内部链接、站点地图和适用的多语言设置','SEO-Native: page titles, canonical URLs, internal links, sitemap and applicable multilingual settings'],
 ['经过测试、可接收的产品询盘功能及基础访问事件统计','Working product-related inquiry receipt and basic analytics events'],
 ['约定范围内的合理修改、源码移交与30天交付缺陷保障','In-scope refinements, source handover and 30-day defect coverage'],
 ['一次上线协助、首年基础托管与普通域名注册额度','One launch assist, first-year basic hosting and a standard-domain allowance']
]
const checklist:[string,string][]=[
 ['项目范围先确认','Agree the scope upfront'],
 ['双方确认范围内的常规调整不另收费','No per-page, product-batch or routine-revision surcharges'],
 ['常规旧站升级与新建同价','Regular Rebuild and Launch share the standard price'],
 ['客户拥有域名控制权并获得约定源码','Your domain stays under your control; agreed source is handed over']
]
export function CommercialOffers({detail=false}:{detail?:boolean}){
 const {lang}=useLang(),zh=lang==='zh',t=(x:[string,string])=>x[zh?0:1]
 if(!detail)return <section id="commercial-offers" aria-labelledby="commercial-offers-title" className="scroll-mt-8 border-t border-ink/15 bg-ivory text-ink">
  <div className="mx-auto grid max-w-[1440px] gap-8 px-5 py-16 md:px-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)] lg:items-center lg:py-20">
   <div className="space-y-5">
    <p className="font-mono text-xs uppercase tracking-widest text-ink/60">VEYFRONT / ONE CLEAR PRICE</p>
    <h2 id="commercial-offers-title" className="text-balance text-3xl font-semibold sm:text-[42px]">{zh?'¥9,800，建设面向海外采购商的 B2B 企业网站':'One clear price for a complete international B2B website.'}</h2>
    <p className="max-w-2xl text-base leading-relaxed text-ink/75">{zh?'新建网站和常规旧站升级，同一套标准服务：专业设计、中英文产品展示、搜索优化基础、在线询盘、上线协助及首年基础托管。':'Design, multilingual content, SEO-Native foundations, working inquiries, launch and first-year basic hosting — together. For new websites and regular rebuilds alike.'}</p>
    <div className="flex flex-wrap items-center gap-4">
     <span className="text-5xl font-semibold tabular-nums">{money(prices.build[0].price)}</span>
     <span className="text-sm text-ink/60">{zh?'标准方案参考价 · 具体范围以书面确认为准':'complete-site guide price · scope agreed upfront'}</span>
    </div>
    <Link href="/pricing" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-ink px-6 font-semibold text-ivory">{zh?'查看完整包含内容':'View full inclusions'} <ArrowUpRight className="size-4"/></Link>
   </div>
   <div className="rounded-xl border border-ink/15 bg-mist/40 p-6">
    <h3 className="text-xl font-semibold">{zh?'标准方案包含什么':'What is included'}</h3>
    <ul className="mt-5 space-y-4">
     {[
      zh?'专业设计 + 电脑手机适配':'Professional design + responsive layouts',
      zh?'中英文 + 产品资料与应用展示':'English/Chinese + product and application content',
      zh?'搜索优化基础（SEO）+ 在线询盘功能 + 基础统计':'SEO-Native + verified inquiries + analytics',
      zh?'源码交付 + 首年基础托管':'Source handover + first-year basic hosting'
     ].map(x=><li key={x} className="flex gap-3 text-sm leading-relaxed"><Check className="mt-0.5 size-4 shrink-0" aria-hidden="true"/>{x}</li>)}
    </ul>
    <p className="mt-5 border-t border-ink/15 pt-4 text-xs leading-relaxed text-ink/65">{zh?'标准产品资料通常最多50条；正常旧站网址衔接包含。第三语言及复杂项目在签约前明确，不会在建设中临时收费。':'A normal catalogue usually covers up to 50 supplied records; ordinary URL continuity is included for Rebuild. A third language or complex project is agreed before signing, not charged unexpectedly.'}</p>
   </div>
  </div>
 </section>
 return <section id="commercial-offers" aria-labelledby="commercial-offers-title" className="bg-ivory text-ink">
 <div className="mx-auto max-w-[1440px] space-y-10 px-5 py-14 md:px-10 lg:py-20">
  <div className="max-w-4xl space-y-5">
   <p className="font-mono text-xs uppercase tracking-widest text-ink/60">SERVICES & PRICING / BUILD · REBUILD · RUN</p>
   <h1 id="commercial-offers-title" className="text-balance text-4xl font-semibold leading-tight sm:text-[54px]">{zh?'建站服务与价格，清楚列明':'Complete service. One clear price.'}</h1>
   <p className="max-w-2xl text-lg leading-relaxed text-ink/70">{zh?'为有海外业务的企业建设专业网站。新建和常规旧站升级采用相同标准参考价；约定范围内的调整不另收费。':'One complete B2B site, not a collection of page, product or revision fees. The standard price is the same for a new site or a regular rebuild.'}</p>
  </div>
  <div className="grid gap-5 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,0.65fr)]">
   <article className="rounded-xl border border-ink/15 bg-mist/35 p-6 md:p-8">
    <p className="font-mono text-xs uppercase tracking-widest text-ink/60">FRONTIER BUILD / LAUNCH + REBUILD</p>
    <div className="mt-4 flex flex-wrap items-end gap-3"><span className="text-5xl font-semibold tabular-nums">{money(prices.build[0].price)}</span><span className="pb-2 text-sm text-ink/65">{zh?'标准方案参考价':'complete-site guide price'}</span></div>
    <p className="mt-4 text-sm leading-relaxed text-ink/75">{zh?'以客户提供并确认的企业、产品及应用资料为基础，交付可上线、可接收产品询盘的 B2B 企业网站。':'A clear, searchable, inquiry-ready B2B website, built from verified customer materials.'}</p>
    <h2 className="mt-7 border-t border-ink/15 pt-6 text-xl font-semibold">{zh?'标准建设包含':'Standard delivery includes'}</h2>
    <ul className="mt-5 space-y-4">
     {included.map(x=><li key={x[0]} className="flex items-start gap-3 text-sm leading-relaxed"><Check className="mt-0.5 size-4 shrink-0"/><span>{t(x)}</span></li>)}
    </ul>
    <div className="mt-8 flex flex-wrap gap-3">
     <Link href="/start/launch" className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-md bg-ink px-5 font-semibold text-ivory">{zh?'我要新建网站':'Build a new website'} <ArrowUpRight className="size-4"/></Link>
     <Link href="/start/rebuild" className="inline-flex min-h-12 flex-1 items-center justify-center rounded-md border border-ink/25 px-5 font-semibold">{zh?'我要升级旧站':'Improve my website'}</Link>
    </div>
   </article>
   <aside className="space-y-6 rounded-xl border border-ink/15 bg-ivory p-6 md:p-8">
    <ShieldCheck className="size-7" aria-hidden="true"/>
    <h2 className="text-xl font-semibold">{zh?'交付范围清楚，费用透明':'Clear scope, no surprise fees'}</h2>
    <ul className="space-y-3">
     {checklist.map(x=><li key={x[0]} className="flex gap-2 text-sm leading-relaxed"><Check className="mt-1 size-4 shrink-0"/>{t(x)}</li>)}
    </ul>
    <div className="border-t border-ink/15 pt-5">
     <h3 className="font-semibold">{zh?'什么情况需要单独确认？':'What requires separate scoping?'}</h3>
     <p className="mt-2 text-sm leading-relaxed text-ink/75">{zh?'大型产品数据库、复杂旧站系统迁移、原创三维或定制业务应用。特殊项目只在签约前另行商议；未经同意不增加费用。':'Large product databases, complex legacy migrations, original 3D content and bespoke business systems. Any different-scope work is discussed before signing and never added without approval.'}</p>
    </div>
    <div className="border-t border-ink/15 pt-5">
     <h3 className="font-semibold">{zh?'语言与内容范围':'Languages and source content'}</h3>
     <p className="mt-2 text-sm leading-relaxed text-ink/75">{zh?'标准包括中英文及通常最多50条可批量整理的产品资料；可适配的同结构第三语言，由双方在签约前确认。':'English/Chinese and normally up to 50 structured product records are included. A feasible third language with the same page structure is confirmed before signing.'}</p>
    </div>
   </aside>
  </div>
  <div className="grid gap-5 lg:grid-cols-2">
   <section className="rounded-xl border border-ink/15 p-6">
    <h2 className="text-xl font-semibold">{zh?'网站上线与首年运行':'Launch and the first year'}</h2>
    <p className="mt-3 text-sm leading-relaxed text-ink/75">{zh?'标准项目包含一次上线协助、首年基础商业托管、HTTPS及常规域名首年注册额度 ¥150。域名由客户掌控，托管不绑定。实际资源范围、第三方例外和第二年续费金额，必须签约前说明。':'Includes one launch assist, first-year basic commercial hosting, HTTPS and a ¥150 allowance for a normal domain registration. The domain remains client-controlled. Hosting resources, vendor exceptions and year-two renewal terms are confirmed before signing.'}</p>
   </section>
   <section className="rounded-xl border border-ink/15 p-6">
    <h2 className="text-xl font-semibold">{zh?'如何验收？':'How is it accepted?'}</h2>
    <p className="mt-3 text-sm leading-relaxed text-ink/75">{zh?'以确认的网站结构、准确业务事实、移动端、SEO 基础和实际询盘接收为清单验收。约定范围内合理修改不另收费；交付后30天内修复约定范围的缺陷。':'Acceptance covers agreed site structure, approved business facts, mobile layouts, SEO basics and a test of actual inquiry receipt. Reasonable in-scope fixes are included, with 30-day coverage for delivery defects.'}</p>
   </section>
  </div>
  <div className="rounded-xl border border-ink/15 bg-mist/30 p-6">
   <div className="flex flex-wrap items-start justify-between gap-4">
    <div className="max-w-2xl"><p className="font-mono text-xs uppercase tracking-widest text-ink/60">OPTIONAL / FRONTIER RUN</p><h2 className="mt-2 text-xl font-semibold">{zh?'持续维护与优化（可选）':'Ongoing improvement'}</h2><p className="mt-2 text-sm leading-relaxed text-ink/75">{zh?'如需定期更新内容、检查询盘功能，并按季度回顾搜索和询盘数据，可选择 Frontier Run。它是独立的增值服务，不是网站续费的必选项。':'For ongoing small content edits, inquiry checks and quarterly search/inquiry reviews. Run is separate from the first-year hosting included in Build and is not required to keep the site online.'}</p></div>
    <div className="shrink-0 text-right"><p className="text-3xl font-semibold">{money(prices.run.priceYear)}<span className="ml-1 text-sm font-normal text-ink/65">{zh?'/年':'/year'}</span></p><Link href="/contact" className="mt-3 inline-flex min-h-11 items-center font-semibold underline underline-offset-4">{zh?'咨询 Run':'Ask about Run'}</Link></div>
   </div>
  </div>
  <p className="text-xs leading-relaxed text-ink/65">{zh?'¥9,800 为标准建设参考价，实际范围、费用及税务条件以签约前书面确认为准。搜索优化基础（SEO）不保证搜索收录、排名、询盘数量或成交。':'¥9,800 is an indicative complete-site price subject to a written scope and tax terms before signing. SEO-Native provides a technical and content foundation, not a promise of indexing, ranking, inquiry volume or sales.'}</p>
 </div>
 </section>
}
