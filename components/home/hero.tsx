'use client'

import Link from 'next/link'
import { ArrowDown, ArrowUpRight, Globe2, RefreshCw } from 'lucide-react'
import { UrlAnalyzer } from '@/components/l2m/url-analyzer'
import { DemoViewport } from '@/components/l2m/demo-viewport'
import { Segmented } from '@/components/l2m/brand'
import { useFlagship } from '@/components/l2m/use-flagship'
import { cn } from '@/lib/utils'
import { HERO_INPUT_ID, useHomeCopy, useHomeDemo } from './home-state'

export function Hero() {
  const { h, t, lang } = useHomeCopy()
  const { view, setView } = useHomeDemo()
  const { device } = useFlagship(null)

  return (
    <section aria-labelledby="hero-title" className="bg-ink text-ivory">
      <div className="mx-auto grid max-w-[1440px] gap-10 px-5 pt-8 pb-14 md:px-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:items-center lg:gap-14 lg:pt-14 lg:pb-20">
        <div className="flex min-w-0 flex-col gap-6">
          <p className="w-fit rounded-full border border-ivory/20 px-3 py-1 font-mono text-xs uppercase tracking-[0.18em] text-ivory/75">
            {t.hero.brandLine}
          </p>
          <h1
            id="hero-title"
            className={cn(
              'text-balance font-semibold',
              lang === 'zh' ? 'text-[32px] leading-tight sm:text-5xl' : 'text-[36px] leading-[1.04] tracking-[-0.03em] sm:text-5xl xl:text-[60px]',
            )}
          >
            {t.hero.headline}
          </h1>
          <p className="text-pretty leading-relaxed text-ivory/75 lg:text-lg">{t.hero.subtitle}</p>
          <div className="grid gap-3 sm:grid-cols-2" aria-label={lang === 'zh' ? '选择网站服务' : 'Choose your website service'}>
            <Link href="/start/launch" className="group flex min-h-28 flex-col justify-between rounded-lg bg-lime p-4 text-ink transition-transform hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-lime">
              <span className="flex items-center justify-between text-xs font-semibold uppercase tracking-widest"><Globe2 className="size-4" /> Launch <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5" /></span>
              <span className="text-lg font-semibold">{lang === 'zh' ? '建立新网站' : 'Build a new website'}</span>
            </Link>
            <Link href="/start/rebuild" className="group flex min-h-28 flex-col justify-between rounded-lg border border-ivory/40 p-4 text-ivory transition-transform hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-lime">
              <span className="flex items-center justify-between text-xs font-semibold uppercase tracking-widest"><RefreshCw className="size-4" /> Rebuild <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5" /></span>
              <span className="text-lg font-semibold">{lang === 'zh' ? '重构已有网站' : 'Transform an existing website'}</span>
            </Link>
          </div>
          <div className="border-l-2 border-lime/70 pl-4">
            <p className="mb-3 font-mono text-xs uppercase tracking-wider text-ivory/70">{lang === 'zh' ? '已有网站？从现有网址开始了解升级方案' : 'Already have a website? Start with its URL'}</p>
            <UrlAnalyzer tone="dark" inputId={HERO_INPUT_ID} size="lg" sampleReportHref="#report" />
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
            <a
              href="#transformation"
              className="inline-flex min-h-11 w-fit items-center gap-2 font-semibold text-ivory underline decoration-lime decoration-2 underline-offset-[6px] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-lime"
            >
              {t.hero.ctaSecondary}
              <ArrowDown className="size-4" aria-hidden="true" />
            </a>
            <p className="text-sm text-ivory/65">{t.hero.boundary.join(' · ')}</p>
          </div>
        </div>

        <div className="flex min-w-0 flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Segmented
              label={h.hero.viewLabel}
              value={view}
              onChange={setView}
              options={[
                { value: 'before', label: t.flagship.before },
                { value: 'after', label: t.flagship.after },
              ]}
            />

          </div>
          <DemoViewport
            view={view}
            device={device}
            className={device === 'mobile' ? '' : 'w-full'}
            bodyHeight="h-[440px] xl:h-[500px]"
            mobileBodyHeight="h-[420px]"
            badgeLabel=""
          />
          <div aria-live="polite" className="flex flex-col gap-1 border-l-2 border-lime pl-4 text-sm leading-relaxed">
            <p className="text-ivory">{view === 'after' ? h.hero.proofAfter : h.hero.proofBefore}</p>
            <p className="text-ivory/55">{h.hero.caption}</p>
          </div>
        </div>
      </div>
    </section>
  )
}
