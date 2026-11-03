'use client'
import NextLink from 'next/link'
import type { ComponentProps } from 'react'
import { useLang } from '@/lib/i18n'

export default function LocalizedLink(props: ComponentProps<typeof NextLink>) {
  const { lang } = useLang()
  const href = props.href
  const internal = typeof href === 'string' && href.startsWith('/') &&
    !href.startsWith('/zh/') && href !== '/zh' &&
    !href.startsWith('/api/') && !href.startsWith('/review/') &&
    !href.startsWith('/a/') && !href.startsWith('/b/')
  const localized = lang === 'zh' && internal ? '/zh' + (href === '/' ? '' : href) : href
  return <NextLink {...props} href={localized} />
}
