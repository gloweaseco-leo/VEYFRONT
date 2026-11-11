'use client'

import Link from '@/components/l2m/localized-link'
import { Fragment, useState } from 'react'
import { ArrowRight, ArrowUpRight, Check, CheckCircle2, Globe2, Search, ShieldCheck, UsersRound } from 'lucide-react'
import { useLang } from '@/lib/i18n'
import publicOffers from '@/lib/public-offers.json'

type Pair = readonly [string, string]
type PlanId = 'start' | 'sales' | 'growth'
type Plan = { id: PlanId; title: Pair; price: string; subtitle: Pair; fit: Pair; points: Pair[]; featured?: boolean }
type CompareRow = { name: Pair; cells: readonly [Pair, Pair, Pair] }
type CompareGroup = { title: Pair; rows: CompareRow[] }

const plans: Plan[] = [
  { id: 'start', title: [publicOffers.plans.start.titleZh, 'Professional Start'], price: publicOffers.plans.start.priceDisplay,
    subtitle: ['建一个能清楚展示企业和产品的外贸官网', 'Build a credible global presence'],
    fit: ['适合刚开始建设海外官网的企业', 'For businesses establishing their first global website'],
    points: [
      ['中英文外贸官网、产品展示与在线询盘', 'Bilingual website with working inquiries'],
      ['工厂实力、产品与资质展示', 'Supplier credibility and product presentation'],
      ['Google等搜索引擎的基础SEO设置', 'Google SEO-native foundation'],
      ['赠3个月网站维护与启用服务', '3 months of website launch support included'],
    ] },
  { id: 'sales', title: [publicOffers.plans.sales.titleZh, 'Sales Expansion'], price: publicOffers.plans.sales.priceDisplay,
    subtitle: ['为外贸业务员提供网站与英文推广资料', 'Make existing export sales more effective'],
    fit: ['适合已有产品及外贸销售渠道的企业', 'For teams already selling to overseas buyers'],
    points: [
      ['包含启航版的网站建设与维护服务', 'Includes the core website and care services'],
      ['重点产品采购调研及1个选型指南网页', 'Buyer research and one product-selection guide'],
      ['1套英文产品推广资料', 'English sales outreach content pack'],
      ['含3个月约定的销售推广支持', '3 months of sales-enablement support included'],
    ], featured: true },
  { id: 'growth', title: [publicOffers.plans.growth.titleZh, 'Growth Navigator'], price: publicOffers.plans.growth.priceDisplay,
    subtitle: ['在建站基础上增加海外市场与潜在客户调研', 'Explore new overseas buyer opportunities'],
    fit: ['适合计划开拓新市场和客户的企业', 'For businesses entering new markets and buyer segments'],
    points: [
      ['包含专业网站及销售推广权益', 'Includes website and sales-enablement benefits'],
      ['2个产品应用介绍或选型指南网页', 'Two application and buyer-selection guides'],
      ['搜索内容优化或海外潜在客户调研，二选一', 'Choose search growth or target-buyer research'],
      ['含3个月约定的增长研究服务', '3 months of focused growth service included'],
    ] },
]

