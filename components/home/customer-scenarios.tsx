'use client'

import Link from '@/components/l2m/localized-link'
import { Factory, RefreshCw, UsersRound, ArrowUpRight } from 'lucide-react'
import { useLang } from '@/lib/i18n'

const scenarios = [
  {
    icon: Factory, number: '01', href: '/start/launch',
    zh: { problem: '还没有自己的海外官网', headline: '有工厂、有产品，却缺少专业的海外展示窗口', service: '从零建设中英文外贸官网，把产品、制造能力和联系方式清楚展示给海外客户。', action: '咨询新建官网' },
    en: { problem: 'No international website yet', headline: 'You have products and manufacturing capabilities, but no credible overseas website', service: 'Launch a bilingual B2B site with products, verified capabilities and working contact paths.', action: 'Build a website' },
  },
  {
    icon: RefreshCw, number: '02', href: '/start/rebuild',
    zh: { problem: '网站老旧、内容难找', headline: '网站像电子画册，客户难以选型和询价', service: '升级版式与手机体验，梳理产品分类、规格参数和询盘入口。', action: '咨询旧站升级' },
    en: { problem: 'An outdated website', headline: 'Your site looks like a catalog, but buyers struggle to compare and inquire', service: 'Improve mobile layouts, product structure, specifications and inquiry paths.', action: 'Improve my website' },
  },
  {
    icon: UsersRound, number: '03', href: '/pricing',
    zh: { problem: '已有外贸团队', headline: '网站建了，但业务员没有好用的推广资料', service: '围绕重点产品制作英文推广内容、选型指南，并提供约定范围的搜索或市场研究支持。', action: '了解销售支持方案' },
    en: { problem: 'An active export team', headline: 'Your sales team needs better content to share with buyers', service: 'Prepare English outreach materials, buyer guides and scoped search or market research.', action: 'Explore sales support' },
  },
]

export function CustomerScenarios() {
  const { lang } = useLang()
  const zh = lang === 'zh'
  return <section id="customer-needs" aria-labelledby="customer-needs-title" className="bg-ivory text-ink">
    <div className="mx-auto max-w-[1440px] px-5 py-14 md:px-10 lg:py-20">
      <p className="text-xs font-semibold tracking-[0.12em] text-ink/60">{zh ? '先看看您属于哪种情况' : 'WHERE TO START'}</p>
      <h2 id="customer-needs-title" className="mt-3 max-w-4xl text-balance text-3xl font-semibold leading-snug sm:text-[42px]">{zh ? '外贸网站遇到的问题，不同企业有不同的解法。' : 'A practical solution for your stage of international business.'}</h2>
      <p className="mt-4 max-w-3xl leading-relaxed text-ink/70">{zh ? '您不需要先研究技术，也不必一开始就选套餐。看看哪一种情况最接近您的企业。' : 'Start with the challenge your team faces today.'}</p>
      <div className="mt-8 grid gap-4 lg:grid-cols-3">
        {scenarios.map(({ icon: Icon, number, href, zh: cn, en }) => {
          const c = zh ? cn : en
          return <article key={number} className="group flex min-h-[310px] flex-col rounded-xl border border-ink/15 bg-mist/30 p-6 transition-colors hover:border-ink/45 hover:bg-mist/55 sm:p-7">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-ink/50">{number} / {c.problem}</span>
              <Icon aria-hidden="true" className="size-6 text-ink/70"/>
            </div>
            <h3 className="mt-8 text-balance text-[22px] font-semibold leading-snug">{c.headline}</h3>
            <p className="mt-4 flex-1 text-sm leading-7 text-ink/70">{c.service}</p>
            <Link href={href} className="mt-6 inline-flex min-h-11 items-center gap-2 self-start border-b border-ink/60 text-sm font-semibold transition-colors hover:border-ink">{c.action}<ArrowUpRight className="size-4" aria-hidden="true"/></Link>
          </article>
        })}
      </div>
    </div>
  </section>
}
