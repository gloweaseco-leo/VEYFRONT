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
  }
  const exclusions = zh
    ? ['不保证搜索排名、流量、询盘或销售额', '不含广告投放、持续SEO内容代运营、专业摄影及独立Logo设计', '不含在线支付、会员、完整订单管理或定制CRM/ERP', '不含AI自动报价、未经授权的商业承诺与复杂Agent功能', '域名、云资源、软件订阅及模型API费用单独确认']
    : ['No guaranteed search ranking, traffic, inquiries or sales', 'No advertising, ongoing SEO production, specialist photography or standalone brand identity', 'No checkout, memberships, full order management or custom CRM/ERP', 'No autonomous AI quotes, unapproved promises or complex agent functionality', 'Domains, infrastructure, subscriptions and model/API fees are separate']
  const format = (n: number) => '¥' + n.toLocaleString('en-US')
  return (
    <section id="commercial-offers" aria-labelledby="commercial-offers-title" className="scroll-mt-8 border-t border-ink/15 bg-mist/30 text-ink">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-8 px-5 py-16 md:px-10 lg:py-20">
        <div className="flex max-w-4xl flex-col gap-3">
          <p className="font-mono text-xs uppercase tracking-wider text-ink/60">VEYFRONT / BUILD & RUN</p>
          <h2 id="commercial-offers-title" className="text-balance text-3xl font-semibold leading-tight sm:text-4xl">
            {zh ? '明确交付内容，再确认书面报价。' : 'Clear delivery scope. Written quotation before commitment.'}
          </h2>
          <p className="leading-relaxed text-ink/75">
            {zh ? 'W1 标准服务与参考价格，待经营主体、税务、交付成本最终签发。真实项目可以提交咨询，以下并非已生效报价或在线下单。' : 'W1 reference packages pending business, tax and delivery-cost approval. Inquiries are real, but amounts below are neither binding offers nor online checkout.'}
          </p>
        </div>
        <div className="grid gap-5 lg:grid-cols-2">
          {offers.build.map(item => (
            <article key={item.id} className="flex min-w-0 flex-col gap-5 rounded-xl border border-ink/15 bg-ivory p-6">
              <div className="flex flex-col gap-2">
                <p className="font-mono text-xs uppercase tracking-widest text-ink/60">{item.id === 'launch' ? '01 / Launch' : '02 / Rebuild'}</p>
                <h3 className="text-2xl font-semibold">{item.name}</h3>
                <p className="text-sm leading-relaxed text-ink/75">
                  {zh ? (item.id === 'launch' ? '为企业建立面向海外买家的专业数字商业网站。' : '从旧站出发，升级视觉、内容和买家询盘路径。') : (item.id === 'launch' ? 'Launch an international B2B website built around buyer tasks.' : 'Upgrade an existing site’s visual, content and inquiry journeys.')}
                </p>
                <p className="mt-2 text-3xl font-semibold tabular-nums">{format(item.price)}<span className="ml-2 text-xs font-normal text-ink/55">{zh ? '参考标准范围价' : 'indicative CNY'}</span></p>
              </div>
              <ul className="flex flex-1 flex-col gap-3 border-t border-ink/15 pt-5">
                {(zh ? [
                  '最多 ' + item.pages + ' 个独立业务页面或模板',
                  '最多 ' + item.records + ' 条产品资料、' + item.cases + ' 个经确认案例',
                  item.languages + ' 种语言、' + item.revisions + ' 轮集中修改',
                  item.id === 'rebuild' ? '旧站审查与最多 ' + item.redirects + ' 条 URL 映射' : '目标买家与内容、视觉、商业动作规划',
                  '真实询盘路径验证、一次上线协助与源码移交',
                  item.warrantyDays + ' 天约定范围内交付缺陷保障'
                ] : [
                  'Up to ' + item.pages + ' distinct pages or templates',
                  'Up to ' + item.records + ' product records and ' + item.cases + ' verified case studies',
                  item.languages + ' language, ' + item.revisions + ' consolidated revision rounds',
                  item.id === 'rebuild' ? 'Existing-site review and up to ' + item.redirects + ' URL mappings' : 'Buyer, content, visual and inquiry journey planning',
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
          {zh ? '参考价不是在线支付或自动诊断/自动建站承诺。实际项目以签署的范围、税务与书面报价为准。建议付款节点50% / 40% / 10%。不承诺搜索排名、询盘数量或成交额。超范围功能需单独确认。' : 'Reference pricing is not checkout or an automatic analysis/generation promise. Signed scope, tax treatment and written quotation govern. Proposed milestones: 50% / 40% / 10%. No guaranteed ranking, inquiry volume or sales. Extras are quoted separately.'}
        </p>
        {detail ? (
          <div className="grid gap-8 border-t border-ink/15 pt-8 lg:grid-cols-2">
            <div>
              <h3 className="text-xl font-semibold">{zh ? '标准增项参考' : 'Reference add-ons'}</h3>
              <ul className="mt-4 divide-y divide-ink/15 border-y border-ink/15">
                {offers.addons.map(item => <li key={item.id} className="flex justify-between gap-4 py-3 text-sm"><span>{addOnNames[item.id][zh ? 0 : 1]}</span><span className="shrink-0 font-mono">{format(item.price)}</span></li>)}
              </ul>
              <p className="mt-3 text-xs text-ink/60">{zh ? '所有增项须在执行前书面确认；语言专业校审与复杂集成单独评估。' : 'Extras require written preapproval. Specialist language review and integrations are assessed separately.'}</p>
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