const groups: CompareGroup[] = [
  { title: ['01 · 外贸企业官网', '01 · Global B2B website'], rows: [
    { name: ['专业中英文官网、移动端适配', 'Bilingual responsive business website'], cells: [['包含','Included'],['包含','Included'],['包含','Included']] },
    { name: ['产品分类、详情与在线询盘', 'Product catalogue, details and inquiries'], cells: [['包含','Included'],['包含','Included'],['包含','Included']] },
    { name: ['产品资料整理与录入（标准数量上限）', 'Structured product records (standard cap)'], cells: [['最多' + publicOffers.plans.start.productRecordCap + '条','Up to 10'],['最多' + publicOffers.plans.sales.productRecordCap + '条','Up to 30'],['最多' + publicOffers.plans.growth.productRecordCap + '条','Up to 50']] },
    { name: ['工厂实力、资质及制造能力展示', 'Supplier proof and buyer trust'], cells: [['企业与制造能力','Company & manufacturing'],['质量、认证、定制能力','Quality, certification, custom work'],['技术、应用、项目证据','Technical, application & case evidence']] },
    { name: ['新站建设或常规旧站升级', 'New build or standard website rebuild'], cells: [['包含','Included'],['包含','Included'],['包含','Included']] },
  ] },
  { title: ['02 · 产品内容与搜索优化', '02 · Buyer content and search'], rows: [
    { name: ['网站SEO基础及搜索内容优化', 'SEO-native implementation'], cells: [['技术与页面基础','Technical foundation'],['采购搜索意图优化','Buyer-search intent'],['专业主题搜索布局','Topic-based search planning']] },
    { name: ['产品应用介绍或选型指南', 'Application and buyer-selection guides'], cells: [['—','—'],['1个','1 guide'],['2个','2 guides']] },
    { name: ['企业介绍、产品参数及常见采购问题', 'Verified company & product knowledge'], cells: [['基础资料','Core facts'],['重点采购问答','Buyer FAQs'],['技术选型与应用知识','Technical buyer knowledge']] },
    { name: ['优化产品信息结构，方便AI搜索工具理解', 'AI-search content readiness'], cells: [['基础结构化内容','Structured core content'],['重点产品知识优化','Product knowledge optimization'],['主题知识与可见性研究','Topic knowledge and visibility research']] },
  ] },
  { title: ['03 · 海外销售与市场研究', '03 · Sales and market research'], rows: [
    { name: ['英文企业介绍', 'English company introduction'], cells: [['包含','Included'],['包含','Included'],['包含','Included']] },
    { name: ['重点产品海外采购需求调研', 'Buyer-needs research for one product'], cells: [['—','—'],['1个方向','One product focus'],['1个方向','One product focus']] },
    { name: ['英文产品推广资料', 'English product sales content pack'], cells: [['—','—'],['1套','One pack'],['1套','One pack']] },
    { name: ['为现有销售渠道准备推广资料和链接', 'Existing sales-channel adaptation'], cells: [['基础使用指导','Basic use guide'],['1条渠道','One channel'],['1条渠道','One channel']] },
    { name: ['海外搜索优化或潜在客户调研', 'Focused growth research project'], cells: [['—','—'],['—','—'],['搜索或目标买家研究（二选一）','Search or target-buyer research']] },
  ] },
  { title: ['04 · 赠送3个月专业服务', '04 · Three months of included services'], rows: [
    { name: ['网站运行及询盘接收检查', 'Website and inquiry health checks'], cells: [['3次','3 checks'],['3次','3 checks'],['3次','3 checks']] },
    { name: ['网页少量内容修改', 'Small edits to existing content'], cells: [['最多3处','Up to 3'],['最多3处','Up to 3'],['最多3处','Up to 3']] },
    { name: ['Google搜索基础检查', 'Google search basics check'], cells: [['1次','One'],['1次','One'],['1次','One']] },
    { name: ['英文产品推广资料制作', 'English sales outreach assets'], cells: [['基础推广说明','Basic sharing guide'],['1套','One pack'],['1套','One pack']] },
    { name: ['重点产品网页或询盘页面优化', 'Priority page or inquiry improvement'], cells: [['—','—'],['1处','One page'],['按选定专项实施2轮','Two scoped improvement cycles']] },
    { name: ['附有来源的调研成果', 'Evidence-backed research deliverables'], cells: [['—','—'],['采购关注点摘要','Buyer-needs summary'],['一份增长专项成果包','One growth research deliverable']] },
    { name: ['服务完成记录与总结', 'Service completion record & summary'], cells: [['包含','Included'],['包含','Included'],['包含','Included']] },
  ] },
  { title: ['05 · 网站托管与交付保障', '05 · Hosting and delivery'], rows: [
    { name: ['首年基础网站托管、HTTPS', 'First-year commercial hosting & HTTPS'], cells: [['包含','Included'],['包含','Included'],['包含','Included']] },
    { name: ['实际测试询盘提交和接收', 'Verified inquiry receipt'], cells: [['包含','Included'],['包含','Included'],['包含','Included']] },
    { name: ['交付约定的网站源码与素材', 'Agreed source and asset handover'], cells: [['包含','Included'],['包含','Included'],['包含','Included']] },
    { name: ['交付后30天缺陷保障', '30-day delivery defect coverage'], cells: [['包含','Included'],['包含','Included'],['包含','Included']] },
  ] },
]

const faqs: { q: Pair; a: Pair }[] = [
  { q: ['3个月服务可以提前使用吗？', 'Can I use the three-month benefits right away?'],
    a: ['可以。3个月是服务权益有效期，不是按月排定的交付进度。资料与授权齐全后，约定的销售素材、内容修改或研究可以提前启动并交付；持续运行检查则在有效期内合理分布。', 'Yes. Three months is the benefit validity period, not a fixed delivery schedule. Once materials and approvals are ready, fixed deliverables can start immediately; ongoing checks are spread across the service term.'] },
  { q: ['网站建设、托管和3个月服务是同一笔费用吗？', 'Are build, hosting and three-month services included?'],
    a: ['三档标准价格均包含约定建设交付、首年基础托管及上线后的3个月服务权益。第二年托管及特殊第三方费用会在签约前书面明确，持续增长服务不强制购买。', 'Each standard package includes the agreed website, first-year basic hosting and three months of defined services. Year-two hosting and exceptional third-party costs are disclosed in writing before signing; ongoing growth services are optional.'] },
  { q: ['产品应用介绍或选型指南是什么？', 'What is an application and buyer-selection guide?'],
    a: ['它是一份围绕具体采购问题的专业网页，组织已核实的应用需求、参数、相关产品、供应商能力证明和询价入口；不是替客户设计工程方案。', 'A focused page explaining a real application, buyer decision criteria, relevant products, verified supplier evidence and inquiry options. It is not an engineering design service.'] },
  { q: ['20家潜在买家等于20个有采购意向的客户吗？', 'Are 20 researched companies 20 confirmed buyers?'],
    a: ['不是。领航版选择目标买家专项时，研究最多20家具有公开来源的候选企业，并对其中最多5家进一步核查匹配理由。并不承诺其正在采购、提供有效联系人或产生回复与订单。', 'No. In the target-buyer track, we research up to 20 source-backed candidate companies and further evaluate up to five. This does not guarantee buying intent, contacts, responses or orders.'] },
  { q: ['SEO与AI搜索优化保证排名或询盘吗？', 'Does SEO or AI-search optimization guarantee traffic or leads?'],
    a: ['不保证。我们提供搜索友好的架构、真实专业内容、研究与优化记录；Google收录、AI引用、询盘及成交依赖外部因素和实际经营反馈。', 'No. We provide technically sound structure, verified specialist content and documented improvements, not guaranteed indexing, AI citations, inquiries or sales.'] },
  { q: ['新建和旧站升级是否都能选三档？', 'Are all plans available for Launch and Rebuild?'],
    a: ['可以。常规范围的新建或旧站升级均可选择三档，复杂CMS迁移、大型产品数据库或定制软件需求须在签约前单独确认，不会未经同意临时增项。', 'Yes. Each tier supports a standard new site or rebuild. Complex migrations, large databases and bespoke systems require separate written scoping before commitment.'] },
]


