'use client'

import Link from '@/components/l2m/localized-link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { ArrowUpRight, ClipboardList, Globe2, House, Layers3, MessageCircle, RefreshCw, X } from 'lucide-react'
import { track } from '@vercel/analytics'
import { useLang } from '@/lib/i18n'
import { WECOM_CONTACT_URL, wecomQrPath } from '@/lib/wecom-config'
import { recordWecomIntent } from '@/components/veyfront/wecom-contact'

/** Mobile-only sales journey. No fake checkout, diagnosis or direct chat claim. */
export function MobileQuickNav() {
  const pathname = usePathname()
  const { lang } = useLang()
  const zh = lang === 'zh'
  const path = pathname === '/en' ? '/' : pathname.replace(/^\/en(?=\/)/, '')
  const supported = path === '/' || path === '/pricing' || path === '/transformations' ||
    path === '/how-it-works' || path === '/contact' || path === '/start/launch' || path === '/start/rebuild'
  const [open, setOpen] = useState(false)
  const sheetRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)

  useEffect(() => { setOpen(false) }, [pathname])
  useEffect(() => {
    if (!open) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    sheetRef.current?.focus()
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') { setOpen(false); return }
      if (event.key !== 'Tab' || !sheetRef.current) return
      const controls = Array.from(sheetRef.current.querySelectorAll<HTMLElement>('a[href],button:not([disabled])'))
      if (!controls.length) return
      const first = controls[0]
      const last = controls[controls.length - 1]
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus() }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus() }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previousOverflow
      triggerRef.current?.focus()
    }
  }, [open])

  if (!supported) return null

  const record = (item: string) => {
    try { track('mobile_nav_action', { item, locale: lang }) } catch { /* analytics must not block navigation */ }
  }
  const anchorClass = 'flex min-h-12 min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-lg px-1 text-[12px] font-semibold leading-tight text-ink/75 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink'
  const contactLink = zh && Boolean(wecomQrPath())
    ? <a href={WECOM_CONTACT_URL} target="_blank" rel="noopener noreferrer"
        onClick={() => { record('wecom'); recordWecomIntent('mobile_nav') }}
        className="flex min-h-12 shrink-0 items-center justify-center gap-1.5 rounded-lg bg-lime px-3 text-[13px] font-semibold text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
        aria-label="打开企业微信联系页"><MessageCircle className="size-5" aria-hidden="true"/>微信咨询</a>
    : <Link href="/contact" onClick={() => record('contact')}
        className="flex min-h-12 shrink-0 items-center justify-center gap-1.5 rounded-lg bg-lime px-3 text-[13px] font-semibold text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink">
        <MessageCircle className="size-5" aria-hidden="true"/>{zh ? '联系顾问' : 'Contact'}</Link>

  return <>
    <div aria-hidden="true" className="h-[calc(76px+env(safe-area-inset-bottom))] md:hidden" data-testid="mobile-nav-spacer"/>
    <div data-testid="mobile-quick-nav" className="vf-mobile-nav-shell fixed inset-x-0 bottom-0 z-[70] border-t border-ink/15 bg-white/95 px-3 pb-[calc(8px+env(safe-area-inset-bottom))] pt-2 shadow-[0_-8px_30px_rgba(23,38,45,.1)] backdrop-blur-xl md:hidden">
      <nav aria-label={zh ? '手机快捷导航' : 'Mobile quick navigation'} className="mx-auto flex max-w-[520px] items-center gap-1">
        <Link href="/" aria-current={path === '/' ? 'page' : undefined} onClick={() => record('home')}
          className={anchorClass + (path === '/' ? ' !text-ink' : '')}>
          <House className={'size-5 ' + (path === '/' ? 'stroke-[2.5]' : '')} aria-hidden="true"/>{zh ? '首页' : 'Home'}
        </Link>
        <button type="button" ref={triggerRef} aria-expanded={open} aria-controls="vf-mobile-project-sheet"
            onClick={() => { record('project_menu'); setOpen(value => !value) }}
            className={anchorClass + (path.startsWith('/start/') ? ' !text-ink' : '')}>
            <Layers3 className="size-5" aria-hidden="true"/><span>{zh ? '建站/升级' : 'Services'}</span>
          </button>
        <Link href="/pricing" aria-current={path === '/pricing' ? 'page' : undefined} onClick={() => record('pricing')}
          className={anchorClass + (path === '/pricing' ? ' !text-ink' : '')}>
          <ClipboardList className={'size-5 ' + (path === '/pricing' ? 'stroke-[2.5]' : '')} aria-hidden="true"/>{zh ? '价格' : 'Pricing'}
        </Link>
        {contactLink}
      </nav>
    </div>
    {open && <div className="fixed inset-0 z-[80] md:hidden">
      <button type="button" className="absolute inset-0 bg-ink/65" aria-label={zh ? '关闭项目选择' : 'Close project choices'} onClick={() => setOpen(false)}/>
      <div id="vf-mobile-project-sheet" ref={sheetRef} tabIndex={-1} role="dialog" aria-modal="true"
        aria-labelledby="vf-mobile-project-title"
        className="absolute inset-x-3 bottom-[calc(82px+env(safe-area-inset-bottom))] mx-auto max-w-[500px] rounded-2xl border border-ink/10 bg-ivory p-5 text-ink shadow-2xl outline-none">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold tracking-wider text-ink/55">VEYFRONT / START</p>
            <h2 id="vf-mobile-project-title" className="mt-2 text-xl font-semibold">{zh ? '您现在需要什么？' : 'What would you like to do?'}</h2>
          </div>
          <button type="button" onClick={() => setOpen(false)} aria-label={zh ? '关闭' : 'Close'} className="flex size-11 shrink-0 items-center justify-center rounded-lg border border-ink/15">
            <X className="size-5" aria-hidden="true"/>
          </button>
        </div>
        <div className="mt-5 grid gap-3">
          <Link href="/start/launch" onClick={() => { record('launch'); setOpen(false) }} className="flex min-h-20 items-center gap-4 rounded-xl bg-lime px-4 py-3 focus-visible:outline-2">
            <Globe2 className="size-6 shrink-0" aria-hidden="true"/>
            <span className="flex-1"><strong className="block text-base">{zh ? '我要建新网站' : 'Build a new website'}</strong><span className="mt-1 block text-xs text-ink/70">{zh ? '还没有外贸独立站，从零开始' : 'Launch from scratch'}</span></span>
            <ArrowUpRight className="size-5 shrink-0" aria-hidden="true"/>
          </Link>
          <Link href="/start/rebuild" onClick={() => { record('rebuild'); setOpen(false) }} className="flex min-h-20 items-center gap-4 rounded-xl border border-ink/20 px-4 py-3 focus-visible:outline-2">
            <RefreshCw className="size-6 shrink-0" aria-hidden="true"/>
            <span className="flex-1"><strong className="block text-base">{zh ? '我要升级旧网站' : 'Improve an existing site'}</strong><span className="mt-1 block text-xs text-ink/70">{zh ? '已有官网，希望优化展示与询盘' : 'Improve the buyer journey'}</span></span>
            <ArrowUpRight className="size-5 shrink-0" aria-hidden="true"/>
          </Link>
        </div>
        <p className="mt-4 text-xs leading-relaxed text-ink/65">{zh ? '提交咨询不收取费用，实际交付范围与报价将提前书面确认。' : 'Inquiries are free. Scope and price are agreed in writing.'}</p>
      </div>
    </div>}
  </>
}
