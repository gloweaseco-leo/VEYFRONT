'use client'

import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useLang, type Lang } from '@/lib/i18n'
import { cn } from '@/lib/utils'

export function Logo({ tone = 'light' }: { tone?: 'light' | 'dark' }) {
  const src = tone === 'dark' ? '/brand/logo_primary_dark.svg' : '/brand/logo_primary_light.svg'
  return (
    <Image
      src={src}
      alt="VEYFRONT"
      width={710}
      height={140}
      priority
      unoptimized
      className="block h-auto w-[122px] shrink-0 select-none min-[360px]:w-[148px] sm:w-[180px] xl:w-[194px]"
      draggable={false}
    />
  )
}

export function LangToggle({ tone = 'light' }: { tone?: 'light' | 'dark' }) {
  const { lang, setLang } = useLang()
  const pathname = usePathname()
  const cleanPath = pathname.startsWith('/en/') ? pathname.slice(3) : pathname === '/en' ? '/' : pathname.startsWith('/zh/') ? pathname.slice(3) : pathname === '/zh' ? '/' : pathname
  const publicPaths = new Set(['/', '/pricing', '/transformations', '/how-it-works', '/contact', '/start/launch', '/start/rebuild', '/privacy', '/terms', '/contact/privacy'])
  const isPublicPath = publicPaths.has(cleanPath)
  const options: { value: Lang; label: string }[] = [
    { value: 'en', label: 'EN' },
    { value: 'zh', label: '中文' },
  ]

  return (
    <div
      role="group"
      aria-label="Language / 语言"
      className={cn(
        'inline-flex items-center rounded-full border p-0.5 text-xs font-medium',
        tone === 'dark' ? 'border-ivory/25' : 'border-ink/20',
      )}
    >
      {options.map((o) => {
        const active = lang === o.value
        const className = cn(
          'inline-flex h-9 min-w-11 shrink-0 items-center justify-center rounded-full px-2.5 text-center leading-none focus-visible:outline-2 focus-visible:outline-offset-1',
          active
            ? tone === 'dark'
              ? 'bg-ivory text-ink'
              : 'bg-ink text-ivory'
            : tone === 'dark'
              ? 'text-ivory/75 hover:text-ivory'
              : 'text-ink/70 hover:text-ink',
          tone === 'dark' ? 'focus-visible:outline-ivory' : 'focus-visible:outline-ink',
        )

        if (isPublicPath) {
          // Native anchors expose both language URLs in server-rendered HTML to crawlers.
          // A full document navigation also refreshes rewrite-derived canonical/hreflang metadata.
          const href = o.value === 'en' ? '/en' + (cleanPath === '/' ? '' : cleanPath) : cleanPath
          return (
            <a key={o.value} href={href} hrefLang={o.value === 'zh' ? 'zh-CN' : 'en'} aria-current={active ? 'page' : undefined} className={className}>
              {o.label}
            </a>
          )
        }

        // Internal review surfaces are intentionally kept out of public locale URLs.
        return (
          <button key={o.value} type="button" aria-pressed={active} onClick={() => setLang(o.value)} className={className}>
            {o.label}
          </button>
        )
      })}
    </div>
  )
}

export function DemoBadge({
  className,
  tone = 'light',
  label,
}: {
  className?: string
  tone?: 'light' | 'dark'
  label?: string
}) {
  const { t } = useLang()
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-sm border px-1.5 py-0.5 font-mono text-[11px] font-semibold uppercase tracking-wider',
        tone === 'dark' ? 'border-lime/60 text-lime' : 'border-ink/40 bg-ivory text-ink',
        className,
      )}
    >
      <span aria-hidden="true" className="size-1.5 rounded-full bg-current" />
      {label ?? t.flagship.placeholder}
    </span>
  )
}

export function Segmented<T extends string>({
  label,
  value,
  onChange,
  options,
  tone = 'light',
  size = 'md',
}: {
  label: string
  value: T
  onChange: (v: T) => void
  options: { value: T; label: string; icon?: React.ReactNode }[]
  tone?: 'light' | 'dark'
  size?: 'md' | 'lg'
}) {
  const dark = tone === 'dark'
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={cn('inline-flex items-center rounded-full border p-1', dark ? 'border-ivory/20 bg-ivory/5' : 'border-ink/15 bg-ivory')}
      onKeyDown={(e) => {
        if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return
        e.preventDefault()
        const i = options.findIndex((o) => o.value === value)
        const next = options[(i + (e.key === 'ArrowRight' ? 1 : options.length - 1)) % options.length]
        onChange(next.value)
        const btn = e.currentTarget.querySelector<HTMLButtonElement>(`[data-value="${next.value}"]`)
        btn?.focus()
      }}
    >
      {options.map((o) => {
        const active = o.value === value
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={active}
            data-value={o.value}
            tabIndex={active ? 0 : -1}
            onClick={() => onChange(o.value)}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full font-medium motion-safe:transition-colors focus-visible:outline-2 focus-visible:outline-offset-2',
              size === 'lg' ? 'min-h-11 px-5 text-[15px]' : 'min-h-9 px-3.5 text-sm',
              active
                ? dark
                  ? 'bg-lime text-ink'
                  : 'bg-ink text-ivory'
                : dark
                  ? 'text-ivory/75 hover:text-ivory'
                  : 'text-ink/70 hover:text-ink',
              dark ? 'focus-visible:outline-lime' : 'focus-visible:outline-ink',
            )}
          >
            {o.icon}
            {o.label}
          </button>
        )
      })}
    </div>
  )
}
