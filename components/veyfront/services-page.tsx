'use client'
import Link from 'next/link'
import { ArrowUpRight, RefreshCw, Globe2, TrendingUp, ShieldCheck } from 'lucide-react'
import { PageShell } from '@/components/site/page-shell'
import { useLang } from '@/lib/i18n'

export function ServicesPage() {
  const { lang } = useLang()
  const zh = lang === 'zh'
  return <PageShell>
    <section className="bg-ink text-ivory">
      <div className="vf-lines mx-auto max-w-[1440px] px-5 py-16 md:px-10 lg:py-24">
        <p className="mb-5 font-mono text-xs uppercase tracking-[0.19em] text-lime">VEYFRONT / SERVICES</p>
        <h1 className="max-w-5xl text-balance text-[42px] font-semibold leading-[1.08] tracking-tight sm:text-[64px]">{zh ? '你的全球商业网站，从这里开始。' : 'A stronger digital front for your global business.'}</h1>
        <p className="mt-7 max-w-2xl text-lg leading-relaxed text-ivory/75">{zh ? '从零建立网站，或重构现有网站。让设计、内容与客户行动围绕真实业务目标协同。' : 'Launch a new B2B website or rebuild the one you already have. Put design, content and buyer journeys to work together.'}</p>
      </div>
    </section>
    <section className="mx-auto grid max-w-[1440px] gap-5 px-5 py-14 md:px-10 lg:grid-cols-2 lg:py-20">
      <article className="vf-open-frame flex flex-col gap-6 rounded-xl bg-mist/50 p-7 md:p-10">
        <Globe2 className="size-7 text-ink" aria-hidden="true" />
        <div><p className="font-mono text-xs uppercase tracking-widest text-ink/65">01 / Launch</p><h2 className="mt-3 text-3xl font-semibold">{zh ? '从零建立网站' : 'Build from the beginning'}</h2></div>
        <p className="text-base leading-relaxed text-ink/75">{zh ? '基于已确认的企业信息、产品、目标市场和客户行动，规划并建设专业 B2B 企业网站。可先真实提交项目需求，具体服务范围与报价需另行确认；自动建站尚未上线。' : 'Start with your verified business facts, products, buyer markets and inquiry goals. You can submit a real project inquiry. Scope and pricing are confirmed separately; automated generation is not live.'}</p>
        <ul className="grid gap-2 text-sm text-ink/80">
          <li>01 — {zh ? '企业定位与目标市场' : 'Business positioning and markets'}</li>
          <li>02 — {zh ? '内容、页面和视觉规划' : 'Content, pages and visual direction'}</li>
          <li>03 — {zh ? '客户评估与联系路径' : 'Buyer evaluation and contact journeys'}</li>
        </ul>
        <Link href="/start/launch" className="mt-auto inline-flex min-h-12 w-fit items-center gap-2 rounded-md bg-ink px-5 font-semibold text-ivory">Launch <ArrowUpRight className="size-4" /></Link>
      </article>
      <article className="vf-open-frame flex flex-col gap-6 rounded-xl border border-ink/20 bg-ivory p-7 md:p-10">
        <RefreshCw className="size-7 text-ink" aria-hidden="true" />
        <div><p className="font-mono text-xs uppercase tracking-widest text-ink/65">02 / Rebuild</p><h2 className="mt-3 text-3xl font-semibold">{zh ? '重构现有网站' : 'Transform the website you have'}</h2></div>
        <p className="text-base leading-relaxed text-ink/75">{zh ? '从旧站网址出发，围绕视觉品质、商业内容和客户询盘路径做系统升级。现在可以提交真实改造咨询；自动诊断尚未上线，提交时不会抓取或修改你的网站。' : 'Start from your existing URL. Rebuild the visual experience, content and inquiry journey. The inquiry is live; automatic diagnosis is not. Submitting does not fetch or alter your site.'}</p>
        <ul className="grid gap-2 text-sm text-ink/80">
          <li>01 — {zh ? '旧站诊断与证据' : 'Evidence-led website review'}</li>
          <li>02 — {zh ? '改造方案与范围确认' : 'Upgrade plan and scope'}</li>
          <li>03 — {zh ? '预览、核实与独立交付' : 'Preview, verify and hand over'}</li>
        </ul>
        <div className="mt-auto flex flex-wrap gap-3">
          <Link href="/start/rebuild" className="inline-flex min-h-12 items-center gap-2 rounded-md bg-ink px-5 font-semibold text-ivory">Rebuild <ArrowUpRight className="size-4" /></Link>
          <Link href="/transformations" className="inline-flex min-h-12 items-center gap-2 rounded-md border border-ink/20 px-5 font-semibold">{zh ? '查看改造演示' : 'Explore demo'}</Link>
        </div>
      </article>
    </section>
    <section className="border-y border-ink/15 bg-mist/35">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-5 px-5 py-12 md:flex-row md:items-center md:justify-between md:px-10">
        <div className="flex items-center gap-4"><TrendingUp className="size-6" /><div><h2 className="text-xl font-semibold">Grow <span className="font-mono text-xs font-medium text-ink/55">/ LATER</span></h2><p className="mt-1 text-sm text-ink/70">{zh ? '持续内容与客户体验升级，后续按明确范围推出。不是强制托管。' : 'Scoped content and buyer-experience improvements, planned for later. Not mandatory hosting.'}</p></div></div>
        <span className="w-fit rounded-full border border-ink/25 px-4 py-2 font-mono text-xs uppercase">{zh ? '尚未开放' : 'Not yet available'}</span>
      </div>
    </section>
    <section className="mx-auto flex max-w-[1440px] flex-col gap-4 px-5 py-16 md:px-10">
      <ShieldCheck className="size-6" /><h2 className="text-2xl font-semibold">{zh ? '交付应当可验证，也可独立使用。' : 'Built to be verified and handed over.'}</h2>
      <p className="max-w-3xl leading-relaxed text-ink/70">{zh ? '网站成果、源码、素材、部署依赖与询盘服务的范围在实际购买前确认。兼容环境中的独立部署是目标；一次性上线协助与后续托管均可选。所有演示案例会清楚标注来源和状态。' : 'Actual delivery terms specify source, assets, deployment dependencies and inquiry services before purchase. Independent deployment requires a compatible environment. Launch assistance and hosting are optional; demo evidence stays labeled.'}</p>
    </section>
  </PageShell>
}
