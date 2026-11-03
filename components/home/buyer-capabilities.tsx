'use client'
import { Search, ClipboardList, MailCheck, ChartNoAxesCombined } from 'lucide-react'
import { useLang } from '@/lib/i18n'
const items=[
 {icon:Search,zh:['搜索发现','从关键词与买家问题出发组织页面，配置可抓取的产品、应用及多语言搜索基础。'],en:['Search discovery','Build crawlable pages around buyer questions, product intent and clear international site structure.']},
 {icon:ClipboardList,zh:['采购评估','将客户提供并核对的规格、应用场景与企业证明整理为容易比较的内容。'],en:['Buyer evaluation','Organize verified product specifications, applications and company evidence for clearer decisions.']},
 {icon:MailCheck,zh:['在线询盘','买家可从产品页面提交型号、规格等采购需求；上线前逐项测试接收与通知。'],en:['Working inquiries','Let buyers submit product-related needs; verify actual submission, storage and notification.']},
 {icon:ChartNoAxesCombined,zh:['效果跟踪','了解网站访问、联系点击与实际收到的询盘，为后续优化提供依据。'],en:['Measurable actions','Distinguish page visits, contact clicks and confirmed inquiries so improvements can be informed by data.']}
]
export function BuyerCapabilities(){
 const {lang}=useLang(), zh=lang==='zh'
 return <section id="buyer-capabilities" aria-labelledby="buyer-capabilities-title" className="bg-mist/40 text-ink">
  <div className="mx-auto max-w-[1440px] px-5 py-16 md:px-10 lg:py-20">
   <div className="max-w-3xl">
    <p className="font-mono text-xs uppercase tracking-wider text-ink/60">SEARCH · EVALUATE · INQUIRE · IMPROVE</p>
    <h2 id="buyer-capabilities-title" className="mt-3 text-balance text-3xl font-semibold sm:text-[42px]">{zh?'不只是把网站做漂亮，更要方便海外买家找到产品、联系企业。':'Designed around what your buyers need to do.'}</h2>
   </div>
   <div className="mt-9 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
    {items.map(({icon:Icon,zh:z,en:e},i)=>{const c=zh?z:e;return <article key={i} className="flex flex-col gap-4 rounded-xl border border-ink/15 bg-ivory p-6">
     <Icon className="size-7" aria-hidden="true"/><h3 className="text-xl font-semibold">{c[0]}</h3><p className="leading-relaxed text-ink/70">{c[1]}</p>
    </article>})}
   </div>
  </div>
 </section>
}
