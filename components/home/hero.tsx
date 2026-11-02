'use client'

import Link from 'next/link'
import { ArrowUpRight, Globe2, RefreshCw, Search, ScanSearch, Send, ChartNoAxesCombined } from 'lucide-react'
import { useLang } from '@/lib/i18n'

export function Hero() {
 const {lang}=useLang()
 const zh=lang==='zh'
 const outcomes=[
  {icon:Search,title:zh?'被海外客户找到':'Get discovered',detail:zh?'SEO-Native 搜索基础':'SEO-Native foundations'},
  {icon:ScanSearch,title:zh?'让买家看懂产品':'Help buyers evaluate',detail:zh?'清晰的产品与应用信息':'Product and application clarity'},
  {icon:Send,title:zh?'接收有效询盘':'Receive real inquiries',detail:zh?'产品相关的联系路径':'Product-aware contact paths'},
  {icon:ChartNoAxesCombined,title:zh?'看见网站效果':'See what works',detail:zh?'基础访问与询盘数据':'Visitor and inquiry signals'}
 ]
 return <section aria-labelledby="hero-title" className="bg-ink text-ivory">
   <div className="mx-auto grid max-w-[1440px] gap-12 px-5 py-16 md:px-10 lg:grid-cols-[minmax(0,1.12fr)_minmax(0,0.88fr)] lg:items-center lg:gap-16 lg:py-24">
    <div className="flex flex-col gap-7">
     <p className="w-fit rounded-full border border-ivory/20 px-3 py-1 font-mono text-xs uppercase tracking-[0.17em] text-ivory/75">VEYFRONT / DIGITAL FRONTIERS</p>
     <h1 id="hero-title" className="text-balance text-[36px] font-semibold leading-[1.13] tracking-tight sm:text-5xl xl:text-[58px]">
      {zh?'让海外客户找到你、看懂你，并向你发起询盘。':'Building Digital Frontiers for Global Business.'}
     </h1>
     <p className="max-w-2xl text-pretty text-lg leading-relaxed text-ivory/75">
      {zh?'从零建立或升级国际化 B2B 商业网站。专业设计、原生 SEO、产品内容与真实询盘，一次完整交付。':'Build a new international B2B website or improve your existing one. Professional design, SEO-Native foundations, buyer-ready content and real inquiry paths — delivered together.'}
     </p>
     <div className="grid gap-3 sm:grid-cols-2" aria-label={zh?'选择网站项目':'Choose a website project'}>
      <Link href="/start/launch" className="group flex min-h-28 flex-col justify-between gap-3 rounded-lg bg-lime p-5 font-semibold text-ink transition-transform hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-lime">
       <span className="flex items-center justify-between text-xs uppercase tracking-wider"><Globe2 className="size-5"/> LAUNCH <ArrowUpRight className="size-5"/></span>
       <span><span className="block text-xl">{zh?'我要建立新网站':'Build a new website'}</span><span className="mt-1 block text-sm font-normal opacity-80">{zh?'还没有独立站，从零开始':'Start from scratch'}</span></span>
      </Link>
      <Link href="/start/rebuild" className="group flex min-h-28 flex-col justify-between gap-3 rounded-lg border border-ivory/40 p-5 font-semibold text-ivory transition-transform hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-lime">
       <span className="flex items-center justify-between text-xs uppercase tracking-wider"><RefreshCw className="size-5"/> REBUILD <ArrowUpRight className="size-5"/></span>
       <span><span className="block text-xl">{zh?'我要升级旧网站':'Improve my current site'}</span><span className="mt-1 block text-sm font-normal text-ivory/70">{zh?'已有网站，保留有价值的内容':'Already have a site'}</span></span>
      </Link>
     </div>
     <p className="text-sm text-ivory/60">{zh?'两种方式，标准建设均为 ¥9,800 参考完整价。提交需求不产生收费。':'Both paths start from the same ¥9,800 complete-site reference price. Inquiries are free.'}</p>
    </div>
    <div className="rounded-xl border border-ivory/20 bg-ivory/5 p-5 shadow-2xl shadow-black/20 sm:p-7">
      <p className="border-b border-ivory/15 pb-5 font-mono text-xs uppercase tracking-widest text-lime">{zh?'一个真正能帮助业务的网站':'ONE WEBSITE / FOUR BUYER OUTCOMES'}</p>
      <div className="grid gap-3 pt-5 sm:grid-cols-2">
       {outcomes.map(({icon:Icon,title,detail},i)=><div key={i} className="flex min-h-32 flex-col justify-between gap-4 rounded-lg border border-ivory/15 bg-ivory/5 p-4">
        <Icon className="size-6 text-lime" aria-hidden="true"/>
        <div><h2 className="text-base font-semibold">{title}</h2><p className="mt-1 text-xs leading-relaxed text-ivory/60">{detail}</p></div>
       </div>)}
      </div>
      <Link href="/pricing" className="mt-5 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-lime underline underline-offset-4">{zh?'查看 ¥9,800 完整服务内容':'See what the ¥9,800 package includes'} <ArrowUpRight className="size-4"/></Link>
    </div>
   </div>
 </section>
}
