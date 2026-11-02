'use client'

import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { Logo } from '@/components/l2m/brand'
import { useSiteLinks } from '@/components/l2m/site-header'
import { UrlAnalyzer } from '@/components/l2m/url-analyzer'
import { cn } from '@/lib/utils'
import { INVITE_INPUT_ID, useHomeCopy } from './home-state'

export function Invitation() {
  const { h, lang } = useHomeCopy()
  return (
    <section aria-labelledby="invite-title" className="bg-ink text-ivory">
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 px-5 py-20 text-center md:px-10 lg:py-28">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-lime">{h.invite.eyebrow}</p>
        <h2
          id="invite-title"
          className={cn(
            'text-balance font-semibold',
            lang === 'zh' ? 'text-3xl leading-tight sm:text-5xl' : 'text-[36px] leading-[1.05] tracking-[-0.03em] sm:text-[56px]',
          )}
        >
          {h.invite.title}
        </h2>
        <div className="grid w-full gap-3 text-left sm:grid-cols-2">
          <Link href="/start/launch" className="flex min-h-24 items-center justify-between rounded-lg bg-lime p-5 font-semibold text-ink focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-lime">
            <span>{lang === 'zh' ? 'Launch · 建立新网站' : 'Launch · Build a new website'}</span><ArrowUpRight className="size-5" />
          </Link>
          <Link href="/start/rebuild" className="flex min-h-24 items-center justify-between rounded-lg border border-ivory/35 p-5 font-semibold text-ivory focus-visible:outline-2 focus-visible:outline-lime">
            <span>{lang === 'zh' ? 'Rebuild · 升级现有网站' : 'Rebuild · Transform your site'}</span><ArrowUpRight className="size-5" />
          </Link>
        </div>
        <div className="w-full border-t border-ivory/20 pt-5">
          <p className="mb-3 text-left text-sm text-ivory/75">{lang === 'zh' ? '输入现有网址，说明你的改造目标。' : 'Enter your current website URL to discuss an upgrade.'}</p>
          <UrlAnalyzer tone="dark" inputId={INVITE_INPUT_ID} size="lg" className="w-full text-left" sampleReportHref="#report" />
        </div>
        <ul className="flex flex-col gap-1 text-sm text-ivory/65 sm:flex-row sm:gap-6">
          {h.invite.boundary.map((b) => (
            <li key={b}>{b}</li>
          ))}
        </ul>
      </div>
    </section>
  )
}

export function SiteFooter() {
  const { h, lang } = useHomeCopy()
  const links = useSiteLinks()
  return (
    <footer className="border-t border-ivory/10 bg-ink text-ivory">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-6 px-5 py-10 md:px-10">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="flex flex-col gap-3">
            <Link href="/" aria-label="VEYFRONT — Home" className="w-fit focus-visible:outline-2 focus-visible:outline-lime"><Logo tone="dark" /></Link>
            <p className="max-w-lg text-sm leading-relaxed text-ivory/65">{h.footer.note}</p>
          </div>
          <Link href="/contact" className="inline-flex min-h-12 items-center rounded-md bg-lime px-5 font-semibold text-ink">{lang === 'zh' ? '联系 VEYFRONT' : 'Contact VEYFRONT'}</Link>
        </div>
        <nav aria-label="Footer" className="flex flex-wrap items-center gap-x-7 gap-y-2 border-t border-ivory/15 pt-5 text-sm">
          {links.map(l=><Link key={l.href} href={l.href} className="inline-flex min-h-11 items-center text-ivory/85 hover:text-lime">{l.label}</Link>)}
          <Link href="/privacy" className="inline-flex min-h-11 items-center text-ivory/80 hover:text-lime">{lang === 'zh' ? '隐私说明' : 'Privacy'}</Link>
          <Link href="/terms" className="inline-flex min-h-11 items-center text-ivory/80 hover:text-lime">{lang === 'zh' ? '使用条款' : 'Terms'}</Link>
        </nav>
      </div>
    </footer>
  )
}
