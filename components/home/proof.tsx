'use client'

import { SectionIntro, useHomeCopy } from './home-state'

export function Proof() {
  const { h } = useHomeCopy()
  const p = h.proof
  return (
    <section id="proof" aria-labelledby="proof-title" className="scroll-mt-4 bg-mist text-ink">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-9 px-5 py-16 md:px-10 lg:py-24">
        <SectionIntro id="proof-title" eyebrow={p.eyebrow} title={p.title} lede={p.lede} />
        <ul className="grid gap-px overflow-hidden rounded-xl border border-ink/15 bg-ink/15 md:grid-cols-3">
          {p.pillars.map(pillar => (
            <li key={pillar.name} className="flex flex-col gap-4 bg-ivory p-6 md:p-8">
              <h3 className="text-balance text-xl font-semibold">{pillar.name}</h3>
              <p className="text-base leading-relaxed">{pillar.promise}</p>
              <p className="text-sm leading-relaxed text-ink/70">{pillar.detail}</p>
            </li>
          ))}
        </ul>
        <p className="max-w-3xl border-l-2 border-ink pl-4 text-sm leading-relaxed text-ink/75">{p.buildVsDelivery}</p>
      </div>
    </section>
  )
}
