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
    <div className="mx-auto max-w-[1440px] px-4 py-11 sm:px-5 sm:py-14 md:px-10 lg:py-20">
      <p className="text-xs font-semibold tracking-[0.12em] text-ink/60">{zh ? '先看看您属于哪种情况' : 'WHERE TO START'}</p>
      <h2 id="customer-needs-title" className="mt-3 max-w-4xl text-balance text-[27px] font-semibold leading-[1.24] sm:text-[42px] sm:leading-snug">{zh ? '外贸网站遇到的问题，不同企业有不同的解法。' : 'A practical solution for your stage of international business.'}</h2>
      <p className="mt-3 max-w-3xl text-[15px] leading-[1.75] text-ink/75 sm:mt-4 sm:text-base">{zh ? '您不需要先研究技术，也不必一开始就选套餐。看看哪一种情况最接近您的企业。' : 'Start with the challenge your team faces today.'}</p>
      <div className="mt-6 grid gap-3 sm:mt-8 sm:gap-4 lg:grid-cols-3">
        {scenarios.map(({ icon: Icon, number, href, zh: cn, en }, index) => {
          const c = zh ? cn : en
          return <article key={number} data-testid="mobile-scenario-card" className={'group flex flex-col rounded-2xl border p-5 shadow-[0_8px_24px_rgba(23,38,45,0.04)] transition-colors sm:p-7 lg:min-h-[310px] ' + (index === 0 ? 'border-ink bg-ink text-ivory md:border-ink/15 md:bg-mist/30 md:text-ink md:hover:bg-mist/55' : index === 1 ? 'border-ink/15 bg-white text-ink md:bg-mist/30 md:hover:bg-mist/55' : 'border-ink/15 bg-mist/70 text-ink md:bg-mist/30 md:hover:bg-mist/55')}>
            <div className="flex items-center justify-between">
              <span className={'font-mono text-xs ' + (index === 0 ? 'text-ivory/70 md:text-ink/50' : 'text-ink/60 md:text-ink/50')}>{number} / {c.problem}</span>
              <Icon aria-hidden="true" className={'size-6 ' + (index === 0 ? 'text-lime md:text-ink/70' : 'text-ink/70')}/>
            </div>
            <h3 className="mt-5 text-balance text-[21px] font-semibold leading-[1.36] md:mt-8 md:text-[22px]">{c.headline}</h3>
            <p data-testid="mobile-scenario-description" className={'mt-3 text-[15px] leading-[1.75] md:mt-4 md:flex-1 md:text-sm md:leading-7 ' + (index === 0 ? 'text-ivory/80 md:text-ink/70' : 'text-ink/70')}>{c.service}</p>
            <Link href={href} data-testid="mobile-scenario-action" className={'mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 self-start rounded-lg px-4 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 md:mt-6 md:w-auto md:justify-start md:rounded-none md:border-b md:border-ink/60 md:bg-transparent md:px-0 md:text-ink md:hover:border-ink ' + (index === 0 ? 'bg-lime text-ink focus-visible:outline-lime' : 'bg-ink text-ivory focus-visible:outline-ink')}>{c.action}<ArrowUpRight className="size-4" aria-hidden="true"/></Link>
          </article>
        })}
      </div>
    </div>
  </section>
}