/** Mobile visitors compare the three prices at once, then read one plan at a time. */
function MobilePlanTabs({ value, onChange }: { value: PlanId; onChange: (value: PlanId) => void }) {
  const { lang } = useLang()
  const zh = lang === 'zh'
  return <div role="group" aria-label={zh ? '切换查看三个套餐' : 'Compare three plans'} data-testid="mobile-plan-tabs"
    className="grid grid-cols-3 gap-1.5 rounded-xl border border-ink/15 bg-white/75 p-1.5">
    {plans.map(p => {
      const active = p.id === value
      return <button key={p.id} type="button" aria-pressed={active} onClick={() => onChange(p.id)}
        className={'min-w-0 rounded-lg px-1.5 py-3 text-center focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ink ' +
          (active ? 'bg-ink text-ivory' : 'text-ink hover:bg-mist/40')}>
        <span className="block text-[11px] font-semibold leading-tight">{p.title[zh ? 0 : 1]}</span>
        <span className={'mt-1 block text-[15px] font-bold tabular-nums tracking-tight ' + (active ? 'text-lime' : 'text-ink')}>¥{p.price}</span>
      </button>
    })}
  </div>
}

function MobilePlanOverview({ value }: { value: PlanId }) {
  const { lang } = useLang()
  const zh = lang === 'zh'
  const plan = plans.find(p => p.id === value)!
  const t = (pair: Pair) => pair[zh ? 0 : 1]
  return <article data-testid="mobile-plan-detail" className="mt-3 rounded-xl border border-ink/15 bg-white/90 p-5">
    <p className="text-xs font-semibold text-ink/60">{zh ? '您正在查看' : 'Selected plan'} · {t(plan.title)}</p>
    <h3 className="mt-2 text-xl font-semibold">{t(plan.subtitle)}</h3>
    <p className="mt-2 text-sm leading-relaxed text-ink/65">{t(plan.fit)}</p>
    <ul className="mt-4 space-y-3 border-t border-ink/10 pt-4">
      {plan.points.map((point, i) => <li key={i} className="flex items-start gap-2.5 text-sm leading-relaxed text-ink/85">
        <Check className="mt-0.5 size-4 shrink-0" aria-hidden="true"/><span>{t(point)}</span>
      </li>)}
    </ul>
    <Link href={'/contact?plan=' + plan.id}
      className="mt-5 flex min-h-12 items-center justify-center gap-2 rounded-lg bg-ink px-4 text-sm font-semibold text-ivory focus-visible:outline-2 focus-visible:outline-offset-2">
      {zh ? '咨询' + t(plan.title) + '方案' : 'Discuss ' + t(plan.title)} <ArrowRight className="size-4" aria-hidden="true"/>
    </Link>
    <p className="mt-3 text-xs leading-relaxed text-ink/60">{zh ? '提交咨询无需付款；实际范围及报价签约前确认。' : 'No payment to inquire. Scope and quote are confirmed first.'}</p>
  </article>
}

function MobileServiceComparison({ value, onChange }: { value: PlanId; onChange: (id: PlanId) => void }) {
  const { lang } = useLang()
  const zh = lang === 'zh'
  const t = (pair: Pair) => pair[zh ? 0 : 1]
  const index = plans.findIndex(p => p.id === value)
  return <div className="mt-7 md:hidden" data-testid="mobile-service-comparison">
    <p className="mb-3 text-sm text-ink/70">{zh ? '点选套餐，查看每项具体包含什么服务。' : 'Select a plan to review its included services below.'}</p>
    <MobilePlanTabs value={value} onChange={onChange}/>
    <div className="mt-4 space-y-2.5">
      {groups.map((group, i) => <details key={group.title[0]} open={i === 0 ? true : undefined}
        className="group rounded-xl border border-ink/15 bg-white/80">
        <summary className="cursor-pointer px-4 py-4 text-sm font-semibold leading-relaxed marker:text-ink/60">{t(group.title)}</summary>
        <dl className="border-t border-ink/10 px-4">
          {group.rows.map(row => <div key={row.name[0]} className="flex items-start justify-between gap-3 border-b border-ink/10 py-3.5 last:border-b-0">
            <dt className="min-w-0 flex-1 text-[13px] leading-relaxed text-ink/75">{t(row.name)}</dt>
            <dd className="max-w-[48%] break-words text-right text-[13px] font-semibold leading-relaxed text-ink">{t(row.cells[index])}</dd>
          </div>)}
        </dl>
      </details>)}
    </div>
  </div>
}

