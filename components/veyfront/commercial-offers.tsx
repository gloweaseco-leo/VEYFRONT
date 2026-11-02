'use client'

import Link from 'next/link'
import { Check, ArrowUpRight } from 'lucide-react'
import { useLang } from '@/lib/i18n'
import offers from '@/lib/commercial-offers.json'

export function CommercialOffers({ detail = false }: { detail?: boolean }) {
  const { lang } = useLang()
  const zh = lang === 'zh'
  const addOnNames: Record<string, [string, string]> = {
    page: ['增设一个独立设计页面', 'Additional independently designed page'],
    records10: ['增加10条同模板产品记录', 'Ten extra templated product records'],
    language: ['增加一种完整语言版本（起）', 'Additional language version (from)'],
    revision: ['增加一轮集中修改', 'One extra consolidated revision round'],
    continuity: ['旧站迁移与流量连续性增强（起）', 'Extended migration and continuity support (from)'],
  }
  const exclusions = zh
    ? ['不保证搜索排名、流量、询盘或销售额', '不含广告投放、持续SEO内容代运营、专业摄影及独立Logo设计', '不含在线支付、会员、完整订单管理或定制CRM/ERP', '不含复杂智能交互、自动报价及定制业务应用', '域名、云资源、软件订阅及模型API费用单独确认']
    : ['No guaranteed search ranking, traffic, inquiries or sales', 'No advertising, ongoing SEO production, specialist photography or standalone brand identity', 'No checkout, memberships, full order management or custom CRM/ERP', 'No custom AI workflows, autonomous quotes or enterprise applications', 'Domains, infrastructure, subscriptions and model/API fees are separate']
  const format = (n: number) => '¥' + n.toLocaleString('en-US')
  return (
    <section id="commercial-offers" aria-labelledby="commercial-offers-title" className="scroll-mt-8 border-t border-ink/15 bg-mist/30 text-ink">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-8 px-5 py-16 md:px-10 lg:py-20">
        <div className="flex max-w-4xl flex-col gap-3">
          <p className="font-mono text-xs uppercase tracking-wider text-ink/60">VEYFRONT / BUILD & RUN</p>
          <h2 id="commercial-offers-title" className="text-balance text-3xl font-semibold leading-tight sm:text-4xl">
            {zh ? '新建，还是升级？从业务目标选择。' : 'Launch new, or improve what you have.'}
          </h2>
          <p className="leading-relaxed text-ink/75">
            {zh ? '两种建设路径，同一标准起价。旧站有价值的内容和历史页面值得保留时，选择升级；复杂迁移按实际范围另行报价。' : 'Two ways to improve your global presence, with the same standard starting price. Preserve useful existing assets when you rebuild; complex migration is quoted separately.'}
          </p>
        </div>
        <div className="grid gap-5 lg:grid-cols-2">
          {offers.build.map(item => (
            <article key={item.id} className="flex min-w-0 flex-col gap-5 rounded-xl border border-ink/15 bg-ivory p-6">
              <div className="flex flex-col gap-2">
                <p className="font-mono text-xs uppercase tracking-widest text-ink/60">{item.id === 'launch' ? '01 / Launch' : '02 / Rebuild'}</p>
                <h3 className="text-2xl font-semibold">{item.name}</h3>
                <p className="text-sm leading-relaxed text-ink/75">
                  {zh ? (item.id === 'launch' ? '适合首次建立海外网站或进入新市场：从零规划品牌、产品展示与询盘入口。' : '适合已有客户和历史页面的企业：保留可用资产，改善产品查找、内容信任与询盘体验。') : (item.id === 'launch' ? 'For a new market or first international website: plan messaging, product pages and inquiry paths from the start.' : 'For established sites with content and links worth keeping: improve discovery, credibility and inquiries without needless disruption.')}
                </p>
                <p className="mt-2 text-3xl font-semibold tabular-nums">{format(item.price)}<span className="ml-2 text-xs font-normal text-ink/55">{zh ? '起 · 参考价' : 'starting guide · CNY'}</span></p>
              </div>
              <ul className="flex flex-1 flex-col gap-3 border-t border-ink/15 pt-5">
                {(zh ? [
                  item.id === 'rebuild' ? '旧站内容、页面结构及询盘路径梳理' : '目标市场、品牌表达和网站信息架构规划',
                  '最多 ' + item.pages + ' 个独立业务页面或模板',
                  '最多 ' + item.records + ' 条产品资料、' + item.cases + ' 个经确认案例',
                  item.languages + ' 种语言、' + item.revisions + ' 轮集中修改',
                  item.id === 'rebuild' ? '升级产品查找与询盘，最多 ' + item.redirects + ' 条重要旧网址映射（原站可配置时）' : '从零设计客户信任路径、产品分类与基础 SEO 配置',
                  '真实询盘路径验证、一次上线协助与源码移交',
                  item.warrantyDays + ' 天约定范围内交付缺陷保障'
                ] : [
                  item.id === 'rebuild' ? 'Review existing pages, content and inquiry journeys' : 'Plan buyer markets, positioning and new site structure',
                  'Up to ' + item.pages + ' distinct pages or templates',
                  'Up to ' + item.records + ' product records and ' + item.cases + ' verified case studies',
                  item.languages + ' language, ' + item.revisions + ' consolidated revision rounds',
                  item.id === 'rebuild' ? 'Improve product navigation and map up to ' + item.redirects + ' legacy URLs (where supported)' : 'Create buyer trust journey, product categories and baseline technical SEO',
                  'Working inquiry route, one launch-assist and source handover',
                  item.warrantyDays + '-day in-scope delivery defect coverage'
                ]).map(text => <li key={text} className="flex items-start gap-2 text-sm leading-relaxed text-ink/80"><Check className="mt-0.5 size-4 shrink-0"/><span>{text}</span></li>)}
              </ul>
              <Link href={item.url} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-ink px-5 font-semibold text-ivory">
                {zh ? '提交项目需求' : 'Request written proposal'} <ArrowUpRight className="size-4"/>
              </Link>
            </article>
          ))}
        </div>
        <div className="grid gap-6 rounded-xl border border-ink/20 bg-ivory p-6 md:grid-cols-2">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">{zh ? '为什么选择 Rebuild？' : 'Why choose Rebuild?'}</h3>
            <p className="text-sm leading-relaxed text-ink/75">{zh ? '旧站可能已经积累了重要产品页面、客户熟悉的网址和外部链接。升级的意义，是在改善商业体验的同时尽可能保留这些资产，而不是简单推倒重来。没有值得保留的内容，就不必强行选择 Rebuild。' : 'An established site may have valuable product pages, familiar URLs and inbound links. Rebuild aims to improve the experience while preserving those assets where practical. If there is little worth retaining, a fresh Launch may be the better fit.'}</p>
          </div>
          <div className="space-y-2 border-t border-ink/15 pt-4 md:border-l md:border-t-0 md:pl-6 md:pt-0">
            <h3 className="text-lg font-semibold">{zh ? '复杂迁移单独报价' : 'Extended migration is optional'}</h3>
            <p className="text-sm leading-relaxed text-ink/75">{zh ? '需要更多旧 URL 对应关系、关键内容迁移、统计追踪衔接与上线切换方案时，一次性参考 ¥6,800 起；先评估风险再确认范围，不保证搜索排名保持不变。' : 'For additional URL mapping, content migration, analytics continuity and cutover planning, one-time guide pricing starts from ¥6,800. We confirm scope after review; search rankings cannot be guaranteed.'}</p>
          </div>
        </div>
        <div className="flex flex-col gap-4 rounded-xl border border-ink/15 bg-ivory p-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 className="text-xl font-semibold">Frontier Run · {format(offers.run.priceYear)}{zh ? ' / 年' : ' / year'}</h3>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-ink/75">
              {zh ? '可选网站运行服务：可用性监测、月度检查、技术维护及每月最多1小时小范围内容更新。域名、托管与第三方费用另计，托管不强制。' : 'Optional site care: monitoring, monthly checks, maintenance and up to one hour of small content edits per month. Hosting and third-party costs are separate and optional.'}
            </p>
          </div>
          <Link href="/contact" className="inline-flex min-h-12 shrink-0 items-center justify-center rounded-md border border-ink/25 px-5 font-semibold">
            {zh ? '咨询运行服务' : 'Ask about Run'}
          </Link>
        </div>
        <p className="max-w-4xl text-xs leading-relaxed text-ink/65">
          {zh ? '以上为标准服务参考起价。具体交付内容、税费与增项由双方书面确认；不保证搜索排名、询盘数量或成交额。' : 'Starting prices are indicative. Scope, taxes and extras are confirmed in a written quote. No guaranteed search rankings, inquiry volume or sales.'}
        </p>
        {detail ? (
          <div className="grid gap-8 border-t border-ink/15 pt-8 lg:grid-cols-2">
            <div>
              <h3 className="text-xl font-semibold">{zh ? '标准增项参考' : 'Reference add-ons'}</h3>
              <ul className="mt-4 divide-y divide-ink/15 border-y border-ink/15">
                {offers.addons.map(item => <li key={item.id} className="flex justify-between gap-4 py-3 text-sm"><span>{addOnNames[item.id][zh ? 0 : 1]}</span><span className="shrink-0 font-mono">{format(item.price)}{item.id === 'continuity' ? ' +' : ''}</span></li>)}
              </ul>
              <p className="mt-3 text-xs text-ink/60">{zh ? '增项在执行前书面确认；复杂迁移、语言校审和系统集成按实际范围另行核价。' : 'Add-ons require written approval; complex migration, language review and integrations are scoped separately.'}</p>
            </div>
            <div>
              <h3 className="text-xl font-semibold">{zh ? '标准范围不包含' : 'Not in standard scope'}</h3>
              <ul className="mt-4 divide-y divide-ink/15 border-y border-ink/15">
                {exclusions.map(text => <li key={text} className="py-3 text-sm leading-relaxed text-ink/75">{text}</li>)}
              </ul>
            </div>
            <div className="lg:col-span-2">
              <h3 className="text-xl font-semibold">{zh ? '成交与验收' : 'Acceptance and payment'}</h3>
              <p className="mt-3 max-w-4xl text-sm leading-relaxed text-ink/75">
                {zh ? '签约及启动50%、预览阶段验收40%、最终上线与源码移交10%。客户确认公司、产品及案例事实；交付方验证桌面/移动端、导航、真实询盘路径、安全与依赖清单。具体条款以合同为准。' : 'Suggested 50% kickoff, 40% accepted preview and 10% production acceptance/source handover. Customer verifies business facts; delivery tests responsive pages, navigation, real inquiry, security and dependency handover. Signed agreement prevails.'}
              </p>
            </div>
          </div>
        ) : <Link className="w-fit font-semibold underline underline-offset-4" href="/pricing">{zh ? '查看完整价格与交付边界' : 'See scope, add-ons and exclusions'}</Link>}
      </div>
    </section>
  )
}
