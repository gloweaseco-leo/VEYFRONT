'use client'

import Link from '@/components/l2m/localized-link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { ChevronLeft, Menu, X } from 'lucide-react'
import { Logo, LangToggle } from './brand'
import { useLang } from '@/lib/i18n'
import { cn } from '@/lib/utils'
import { wecomQrPath } from '@/lib/wecom-config'
import { WecomContactCard, recordWecomIntent } from '@/components/veyfront/wecom-contact'

export const HOME_INPUT_ID = 'home-url'

export function ReviewBar({ direction }: { direction: 'A' | 'B' }) {
  const { t } = useLang()
  return (
    <div className="bg-ink text-ivory">
      <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4 px-5 py-2 font-mono text-[11px] uppercase tracking-wider md:px-10">
        <Link
          href="/review/stage-1"
          className="inline-flex min-h-8 items-center gap-1 hover:text-lime focus-visible:outline-2 focus-visible:outline-lime"
        >
          <ChevronLeft className="size-3.5" aria-hidden="true" />
          {t.review.back}
        </Link>
        <span className="truncate text-ivory/70">Stage 1 · Direction {direction} · Prototype — not production</span>
      </div>
    </div>
  )
}

export function useSiteLinks() {
  const { t } = useLang()
  return [
    { label: t.nav.pricing, href: '/pricing' },
    { label: t.nav.transformations, href: '/transformations' },
    { label: t.nav.howItWorks, href: '/how-it-works' },
    { label: t.nav.contact, href: '/contact' },
  ]
}

/**
 * Real route navigation between the four website pages.
 * "Analyze My Website" focuses the URL field on the current page when one exists, otherwise opens the homepage field.
 */
export function SiteHeader({ tone = 'light', inputId }: { tone?: 'light' | 'dark'; inputId?: string }) {
  const { t, lang } = useLang()
  const pathname = usePathname()
  const normalizedPath = pathname.startsWith('/en/') ? pathname.slice(3) : pathname === '/en' ? '/' : pathname
  const [open, setOpen] = useState(false)
  const [contactOpen, setContactOpen] = useState(false)
  const canWecom = lang === 'zh' && Boolean(wecomQrPath())
  const dark = tone === 'dark'
  const links = useSiteLinks()
  const menuId = 'site-menu'

  const linkCls = (active: boolean) =>
    cn(
      'relative inline-flex min-h-11 items-center underline-offset-[6px] hover:underline focus-visible:outline-2',
      active ? (dark ? 'text-ivory underline decoration-lime decoration-2' : 'text-ink underline decoration-2') : dark ? 'text-ivory/75' : 'text-ink/75',
    )

  const ctaCls = cn(
    'inline-flex min-h-10 items-center rounded-md px-4 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2',
    dark ? 'bg-lime text-ink focus-visible:outline-lime' : 'bg-ink text-ivory focus-visible:outline-ink',
  )

  void inputId // kept for compatibility with the existing homepage
  const analyze = canWecom
    ? <button type="button" className={cn(ctaCls, 'hidden sm:inline-flex')} aria-controls="vf-header-contact" aria-expanded={contactOpen}
        onClick={() => { if (!contactOpen) recordWecomIntent('header'); setContactOpen(v => !v) }}>微信咨询</button>
    : <Link href="/contact" className={cn(ctaCls, 'hidden sm:inline-flex')}>{lang === 'zh' ? '联系顾问' : t.nav.analyze}</Link>

  return (
    <header className={cn('relative', dark ? 'bg-ink text-ivory' : 'border-b border-ink/10 bg-ivory text-ink')}>
      <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4 px-5 py-4 md:px-10">
        <Link href="/" aria-label="VEYFRONT — Home" className="inline-flex min-h-11 items-center focus-visible:outline-2 focus-visible:outline-offset-4">
          <Logo tone={tone} />
        </Link>
        <nav aria-label={t.nav.navLabel} className="hidden items-center gap-8 text-sm font-medium lg:flex">
          {links.map((l) => {
            const active = normalizedPath === l.href
            return (
              <Link key={l.href} href={l.href} aria-current={active ? 'page' : undefined} className={linkCls(active)}>
                {l.label}
              </Link>
            )
          })}
        </nav>
        <div className="flex items-center gap-3">
          <LangToggle tone={tone} />
          {analyze}
          <button
            type="button"
            aria-expanded={open}
            aria-controls={menuId}
            onClick={() => setOpen((o) => !o)}
            className={cn(
              'inline-flex size-11 items-center justify-center rounded-md border lg:hidden focus-visible:outline-2',
              dark ? 'border-ivory/25 focus-visible:outline-lime' : 'border-ink/20 focus-visible:outline-ink',
            )}
          >
            {open ? <X className="size-5" aria-hidden="true" /> : <Menu className="size-5" aria-hidden="true" />}
            <span className="sr-only">{open ? 'Close menu' : 'Open menu'}</span>
          </button>
        </div>
      </div>
      {contactOpen && canWecom && <div id="vf-header-contact" role="region" aria-label="企业微信快捷联系"
        className="absolute right-5 top-full z-50 w-[min(350px,calc(100vw-40px))] rounded-xl border border-ink/15 bg-ivory p-2 text-ink shadow-xl md:right-10"
        onKeyDown={e => { if (e.key === 'Escape') setContactOpen(false) }}>
        <button type="button" onClick={() => setContactOpen(false)} className="mb-1 ml-auto flex min-h-9 items-center gap-1 px-2 text-xs" aria-label="关闭微信联系面板">
          <X className="size-4" aria-hidden="true"/> 关闭
        </button>
        <WecomContactCard placement="header" compact/>
      </div>}
      {open && (
        <nav id={menuId} aria-label={t.nav.navLabel} className={cn('flex flex-col border-t px-5 pb-4 lg:hidden', dark ? 'border-ivory/15' : 'border-ink/10')}>
          {[{ label: 'VEYFRONT', href: '/' }, ...links].map((l) => {
            const active = normalizedPath === l.href
            return (
              <Link
                key={l.href}
                href={l.href}
                aria-current={active ? 'page' : undefined}
                onClick={() => setOpen(false)}
                className={cn(
                  'flex min-h-12 items-center justify-between border-b text-base font-medium',
                  dark ? 'border-ivory/10' : 'border-ink/10',
                  active && (dark ? 'text-lime' : 'text-ink'),
                )}
              >
                {l.label}
                {active && <span aria-hidden="true" className="size-1.5 rounded-full bg-current" />}
              </Link>
            )
          })}
          <Link href={canWecom ? '/contact#wechat' : '/contact'} onClick={() => setOpen(false)}
            className={cn('mt-4 inline-flex min-h-12 items-center justify-center rounded-md font-semibold', dark ? 'bg-lime text-ink' : 'bg-ink text-ivory')}>
            {canWecom ? '微信咨询' : (lang === 'zh' ? '联系顾问' : t.nav.analyze)}
          </Link>
        </nav>
      )}
    </header>
  )
}