export function PricingTeaserV35() {
  const { lang } = useLang()
  const [mobilePlan, setMobilePlan] = useState<PlanId>('sales')
  const zh = lang === 'zh'
  const t = (v: Pair) => v[zh ? 0 : 1]
  return <section id="commercial-offers" aria-labelledby="teaser-v35-title" className="border-t border-ink/15 bg-ivory text-ink">
    <div className="mx-auto max-w-[1360px] px-5 py-16 md:px-10 lg:py-20">
      <p className="font-mono text-xs tracking-[.2em] text-ink/55">VEYFRONT / BUILD · REBUILD · GROW</p>
      <div className="mt-4 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
        <div className="max-w-[820px]">
          <h2 id="teaser-v35-title" className="text-balance text-3xl font-semibold tracking-tight sm:text-[42px]">{zh ? '不只建好网站，还要让外贸业务用得上。' : 'From a credible website to stronger sales and new buyer opportunities.'}</h2>
          <p className="mt-3 max-w-2xl leading-relaxed text-ink/70">{zh ? '三档标准方案，均含中英文网站、首年基础托管和上线后3个月专业服务。' : 'Three clear packages, each with a bilingual website, first-year hosting and three months of professional service.'}</p>
        </div>
        <Link href="/pricing" className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-md bg-ink px-5 font-semibold text-ivory hover:bg-ink/85">{zh ? '查看完整服务与价格' : 'Compare all plans'}<ArrowUpRight className="size-4"/></Link>
      </div>
      <div className="mt-8 md:hidden">
        <MobilePlanTabs value={mobilePlan} onChange={setMobilePlan}/>
        <MobilePlanOverview value={mobilePlan}/>
      </div>
      <div className="mt-8 hidden gap-4 md:grid md:grid-cols-3">
        {plans.map(plan => <article key={plan.id} className={'rounded-xl border p-6 ' + (plan.featured ? 'border-ink bg-mist/45' : 'border-ink/15 bg-white/65')}>
          <p className="text-sm font-semibold">{t(plan.title)}</p>
          <p className="mt-2 text-4xl font-semibold tabular-nums">¥{plan.price}</p>
          <p className="mt-4 text-base font-semibold">{t(plan.subtitle)}</p>
          <p className="mt-1 text-sm leading-relaxed text-ink/65">{t(plan.fit)}</p>
          <p className="mt-5 border-t border-ink/10 pt-4 text-sm text-ink/80">{t(plan.points[3])}</p>
        </article>)}
      </div>
      <p className="mt-5 text-xs leading-relaxed text-ink/60">{zh ? '以上为一次性标准项目参考价，正式交付范围、税费与总价以双方签约前的书面报价为准。' : 'Indicative one-off project prices; final quote, taxes and scope are confirmed before agreement. The written quote confirms scope and tax terms.'}</p>
    </div>
  </section>
}

