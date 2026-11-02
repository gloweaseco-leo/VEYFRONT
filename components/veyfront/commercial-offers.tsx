'use client'

import Link from 'next/link'
import { ArrowUpRight, Check } from 'lucide-react'
import { useLang } from '@/lib/i18n'
import offers from '@/lib/commercial-offers.json'

const currency = (value: number) => '¥' + value.toLocaleString('en-US')

const additions: Record<string,[string,string]> = {
  continuity: ['Rebuild 旧站资产迁移增强', 'Rebuild asset continuity upgrade'],
  buyerContent: ['B2B 采购决策内容增强', 'B2B buyer content enhancement'],
  page: ['增加一个独立页面或设计模板', 'Additional designed page or template'],
  records10: ['新增10条同模板产品记录', '10 additional templated product records'],
  revision: ['增加一轮集中修改', 'Additional consolidated review round'],
  language: ['新增一种语言版本（起）', 'Additional language version (from)'],
}
const core: [string,string][] = [
  ['最多6类业务页面或设计模板，15条同模板产品记录', 'Up to 6 designed business pages/templates and 15 templated product records'],
  ['中英文双语，1个重点应用场景，最多1个经核实的案例或证据模块', 'English + Chinese, one key application page and one verified case/evidence module'],
  ['SEO-Native：搜索意图结构、独立元数据、内部链接、规范网址与站点地图', 'SEO-Native: intent-led content, page metadata, internal links, canonical URLs and sitemap'],
  ['适用的结构化数据和多语言 hreflang；客户授权后配置搜索工具', 'Applicable structured data and hreflang; search tools configured with client authorization'],
  ['可追踪的真实询盘表单及接收验证，邮件/WhatsApp 辅助联系', 'Real inquiry receipt with test evidence; email/WhatsApp as additional contact paths'],
  ['基础访问/询盘事件追踪、手机适配、两轮修改、一次上线协助', 'Basic traffic/inquiry events, mobile QA, two revision rounds and one launch assist'],
  ['源码与部署资料移交；30天约定范围内的缺陷保障', 'Source and deployment handover; 30-day in-scope defect coverage'],
]
const exclusions: [string,string][] = [
  ['不含广告投放、持续 SEO 代运营、保证排名或保证询盘数量', 'No paid ads, ongoing SEO campaigns, guaranteed ranking or lead volume'],
  ['不含原创3D建模、专业摄影、复杂技术翻译及无限资料整理', 'No custom 3D modeling, photography, specialist translation or unlimited data cleanup'],
  ['不含在线支付、会员体系、完整 CRM/ERP 或复杂 AI Agent', 'No checkout, membership, full CRM/ERP or complex custom AI agents'],
  ['域名、托管、软件订阅及第三方模型费用按客户项目书面确认', 'Domain, hosting, subscriptions and third-party model fees are agreed separately'],
]

