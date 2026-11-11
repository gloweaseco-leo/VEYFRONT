'use client'
import { Search, ClipboardList, MailCheck, ChartNoAxesCombined } from 'lucide-react'
import { useLang } from '@/lib/i18n'
const items=[
 {icon:Search,zh:['海外客户更容易找到产品','围绕海外客户常用的产品名称、用途和采购问题组织页面，做好网站基础SEO设置。'],en:['Search discovery','Build crawlable pages around buyer questions, product intent and clear international site structure.']},
 {icon:ClipboardList,zh:['产品参数和工厂实力更清楚','把产品参数、应用场景、工厂能力和资质整理清楚，方便客户判断是否适合采购。'],en:['Buyer evaluation','Organize verified product specifications, applications and company evidence for clearer decisions.']},
 {icon:MailCheck,zh:['客户可以直接询价','海外客户可在产品页面填写采购需求，附带型号和规格；上线前实际测试询盘能否收到。'],en:['Working inquiries','Let buyers submit product-related needs; verify actual submission, storage and notification.']},
 {icon:ChartNoAxesCombined,zh:['网站运行和询盘情况可检查','查看网站访问、联系按钮点击和实际收到的询盘，帮助判断后续需要改进的地方。'],en:['Measurable actions','Distinguish page visits, contact clicks and confirmed inquiries so improvements can be informed by data.']}
]
export function BuyerCapabilities(){
 const {lang}=useLang(), zh=lang==='zh'
 return <section id="buyer-capabilities" aria-labelledby="buyer-capabilities-title" className="bg-mist/40 text-ink">
  <div className="mx-auto max-w-[1440px] px-5 py-16 md:px-10 lg:py-20">
   <div className="max-w-3xl">
    <p className="font-mono text-xs uppercase tracking-wider text-ink/60">{zh ? '从产品展示到客户询盘' : 'SEARCH · EVALUATE · INQUIRE · IMPROVE'}</p>
    <h2 id="buyer-capabilities-title" className="mt-3 text-balance text-3xl font-semibold sm:text-[42px]">{zh?'不只把网站做漂亮，更要让海外客户找到产品、了解企业并方便联系。':'Designed around what your buyers need to do.'}</h2>
   </div>
   <div className="mt-9 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
    {items.map(({icon:Icon,zh:z,en:e},i)=>{const c=zh?z:e;return <article key={i} className="flex flex-col gap-4 rounded-xl border border-ink/15 bg-ivory p-6">
     <Icon className="size-7" aria-hidden="true"/><h3 className="text-xl font-semibold">{c[0]}</h3><p className="leading-relaxed text-ink/70">{c[1]}</p>
    </article>})}
   </div>
  </div>
 </section>
}
