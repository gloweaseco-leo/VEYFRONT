'use client'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { useLang } from '@/lib/i18n'
const stages=[
 {name:['告诉我们您需要什么网站','Understand'],you:['选择新建或旧站升级，说明主营产品、目标市场和现有资料。','Choose Launch or Rebuild; share your goals and existing materials.'],we:['核对项目需求和可用的企业资料。','Review your brief and available business facts.'],get:['一份清晰的需求确认。','A clear understanding of your project.']},
 {name:['确认建设方案与总价','Agree the scope'],you:['确认网站内容、语言、功能及交付安排。','Confirm content, languages, functions and delivery needs.'],we:['提供完整范围与书面报价，特殊需求提前说明。','Provide a complete scope and written quote, with exceptions disclosed upfront.'],get:['约定交付清单及总价。','An agreed delivery checklist and total price.']},
 {name:['查看预览并提出修改','Build and preview'],you:['审核产品事实，查看电脑与手机版本并提出合理修改。','Verify product facts, review desktop and mobile, and request in-scope refinements.'],we:['制作网站，测试 SEO 基础、询盘与关键交互。','Build the website and test SEO foundations, inquiry receipt and key interactions.'],get:['可审核的网站预览及验收清单。','A reviewable preview and acceptance checklist.']},
 {name:['验收上线，交付网站','Launch and hand over'],you:['确认最终内容并授权上线。','Approve final content and authorize the launch.'],we:['上线、核验并移交约定的源码和资料。','Launch, verify and hand over the agreed source and documentation.'],get:['已上线网站、首年基础运行与交付资料。','A live website, first-year basic hosting and handover package.']}
]
export function JourneySteps({detail=false}:{detail?:boolean}){
 const {lang}=useLang(),zh=lang==='zh'
 return <section id="delivery-steps" aria-labelledby="delivery-steps-title" className="bg-ivory text-ink">
 <div className="mx-auto max-w-[1440px] px-5 py-16 md:px-10 lg:py-20">
  <p className="font-mono text-xs uppercase tracking-widest text-ink/60">HOW IT WORKS / 01—04</p>
  <h2 id="delivery-steps-title" className="mt-3 max-w-4xl text-balance text-3xl font-semibold sm:text-[42px]">{zh?'从提交需求到网站上线，四步说清楚。':'Four clear steps, from inquiry to launch.'}</h2>
  <p className="mt-4 max-w-2xl leading-relaxed text-ink/70">{zh?'从需求沟通到网站交付，新建和旧站升级都遵循清晰的四步流程。':'Launch and Rebuild follow the same clear engagement process. Submitting an inquiry never changes an existing website.'}</p>
  <ol className="mt-9 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
   {stages.map((s,i)=><li key={i} className="flex h-full flex-col gap-4 rounded-xl border border-ink/15 bg-mist/30 p-6">
    <span className="font-mono text-2xl text-ink/55">0{i+1}</span>
    <h3 className="text-xl font-semibold">{s.name[zh?0:1]}</h3>
    <p className="text-sm leading-relaxed text-ink/70">{s.get[zh?0:1]}</p>
    {detail && <div className="mt-2 space-y-3 border-t border-ink/15 pt-4 text-sm leading-relaxed">
      <p><strong>{zh?'你需要做：':'You:'}</strong> {s.you[zh?0:1]}</p>
      <p><strong>{zh?'VEYFRONT 负责：':'VEYFRONT:'}</strong> {s.we[zh?0:1]}</p>
    </div>}
   </li>)}
  </ol>
  {!detail && <Link href="/how-it-works" className="mt-7 inline-flex min-h-11 items-center gap-2 font-semibold underline underline-offset-4">{zh?'查看完整交付流程':'See the delivery process'} <ArrowUpRight className="size-4"/></Link>}
  {detail && <div className="mt-10 flex flex-wrap gap-3">
   <Link href="/start/launch" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-ink px-6 font-semibold text-ivory">{zh?'我要新建网站':'Start a new site'} <ArrowUpRight className="size-4"/></Link>
   <Link href="/start/rebuild" className="inline-flex min-h-12 items-center justify-center rounded-md border border-ink/25 px-6 font-semibold">{zh?'我要升级网站':'Improve an existing site'}</Link>
  </div>}
 </div>
 </section>
}