export function CommercialOffers({detail=false}:{detail?:boolean}) {
  const {lang} = useLang()
  const zh = lang === 'zh'
  const t = (value:[string,string]) => value[zh ? 0 : 1]
  return (
    <section id="commercial-offers" aria-labelledby="commercial-offers-title" className="scroll-mt-8 border-t border-ink/15 bg-mist/30 text-ink">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-9 px-5 py-16 md:px-10 lg:py-20">
        <div className="max-w-4xl space-y-3">
          <p className="font-mono text-xs uppercase tracking-widest text-ink/60">VEYFRONT / BUILD · REBUILD · RUN</p>
          <h2 id="commercial-offers-title" className="text-balance text-3xl font-semibold leading-tight sm:text-4xl">
            {zh ? '不仅把网站建好，更让海外买家找得到、看得懂、联系得上。' : 'A website built to be found, understood and contacted.'}
          </h2>
          <p className="text-base leading-relaxed text-ink/75">
            {zh ? '专业视觉、双语、原生 SEO、产品展示、真实询盘和基础数据追踪，统一纳入标准建设范围。新建与简单重建同一起价。' : 'Professional design, two languages, SEO-Native structure, product content, verified inquiry delivery and foundational analytics in one standard build. Launch and simple Rebuild share the same starting price.'}
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          {offers.build.map((item) => (
            <article key={item.id} className="flex min-w-0 flex-col gap-5 rounded-xl border border-ink/15 bg-ivory p-6">
              <div className="space-y-2">
                <p className="font-mono text-xs uppercase tracking-widest text-ink/55">{item.id === 'launch' ? '01 / LAUNCH' : '02 / REBUILD'}</p>
                <h3 className="text-2xl font-semibold">{item.name}</h3>
                <p className="min-h-11 text-sm leading-relaxed text-ink/75">
                  {item.id === 'launch'
                    ? (zh ? '从零创建面向海外买家的商业网站，建立品牌、产品与询盘入口。' : 'Build a new international B2B website around your company, products and buyers.')
                    : (zh ? '旧站内容不复杂时重新组织页面、视觉与询盘路径；不自动包含复杂资产迁移。' : 'Refresh an existing site’s messaging, design and inquiry journey without complex legacy migration.')}
                </p>
                <p className="pt-1 text-3xl font-semibold tabular-nums">{currency(item.price)}
                  <span className="ml-2 text-xs font-normal text-ink/60">{zh ? '起 · 标准参考价' : 'starting reference · CNY'}</span>
                </p>
              </div>
              <ul className="flex flex-1 flex-col gap-3 border-t border-ink/15 pt-5">
                {core.map((pair) => <li key={pair[0]} className="flex items-start gap-2 text-sm leading-relaxed text-ink/80"><Check aria-hidden="true" className="mt-0.5 size-4 shrink-0"/><span>{t(pair)}</span></li>)}
                <li className="flex items-start gap-2 text-sm leading-relaxed text-ink/80">
                  <Check aria-hidden="true" className="mt-0.5 size-4 shrink-0"/>
                  <span>{item.id==='rebuild'
                    ? (zh ? '包含1个已授权旧站的资料与客户路径评估；历史 URL 重定向另选迁移增强' : 'Includes review of one authorized existing site; URL redirects are part of the optional migration upgrade')
                    : (zh ? '包含1个目标市场与重点产品方向的商业结构梳理' : 'Includes buyer-task planning for one target market and product focus')}</span>
                </li>
              </ul>
              <Link href={item.url} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-ink px-5 font-semibold text-ivory">
                {zh ? '提交网站项目需求' : 'Request a project proposal'} <ArrowUpRight aria-hidden="true" className="size-4"/>
              </Link>
            </article>
          ))}
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <article className="flex flex-col gap-3 rounded-xl border border-ink/15 bg-ivory p-6">
            <p className="font-mono text-xs uppercase tracking-wider text-ink/60">REBUILD / ASSET CONTINUITY</p>
            <h3 className="text-xl font-semibold">{zh ? '旧站资产迁移增强' : 'Preserve valuable existing site assets'}</h3>
            <p className="text-2xl font-semibold tabular-nums">{currency(offers.migration.combinedPrice)}<span className="ml-2 text-xs font-normal text-ink/60">{zh ? '起 · 含标准 Rebuild' : 'starting · including base Rebuild'}</span></p>
            <p className="text-sm leading-relaxed text-ink/75">
              {zh ? '在标准重建之上增加旧站资产盘点、最多10条重要旧网址映射、适用的永久重定向、上线切换及迁移后核查。限一个有授权且可控制路由的现有网站；复杂 CMS/大规模搬迁另报价。' : 'Adds an authorized asset review, up to 10 priority legacy URL mappings, applicable permanent redirects, cutover checks and post-migration review. One authorized site with editable routing only; complex CMS migrations are separately scoped.'}
            </p>
            <p className="text-xs text-ink/65">{zh ? '不承诺迁移后搜索排名不变；旧站没有值得保留的资产时，不必购买本项。' : 'Search rankings cannot be guaranteed. If there is nothing valuable to preserve, this upgrade is unnecessary.'}</p>
            <Link href="/start/rebuild" className="mt-auto text-sm font-semibold underline underline-offset-4">{zh ? '咨询旧站升级' : 'Discuss a site migration'}</Link>
          </article>
          <article className="flex flex-col gap-3 rounded-xl border border-ink/15 bg-ivory p-6">
            <p className="font-mono text-xs uppercase tracking-wider text-ink/60">BUYER CONTENT / OPTIONAL</p>
            <h3 className="text-xl font-semibold">{zh ? 'B2B 采购决策内容增强' : 'B2B buyer content enhancement'}</h3>
            <p className="text-2xl font-semibold tabular-nums">+{currency(offers.contentEnhancement.startingPrice)}<span className="ml-2 text-xs font-normal text-ink/60">{zh ? '起 · 一次性' : 'from · one-time'}</span></p>
            <p className="text-sm leading-relaxed text-ink/75">
              {zh ? '围绕一个重点产品系列：采购搜索意图梳理、额外2个应用/比较页面、1份选型指南或采购 FAQ，以及更明确的产品相关询盘字段。客户确认技术事实；非全年 SEO 代运营。' : 'For one product series: buyer-search intent, 2 additional application/comparison pages, one selection guide or procurement FAQ, and more relevant inquiry fields. Client-approved technical facts; not an ongoing SEO campaign.'}
            </p>
            <Link href="/contact" className="mt-auto text-sm font-semibold underline underline-offset-4">{zh ? '了解内容增强' : 'Discuss content work'}</Link>
          </article>
        </div>

        <div className="flex flex-col gap-4 rounded-xl border border-ink/15 bg-ivory p-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 className="text-xl font-semibold">Frontier Run · {currency(offers.run.priceYear)}{zh ? '/年' : '/year'}</h3>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-ink/75">
              {zh ? '可选持续服务：运行监测、月度健康检查、询盘链路检查、技术维护、每月最多1小时小幅内容调整，以及季度搜索与询盘数据回顾。托管非强制，外部费用另计。' : 'Optional care: uptime monitoring, monthly site and inquiry checks, technical upkeep, up to one hour of small content edits monthly, and quarterly search/inquiry reviews. Hosting is optional; external fees are separate.'}
            </p>
          </div>
          <Link href="/contact" className="inline-flex min-h-12 shrink-0 items-center justify-center rounded-md border border-ink/25 px-5 font-semibold">{zh ? '咨询网站持续运营' : 'Ask about ongoing care'}</Link>
        </div>
        <p className="max-w-4xl text-xs leading-relaxed text-ink/65">
          {zh ? '以上为有明确范围的服务参考价。最终内容、税费、交付时间与第三方费用以书面报价和合同为准。SEO-Native 指搜索技术与内容基础，不保证搜索收录、排名、流量或询盘数量。' : 'Starting prices are indicative and subject to written scope, tax and vendor terms. SEO-Native is a technical/content foundation, not a guarantee of indexing, rankings, traffic or inquiry volume. No guaranteed search rankings, inquiry volume or sales.'}
        </p>
        {detail ? <div className="grid gap-8 border-t border-ink/15 pt-8 lg:grid-cols-2">
          <div>
            <h3 className="text-xl font-semibold">{zh ? '其他标准增项' : 'Other scoped add-ons'}</h3>
            <ul className="mt-4 divide-y divide-ink/15 border-y border-ink/15">
              {offers.addons.filter(a=>!['continuity','buyerContent'].includes(a.id)).map(a=><li key={a.id} className="flex justify-between gap-3 py-3 text-sm"><span>{t(additions[a.id])}</span><span className="shrink-0 font-mono">{currency(a.price)}{a.id === 'language' ? '+' : ''}</span></li>)}
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-semibold">{zh ? '标准范围不包含' : 'Not included by default'}</h3>
            <ul className="mt-4 divide-y divide-ink/15 border-y border-ink/15">
              {exclusions.map(pair=><li key={pair[0]} className="py-3 text-sm leading-relaxed text-ink/75">{t(pair)}</li>)}
            </ul>
          </div>
          <div className="lg:col-span-2">
            <h3 className="text-xl font-semibold">{zh ? '交付与验收' : 'Delivery and acceptance'}</h3>
            <p className="mt-3 max-w-4xl text-sm leading-relaxed text-ink/75">
              {zh ? '客户确认资料事实和发布授权；交付时对照页面清单、双语、手机布局、SEO 基础、真实询盘保存与通知、数据事件、源码及上线资料逐项验收。付款节点及售后以签署合同约定。' : 'Customer-confirmed business facts and permissions come first. Acceptance checks pages, two languages, mobile layouts, SEO baseline, real inquiry storage/notification, analytics events and source handover. Payment milestones and support terms are confirmed in the signed agreement.'}
            </p>
          </div>
        </div> : <Link href="/pricing" className="w-fit text-sm font-semibold underline underline-offset-4">{zh ? '查看完整服务范围与增项' : 'See full scope and add-ons'}</Link>}
      </div>
    </section>
  )
}
