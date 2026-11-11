'use client'
import Link from '@/components/l2m/localized-link'
import { ArrowUpRight } from 'lucide-react'
import { useLang } from '@/lib/i18n'
const stages=[
 {name:['告诉我们您的产品和网站需求','Understand'],you:['选择新建或旧站升级，说明主营产品、目标市场和现有资料。','Choose Launch or Rebuild; share your goals and existing materials.'],we:['核对项目需求和可用的企业资料。','Review your brief and available business facts.'],get:['确认要建设的内容、语言和主要功能。','A clear understanding of your project.']},
 {name:['确认建设方案、服务清单和报价','Agree the scope'],you:['确认网站内容、语言、功能及交付安排。','Confirm content, languages, functions and delivery needs.'],we:['提供完整范围与书面报价，特殊需求提前说明。','Provide a complete scope and written quote, with exceptions disclosed upfront.'],get:['书面确认网站交付内容和项目总价。','An agreed delivery checklist and total price.']},
 {name:['预览网站，确认内容和修改意见','Build and preview'],you:['核对企业介绍、产品参数和联系方式，并在约定范围内提出修改意见。','Verify product facts, review desktop and mobile, and request in-scope refinements.'],we:['制作网站，测试 SEO 基础、询盘与关键交互。','Build the website and test SEO foundations, inquiry receipt and key interactions.'],get:['网站预览链接和验收项目清单。','A reviewable preview and acceptance checklist.']},
 {name:['确认验收，上线并移交网站','Launch and hand over'],you:['确认最终内容并授权上线。','Approve final content and authorize the launch.'],we:['上线、核验并移交约定的源码和资料。','Launch, verify and hand over the agreed source and documentation.'],get:['已上线的网站、首年基础托管及约定交付资料。','A live website, first-year basic hosting and handover package.']}
]
export function JourneySteps({detail=false}:{detail?:boolean}){
 const {lang}=useLang(),zh=lang==='zh'
 const HeadingTag = detail ? 'h1' : 'h2'
 return <section id="delivery-steps" aria-labelledby="delivery-steps-title" className="bg-ivory text-ink">
 <div className="mx-auto max-w-[1440px] px-5 py-16 md:px-10 lg:py-20">
  <p className="font-mono text-xs uppercase tracking-widest text-ink/60">{zh ? '合作流程 / 01—04' : 'HOW IT WORKS / 01—04'}</p>
  <HeadingTag id="delivery-steps-title" className="mt-3 max-w-4xl text-balance text-3xl font-semibold sm:text-[42px]">{zh?'从沟通需求到网站上线，四步完成合作。':'Four clear steps, from inquiry to launch.'}</HeadingTag>
  <p className="mt-4 max-w-2xl leading-relaxed text-ink/70">{zh?'新建官网或升级旧站，我们都会提前确认需求、报价和验收方式。':'Launch and Rebuild follow the same clear engagement process. Submitting an inquiry never changes an existing website.'}</p>
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
  {detail && <section className="mt-10 rounded-xl border border-ink/15 bg-mist/30 p-6" aria-labelledby="prepare-materials">
    <h2 id="prepare-materials" className="text-xl font-semibold">{zh?'开始建设前，需要准备什么？':'What should you prepare before the project?'}</h2>
    <p className="mt-3 max-w-3xl text-sm leading-relaxed text-ink/75">{zh?'先准备企业主营产品与服务、面向哪些国家或采购商、已有网站（如有）、产品规格与可授权展示的企业资料。没有完整素材也可以先沟通；但未经核实的项目业绩、证书和增长数据不会写进网站。':'Start with products, buyer markets, your existing URL if any, specifications and approved company materials. You can inquire before everything is ready; unverifiable client results, certifications and growth data are never invented.'}</p>
  </section>}
  {!detail && <Link href="/how-it-works" className="mt-7 inline-flex min-h-11 items-center gap-2 font-semibold underline underline-offset-4">{zh?'查看完整交付流程':'See the delivery process'} <ArrowUpRight className="size-4"/></Link>}
  {detail && <div className="mt-10 flex flex-wrap gap-3">
   <Link href="/start/launch" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-ink px-6 font-semibold text-ivory">{zh?'我要新建网站':'Start a new site'} <ArrowUpRight className="size-4"/></Link>
   <Link href="/start/rebuild" className="inline-flex min-h-12 items-center justify-center rounded-md border border-ink/25 px-6 font-semibold">{zh?'我要升级网站':'Improve an existing site'}</Link>
  </div>}
 </div>
 </section>
}