export function PricingV35() {
  const { lang } = useLang()
  const [mobilePlan, setMobilePlan] = useState<PlanId>('sales')
  const zh = lang === 'zh'
  const t = (v: Pair) => v[zh ? 0 : 1]
  return <div className="bg-ivory text-ink">
    <section className="relative overflow-hidden bg-ink text-ivory" aria-labelledby="pricing-v35-title">
      <div className="pointer-events-none absolute -right-20 top-2 h-80 w-80 rotate-[24deg] rounded-full border border-lime/20 md:right-8" aria-hidden="true"/>
      <div className="pointer-events-none absolute right-8 top-16 h-52 w-52 rounded-full border border-lime/10" aria-hidden="true"/>
      <div className="relative mx-auto max-w-[1360px] px-5 pb-12 pt-12 md:px-10 md:pb-14 md:pt-16">
        <p className="font-mono text-xs uppercase tracking-[.2em] text-lime">{zh ? 'VEYFRONT · 服务与价格' : 'VEYFRONT / SERVICES & PRICING'}</p>
        <h1 id="pricing-v35-title" className="mt-5 max-w-[980px] text-balance text-[34px] font-semibold leading-tight tracking-tight md:text-[54px] lg:text-[62px]">{zh ? '让海外客户更容易了解您的产品和实力，主动联系您。' : 'Help global buyers understand, trust and contact your business.'}</h1>
        <p className="mt-5 max-w-3xl text-base leading-relaxed text-ivory/75 md:text-lg">{zh ? '从外贸官网建设和旧站升级，到英文推广资料及海外市场调研，选择适合企业当前需求的服务。' : 'Build a credible B2B website, give your export team stronger sales assets, and explore new markets and buyer opportunities. Choose the service that fits your stage.'}</p>
        <div className="mt-7 flex flex-wrap gap-x-7 gap-y-3 border-t border-ivory/20 pt-5 text-sm text-ivory/85">
          <span className="inline-flex items-center gap-2"><CheckCircle2 className="size-4 text-lime"/>{zh ? '中英文外贸官网' : 'Bilingual B2B website'}</span>
          <span className="inline-flex items-center gap-2"><CheckCircle2 className="size-4 text-lime"/>{zh ? '首年基础托管' : 'First-year hosting'}</span>
          <span className="inline-flex items-center gap-2"><CheckCircle2 className="size-4 text-lime"/>{zh ? '赠3个月专业服务' : '3 months of services included'}</span>
        </div>
      </div>
    </section>

    <section className="mx-auto max-w-[1360px] px-5 pb-16 pt-9 md:px-10 md:pt-12" aria-labelledby="plan-list-title">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h2 id="plan-list-title" className="text-2xl font-semibold md:text-3xl">{zh ? '选择适合企业当前需求的方案' : 'Choose your next business stage'}</h2>
        <p className="text-sm text-ink/60">{zh ? '标准项目 · 一次性参考价' : 'Standard project · one-off guide price'}</p>
      </div>
      <div className="mt-7 lg:hidden">
        <MobilePlanTabs value={mobilePlan} onChange={setMobilePlan}/>
        <MobilePlanOverview value={mobilePlan}/>
      </div>
      <div className="mt-7 hidden items-stretch gap-4 lg:grid lg:grid-cols-3">
        {plans.map(plan => <article key={plan.id} className={'relative flex flex-col rounded-xl border px-5 pb-6 pt-7 shadow-sm md:px-7 ' + (plan.featured ? 'border-ink bg-mist/45 ring-1 ring-ink' : 'border-ink/15 bg-white/85')}>
          {plan.featured && <span className="absolute -top-3 left-6 rounded-md bg-lime px-3 py-1 text-xs font-semibold text-ink">{zh ? '推荐 · 适合已有外贸团队' : 'Recommended for export teams'}</span>}
          <p className="font-mono text-xs uppercase tracking-widest text-ink/45">{zh ? (plan.id === 'start' ? '01 / 建站' : plan.id === 'sales' ? '02 / 销售支持' : '03 / 增长研究') : (plan.id === 'start' ? '01 / START' : plan.id === 'sales' ? '02 / EXPAND' : '03 / GROW')}</p>
          <h3 className="mt-4 text-2xl font-semibold">{t(plan.title)}</h3>
          <p className="mt-3 text-[42px] font-semibold leading-none tracking-tight tabular-nums md:text-[48px]"><span className="mr-1 text-2xl">¥</span>{plan.price}</p>
          <p className="mt-3 text-xs text-ink/55">{zh ? '标准项目一次性参考价' : 'One-off standard project guide price'}</p>
          <p className="mt-6 min-h-7 text-lg font-semibold leading-snug">{t(plan.subtitle)}</p>
          <p className="mt-2 min-h-10 text-sm leading-relaxed text-ink/65">{t(plan.fit)}</p>
          <div className="my-6 h-px bg-ink/15"/>
          <ul className="flex-1 space-y-4">
            {plan.points.map((point,i) => <li key={i} className="flex items-start gap-3 text-sm leading-relaxed"><Check className="mt-0.5 size-[18px] shrink-0 text-ink"/>{t(point)}</li>)}
          </ul>
          <Link href={'/contact?plan=' + plan.id} className={'mt-8 inline-flex min-h-12 items-center justify-center gap-2 rounded-md px-5 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink ' + (plan.featured ? 'bg-ink text-ivory hover:bg-ink/85' : 'border border-ink/25 bg-ivory text-ink hover:bg-mist')}>{zh ? '咨询' + t(plan.title) + '方案' : 'Ask about ' + t(plan.title)}<ArrowRight className="size-4"/></Link>
        </article>)}
      </div>
      <p className="mt-5 text-sm leading-relaxed text-ink/65">{zh ? '三个方案都支持新建外贸官网及常规旧站升级。超出标准范围的需求及第三方费用，签约前会另行说明。' : 'All three plans support new builds and standard rebuilds. Scope and external costs are agreed in writing before signing; Final deliverables, external costs and tax terms are confirmed in writing before signing.'}</p>
    </section>

    <section className="border-y border-ink/10 bg-mist/35" aria-labelledby="upgrade-value-title">
      <div className="mx-auto max-w-[1360px] px-5 py-14 md:px-10 lg:py-20">
        <p className="font-mono text-xs tracking-widest text-ink/55">{zh ? '各套餐差异' : 'WHY UPGRADE'}</p>
        <h2 id="upgrade-value-title" className="mt-3 max-w-3xl text-balance text-3xl font-semibold md:text-[40px]">{zh ? '不同套餐多出的服务，具体是什么？' : 'What does the next tier actually add?'}</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <article className="rounded-lg border border-ink/15 bg-ivory p-6 md:p-8">
            <div className="flex flex-wrap items-baseline justify-between gap-3"><p className="font-semibold">{zh ? '启航 → 拓展' : 'Start → Expansion'}</p><p className="text-2xl font-semibold tabular-nums">+¥3,000</p></div>
            <h3 className="mt-5 text-xl font-semibold">{zh ? '不只是展示企业，更帮助外贸团队开展销售。' : 'Go beyond a website—equip your sales team.'}</h3>
            <p className="mt-3 leading-relaxed text-ink/70">{zh ? '获得专业采购专题、重点产品英文销售推广包、现有渠道适配和重点网页优化，让业务员可以直接使用网站与内容。' : 'Add a buyer guide, English outreach assets, one existing-channel adaptation and a priority page improvement your team can use.'}</p>
          </article>
          <article className="rounded-lg border border-ink/15 bg-ivory p-6 md:p-8">
            <div className="flex flex-wrap items-baseline justify-between gap-3"><p className="font-semibold">{zh ? '拓展 → 领航' : 'Expansion → Growth'}</p><p className="text-2xl font-semibold tabular-nums">+¥3,000</p></div>
            <h3 className="mt-5 text-xl font-semibold">{zh ? '不只服务现有渠道，还研究下一批机会。' : 'Explore where the next opportunities may be.'}</h3>
            <p className="mt-3 leading-relaxed text-ink/70">{zh ? '在销售推广基础上，选择一项有来源、可审查的搜索增长或海外目标买家研究专项，获得真实研究成果与改进行动。' : 'Choose one evidence-backed search growth or target-buyer research project, with tangible findings and improvement actions.'}</p>
          </article>
        </div>
      </div>
    </section>

    <section className="mx-auto max-w-[1360px] px-5 py-16 md:px-10" aria-labelledby="comparison-title">
      <div className="max-w-3xl">
        <p className="font-mono text-xs tracking-widest text-ink/55">{zh ? '服务明细对比' : 'FULL COMPARISON'}</p>
        <h2 id="comparison-title" className="mt-3 text-3xl font-semibold md:text-[40px]">{zh ? '三档方案的服务内容和交付数量，逐项对比。' : 'Every benefit, clearly defined.'}</h2>
        <p className="mt-4 leading-relaxed text-ink/65">{zh ? '三档都包含外贸官网建设、首年基础托管和3个月约定服务。区别在于产品内容数量、销售支持和市场研究范围。' : 'Every tier gets a credible, working site. The difference is in content depth, sales support and growth research.'}</p>
      </div>
      <MobileServiceComparison value={mobilePlan} onChange={setMobilePlan}/>
      <div className="mt-7 hidden overflow-x-auto rounded-xl border border-ink/15 bg-white/75 md:block">
        <table className="w-full min-w-[760px] border-collapse text-left text-sm">
          <thead><tr className="border-b border-ink/15 bg-ink text-ivory"><th scope="col" className="w-[34%] px-5 py-5 font-semibold">{zh ? '具体服务权益' : 'Included services'}</th>{plans.map(p=><th key={p.id} scope="col" className="w-[22%] px-4 py-5 font-semibold">{t(p.title)}<span className="mt-1 block text-ivory/70">¥{p.price}</span></th>)}</tr></thead>
          <tbody>{groups.map(group=><Fragment key={group.title[0]}><tr key={group.title[0]} className="border-y border-ink/10 bg-mist/65"><th scope="rowgroup" colSpan={4} className="px-5 py-3 text-sm font-semibold">{t(group.title)}</th></tr>{group.rows.map(row=><tr key={group.title[0] + row.name[0]} className="border-t border-ink/10 align-top"><th scope="row" className="px-5 py-4 font-medium leading-relaxed">{t(row.name)}</th>{row.cells.map((cell,i)=><td key={i} className={'px-4 py-4 leading-relaxed ' + (i===1 ? 'bg-mist/20' : '')}>{t(cell)}</td>)}</tr>)}</Fragment>)}</tbody>
        </table>
      </div>
      <p className="mt-4 text-xs leading-relaxed text-ink/60">{zh ? '标准产品资料数量是客户提供、结构一致、可批量整理的记录上限，并非网站URL上限。专题是基于已核实材料的一份采购专业网页，不是工程设计服务。' : 'Product record caps apply to consistent, client-supplied structured entries, not total site URLs. A guide is a verified buyer-oriented page, not an engineering design project.'}</p>
    </section>

    <section className="bg-ink text-ivory" aria-labelledby="service-3m-title">
      <div className="mx-auto max-w-[1360px] px-5 py-16 md:px-10 lg:py-20">
        <p className="font-mono text-xs tracking-[.2em] text-lime">{zh ? '包含3个月专业服务' : '3 MONTHS OF INCLUDED SERVICES'}</p>
        <div className="mt-4 grid gap-6 lg:grid-cols-[1fr_0.76fr] lg:items-end">
          <h2 id="service-3m-title" className="max-w-3xl text-balance text-[32px] font-semibold leading-tight md:text-[46px]">{zh ? '网站上线后，再送您3个月真正用得上的专业服务。' : 'Three months of real services after your site goes live.'}</h2>
          <p className="text-base leading-relaxed text-ivory/75">{zh ? '三档均包含3个月约定服务。网站检查在服务期内安排；资料和授权齐全后，约定的推广资料制作、网页修改和调研可以提前开展。' : 'These are usable benefits—not a rigid month-by-month schedule. Once materials are ready, fixed deliverables can start immediately.'}</p>
        </div>
        <div className="mt-9 grid gap-4 lg:grid-cols-3">
          <article className="rounded-xl border border-ivory/20 bg-ivory/5 p-6">
            <ShieldCheck className="size-7 text-lime" aria-hidden="true"/>
            <h3 className="mt-5 text-xl font-semibold">{zh ? '启航 · 网站维护' : 'Start · Website care'}</h3>
            <p className="mt-2 text-sm leading-relaxed text-ivory/70">{zh ? '3次运行及询盘巡检、最多3处内容小修改、Google基础检查、使用指导及服务总结。' : '3 site and inquiry checks, up to 3 small edits, one Google basics check, use guidance and a completion report.'}</p>
          </article>
          <article className="rounded-xl border border-lime/60 bg-lime/10 p-6">
            <Globe2 className="size-7 text-lime" aria-hidden="true"/>
            <h3 className="mt-5 text-xl font-semibold">{zh ? '拓展 · 销售推广' : 'Expansion · Sales support'}</h3>
            <p className="mt-2 text-sm leading-relaxed text-ivory/80">{zh ? '包含维护权益，再提供1套英文销售内容、1条已有渠道适配、重点采购研究和1处网页优化。' : 'Website care plus one English sales pack, one existing-channel adaptation, buyer research and one priority-page improvement.'}</p>
          </article>
          <article className="rounded-xl border border-ivory/20 bg-ivory/5 p-6">
            <UsersRound className="size-7 text-lime" aria-hidden="true"/>
            <h3 className="mt-5 text-xl font-semibold">{zh ? '领航 · 增长研究' : 'Growth · Research project'}</h3>
            <p className="mt-2 text-sm leading-relaxed text-ivory/70">{zh ? '包含维护与销售支持，再选一个搜索或目标买家研究专项，完成2轮专项优化并交付成果。' : 'Website and sales support plus one search or target-buyer research track, with two scoped improvement cycles.'}</p>
          </article>
        </div>
        <div className="mt-7 rounded-lg border border-lime/30 px-5 py-4 text-sm leading-relaxed text-ivory/80"><strong className="text-ivory">{zh ? '3个月是服务有效期，不按月限制可交付内容。' : 'Three months means validity, not installments.'}</strong> {zh ? '持续巡检与问题受理覆盖服务期；定额内容、研究和优化可以按需求提前交付。所有完成项目都有可查看的成果或记录。' : 'Continuous support remains available during the term; scoped content and research can be delivered early. Completed work has inspectable evidence.'}</div>
      </div>
    </section>

    <section className="mx-auto max-w-[1360px] px-5 py-16 md:px-10" aria-labelledby="tracks-title">
      <p className="font-mono text-xs tracking-[.2em] text-ink/55">{zh ? '专项服务说明' : 'FOCUSED GROWTH PROJECT'}</p>
      <h2 id="tracks-title" className="mt-3 max-w-3xl text-balance text-3xl font-semibold md:text-[40px]">{zh ? '领航版：两条增长路径，选择真正需要的一条。' : 'Growth Navigator: choose the research track you need.'}</h2>
      <div className="mt-8 grid gap-5 md:grid-cols-2">
        <article className="rounded-xl border border-ink/15 bg-white/85 p-6 md:p-8">
          <Search className="size-8 text-ink" aria-hidden="true"/>
          <h3 className="mt-4 text-2xl font-semibold">{zh ? 'A · Google与AI搜索内容优化' : 'A · Search growth research'}</h3>
          <p className="mt-3 leading-relaxed text-ink/70">{zh ? '研究8–12个与重点产品相关的采购问题，形成内容机会与优化清单，完成两轮约定范围的页面改进。' : 'Study 8–12 buyer-search questions, identify content opportunities and complete two scoped rounds of page improvement.'}</p>
          <p className="mt-5 border-t border-ink/10 pt-4 text-sm font-medium">{zh ? '交付：搜索研究清单 + 优化前后记录 + 下一步建议' : 'Deliverables: research list, before/after changes and next actions'}</p>
        </article>
        <article className="rounded-xl border border-ink/15 bg-white/85 p-6 md:p-8">
          <UsersRound className="size-8 text-ink" aria-hidden="true"/>
          <h3 className="mt-4 text-2xl font-semibold">{zh ? 'B · 海外潜在客户调研' : 'B · Overseas target-buyer research'}</h3>
          <p className="mt-3 leading-relaxed text-ink/70">{zh ? '围绕一个重点市场，研究最多20家有公开来源的候选企业，对其中最多5家进一步核查匹配度，完成两轮专项内容或目标匹配优化。' : 'For one target market, research up to 20 source-backed candidate companies, further assess up to five, and complete two scoped refinement cycles.'}</p>
          <p className="mt-5 border-t border-ink/10 pt-4 text-sm font-medium">{zh ? '交付：市场研究 + 企业来源与匹配说明 + 开发优先级建议' : 'Deliverables: market review, company evidence and outreach priorities'}</p>
        </article>
      </div>
      <p className="mt-5 text-sm leading-relaxed text-ink/65">{zh ? '候选企业不等于确认采购需求，不承诺获得联系人、回复、排名、询盘或订单。研究使用合法可用的资料，并保留核查状态。' : 'Candidate companies are not confirmed buying opportunities. We do not promise contacts, responses, rankings, inquiries or orders. Research uses authorized sources with uncertainty recorded.'}</p>
    </section>

    <section className="border-y border-ink/10 bg-mist/35" aria-labelledby="proof-title">
      <div className="mx-auto max-w-[1360px] px-5 py-16 md:px-10">
        <p className="font-mono text-xs tracking-[.2em] text-ink/55">{zh ? '具体交付成果' : 'WHAT YOU RECEIVE'}</p>
        <h2 id="proof-title" className="mt-3 max-w-3xl text-balance text-3xl font-semibold md:text-[40px]">{zh ? '网站、推广资料和调研结果，交付时都能核对。' : 'Not vague promises—work you can inspect.'}</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {[{num:'01',title:['专业网站与询盘','Website and inquiries'],body:['网站、产品页面、已核实的供应商能力、实际表单测试及交付验收记录。','Live site, products, verified supplier information, tested inquiry and acceptance record.']},
          {num:'02',title:['销售推广内容','Sales outreach assets'],body:['重点产品介绍、英文开发与跟进素材、推广链接，以及已修改页面的前后对照。','Product introduction, English outreach assets, links and documented page improvements.']},
          {num:'03',title:['增长研究成果','Growth research evidence'],body:['采购问题或候选企业研究清单、公开来源、核查状态及优先行动建议。','Buyer questions or candidate research, public sources, review status and prioritized next steps.']}].map(item=>
            <article key={item.num} className="rounded-lg border border-ink/15 bg-ivory p-6">
              <p className="font-mono text-sm text-ink/45">{item.num} / EVIDENCE</p>
              <h3 className="mt-5 text-xl font-semibold">{t(item.title as unknown as Pair)}</h3>
              <p className="mt-3 text-sm leading-relaxed text-ink/65">{t(item.body as unknown as Pair)}</p>
            </article>)}
        </div>
        <p className="mt-5 text-xs leading-relaxed text-ink/55">{zh ? '具体交付内容以所选套餐权益与双方确认的项目范围为准，完成后提供可核对的交付记录。' : 'Deliverables follow the selected plan and agreed scope, with inspectable completion records.'}</p>
      </div>
    </section>

    <section className="mx-auto max-w-[1360px] px-5 py-16 md:px-10" aria-labelledby="scope-title">
      <p className="font-mono text-xs tracking-[.2em] text-ink/55">{zh ? '费用与服务约定' : 'TRANSPARENT TERMS'}</p>
      <h2 id="scope-title" className="mt-3 text-3xl font-semibold md:text-[40px]">{zh ? '费用与交付事先说清楚，网站资产由客户掌控。' : 'Clear fees, clear scope, your site stays yours.'}</h2>
      <div className="mt-8 grid gap-4 lg:grid-cols-3">
        <div className="rounded-lg border border-ink/15 p-6"><h3 className="text-lg font-semibold">{zh ? '首年托管与运行保障' : 'First-year hosting'}</h3><p className="mt-3 text-sm leading-relaxed text-ink/70">{zh ? '三档均含首年基础商业托管、HTTPS和约定的网站运行保障。资源上限、域名注册及第二年续费在签约前确认。' : 'All plans include first-year basic commercial hosting, HTTPS and agreed technical support. Limits, domains and renewal terms are disclosed before signing.'}</p></div>
        <div className="rounded-lg border border-ink/15 p-6"><h3 className="text-lg font-semibold">{zh ? '客户资产与迁移权利' : 'Ownership and portability'}</h3><p className="mt-3 text-sm leading-relaxed text-ink/70">{zh ? '域名由客户控制，交付约定源码和资产。客户可以选择符合条件的其他托管方，无须强制购买持续运营服务。' : 'You control your domain and receive agreed source and assets. Compatible hosting can be changed; continued marketing is optional.'}</p></div>
        <div className="rounded-lg border border-ink/15 p-6"><h3 className="text-lg font-semibold">{zh ? '复杂项目提前确认' : 'Complex work is scoped upfront'}</h3><p className="mt-3 text-sm leading-relaxed text-ink/70">{zh ? '复杂CMS迁移、大型数据整理、特殊技术翻译、广告费用和定制软件均须另行书面确认。无未经同意的中途增项。' : 'Complex migrations, large data work, special translation, advertising costs and bespoke systems are separately agreed in writing.'}</p></div>
      </div>
      <div className="mt-6 flex flex-wrap items-center justify-between gap-5 rounded-lg border border-ink/15 bg-mist/35 p-6">
        <div className="max-w-3xl"><h3 className="text-xl font-semibold">{zh ? '后续网站维护服务（可选）' : 'Frontier Run · Optional ongoing service'}</h3><p className="mt-2 text-sm leading-relaxed text-ink/70">{zh ? '3个月服务结束后，可按需继续委托网站维护、询盘检查和内容优化。网站托管续费与后续运营服务分别报价。' : 'After the included services, optional ongoing content care, inquiry checks and business reviews are available. Hosting renewal and growth services are priced separately.'}</p></div>
        <div><p className="text-sm font-semibold text-ink/80">{zh ? '后续服务根据实际需求另行报价' : 'Ongoing service is quoted separately'}</p><Link href="/contact" className="mt-3 inline-flex items-center gap-2 text-sm font-semibold underline underline-offset-4">{zh ? '了解持续服务' : 'Ask about ongoing care'}<ArrowUpRight className="size-4"/></Link></div>
      </div>
    </section>

    <section className="mx-auto max-w-[1360px] px-5 py-16 md:px-10" aria-labelledby="faq-v35-title">
      <h2 id="faq-v35-title" className="text-3xl font-semibold">{zh ? '常见问题' : 'Frequently asked questions'}</h2>
      <div className="mt-7 grid gap-3 md:grid-cols-2">
        {faqs.map((item,i)=><details key={i} className="group h-fit rounded-lg border border-ink/15 bg-white/75 p-5 open:bg-mist/25"><summary className="cursor-pointer font-semibold leading-relaxed marker:text-ink/40">{t(item.q)}</summary><p className="mt-4 text-sm leading-relaxed text-ink/70">{t(item.a)}</p></details>)}
      </div>
    </section>

    <section className="bg-ink text-ivory" aria-labelledby="last-cta-v35">
      <div className="mx-auto flex max-w-[1360px] flex-col justify-between gap-8 px-5 py-16 md:px-10 lg:flex-row lg:items-end lg:py-20">
        <div className="max-w-3xl">
          <p className="font-mono text-xs tracking-[.2em] text-lime">{zh ? '下一步 · 咨询网站方案' : 'LET'S BUILD YOUR FRONTIER'}</p>
          <h2 id="last-cta-v35" className="mt-4 text-balance text-3xl font-semibold leading-tight md:text-[44px]">{zh ? '告诉我们您想建什么网站，一起确定方案和报价。' : 'Tell us your goal. We will confirm the right scope.'}</h2>
          <p className="mt-4 leading-relaxed text-ivory/75">{zh ? '新建官网或升级旧站，均从项目咨询和范围确认开始。不会未经同意修改现有网站，也不会自动收费。' : 'New build or rebuild: start with a project inquiry and written scope. No changes or payment happen without your approval.'}</p>
        </div>
        <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
          <Link href="/start/launch" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-lime px-5 font-semibold text-ink hover:bg-lime/90">{zh ? '我要新建官网' : 'Build a website'}<ArrowUpRight className="size-4"/></Link>
          <Link href="/start/rebuild" className="inline-flex min-h-12 items-center justify-center rounded-md border border-ivory/40 px-5 font-semibold text-ivory hover:bg-ivory/10">{zh ? '我要升级旧站' : 'Rebuild my website'}</Link>
        </div>
      </div>
    </section>
  </div>
}
