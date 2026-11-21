import { ArrowRight } from 'lucide-react'
import type { ReactNode } from 'react'
import type { AutomaticResult } from '@/lib/vrae-preview-client'

type ReportDetails = Pick<AutomaticResult, 'procurement' | 'buyerJourney'>

export function CustomerReportDetails({ data, zh, panel, heading, sourceLink }: {
  data: ReportDetails
  zh: boolean
  panel: string
  heading: string
  sourceLink: (id: string) => ReactNode
}) {
  const { procurement, buyerJourney } = data
  const cardAnchor = (index: number) => `procurement-${index + 1}`
  return <>
    {buyerJourney && <section className={panel + ' space-y-3'} aria-labelledby="buyer-journey">
      <h2 id="buyer-journey" className={heading}>{zh ? '已记录的采购路径' : 'Recorded buyer paths'}</h2>
      <p className="text-sm leading-relaxed">{zh ? '这些路径来自本次访问的页面。表单提交、型号是否随询价传递、消息是否送达，仍需核实。'
        : 'These paths come from the pages visited. Form submission, model transfer and message delivery remain unverified.'}</p>
      {buyerJourney.paths.map((path, index) => {
        const complete = path.complete
        const label = complete ? (zh ? '已连通至联系页面' : 'Connected to a contact page')
          : (zh ? '仅记录到部分路径' : 'Part of the path was recorded')
        const body = <>
          <ol aria-label={zh ? '页面顺序' : 'Page sequence'} className="flex flex-wrap items-center gap-2 pt-2 text-sm">
            {path.sources.map((id, i) => <li key={i} className="inline-flex min-w-0 items-center gap-2">
              {i > 0 && <ArrowRight className="size-3.5 shrink-0" aria-hidden="true" />}{sourceLink(id)}
            </li>)}
          </ol>
          {path.products.length > 0 && <div className="flex flex-wrap gap-2 pt-2 text-sm">
            {path.products.map(i => <a key={i} href={'#' + cardAnchor(i)} className="font-medium underline underline-offset-4">
              {procurement?.cards[i]?.name}
            </a>)}
          </div>}
        </>
        if (index === 0) return <div key={index} className="vf-report-keep rounded-md bg-mist/50 p-3">
          <p className="text-sm font-semibold">{label}</p>{body}
        </div>
        return <details key={index} className="vf-report-web-only rounded-md border border-ink/15 p-3">
          <summary className="cursor-pointer text-sm font-semibold">{label}</summary>{body}
        </details>
      })}
      {buyerJourney.limited && <p className="text-sm text-ink/75">{zh ? '本次只列出部分已记录路径。' : 'Only a subset of recorded paths is shown.'}</p>}
    </section>}
    {procurement && <section className={panel + ' space-y-3'} aria-labelledby="procurement-details">
      <h2 id="procurement-details" className={heading}>{zh ? '产品资料复核' : 'Product information to verify'}</h2>
      <p className="text-sm leading-relaxed">{zh ? '以下资料取自产品页面。型号身份和规格是否适合实际工况，仍需核对。'
        : 'The information below comes from product pages. Model identity and suitability for the operating conditions still need verification.'}</p>
      {procurement.cards.map((card, index) => <article key={index} id={cardAnchor(index)} className="scroll-mt-6 rounded-md border border-ink/15 p-3 sm:p-4">
        <h3 className="text-base font-semibold">{card.name}</h3>
        {card.model && <p className="mt-1 text-sm">{zh ? '网页标注型号' : 'Model shown on the page'} · {card.model}</p>}
        {card.fields.length > 0 && <dl className="mt-2 divide-y divide-ink/10 text-sm">
          {card.fields.map(({ label, value }, i) => <div key={i} className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] gap-3 py-2">
            <dt>{label}</dt><dd className="font-medium">{value}</dd>
          </div>)}
        </dl>}
        {card.groups.some(group => group.state !== 'OBSERVED') && <details className="vf-report-web-only mt-2 text-sm">
          <summary className="cursor-pointer font-semibold">{zh ? '仍需核对的产品资料' : 'Product details still to verify'}</summary>
          <ul className="mt-2 space-y-1">{card.groups.filter(group => group.state !== 'OBSERVED').map((group, i) =>
            <li key={i}><strong>{group.title}</strong> · {group.nextStep}</li>)}</ul>
        </details>}
        <div className="mt-2 flex flex-wrap gap-2">{card.sources.map(id => <span key={id}>{sourceLink(id)}</span>)}</div>
      </article>)}
      {procurement.limited && <p className="text-sm text-ink/75">{zh ? '这里只列出部分已检查的产品。' : 'Only a subset of checked products is shown.'}</p>}
    </section>}
  </>
}
