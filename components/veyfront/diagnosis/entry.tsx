'use client'

import { ScanSearch, ArrowUpRight } from 'lucide-react'
import Link from '@/components/l2m/localized-link'
import { useLang } from '@/lib/i18n'
import { diagnosisPath } from '@/lib/diagnosis-preview'

export function DiagnosisEntry({ home = false }: { home?: boolean }) {
  const { lang } = useLang()
  const zh = lang === 'zh'
  return (
    <Link href={diagnosisPath} data-testid="diagnosis-entry" className={home
      ? 'inline-flex min-h-11 w-fit items-center gap-2 rounded-md border border-lime/40 px-3 text-sm font-semibold text-lime hover:bg-lime/10 focus-visible:outline-2 focus-visible:outline-offset-2'
      : 'inline-flex min-h-11 w-fit items-center gap-2 rounded-md border border-ink/20 bg-white px-3 text-sm font-semibold text-ink hover:bg-mist/40 focus-visible:outline-2 focus-visible:outline-offset-2'}>
      <ScanSearch aria-hidden="true" className="size-4 shrink-0" />
      <span>{zh ? '免费预诊断旧站 · 预览' : 'Free website check · Preview'}</span>
      <ArrowUpRight aria-hidden="true" className="size-4 shrink-0" />
    </Link>
  )
}
