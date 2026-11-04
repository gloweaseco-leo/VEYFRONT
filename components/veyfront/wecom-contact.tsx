'use client'

import Link from '@/components/l2m/localized-link'
import { useLang } from '@/lib/i18n'
import { wecomQrPath } from '@/lib/wecom-config'
import { track } from '@vercel/analytics'
import { MessageCircle, QrCode, ArrowUpRight, Download } from 'lucide-react'
import { useState } from 'react'

export function recordWecomIntent(placement: 'contact' | 'header' | 'intake' | 'footer' | 'home') {
  // Counts interest only. No PII, visitor identifier, QR identity or chat content.
  try { track('wecom_contact_intent', { placement }) } catch { /* Analytics is optional. */ }
}

export function WecomContactCard({ placement = 'contact', compact = false }: {
  placement?: 'contact' | 'header' | 'intake' | 'footer' | 'home'
  compact?: boolean
}) {
  const { lang } = useLang()
  const zh = lang === 'zh'
  const qr = wecomQrPath()
  const [expanded, setExpanded] = useState(compact)
  return <section id={compact ? undefined : 'wechat'} aria-label={zh ? '企业微信咨询' : 'WeCom contact'}
    className="h-full rounded-xl border border-ink/15 bg-mist/45 p-6 sm:p-8">
    <p className="flex items-center gap-2 font-mono text-xs font-semibold tracking-[0.14em] text-ink/70">
      <MessageCircle className="size-4" aria-hidden="true"/> {zh ? '微信咨询 / WECOM' : 'WECOM / CHINA'}
    </p>
    <h2 className="mt-4 text-2xl font-semibold leading-snug">{zh ? '先聊聊您的网站计划' : 'Talk to VEYFRONT'}</h2>
    <p className="mt-3 text-sm leading-relaxed text-ink/75">{zh ? '还没想好选新建还是升级？可以先说明您在做什么业务、希望网站解决什么问题。' : 'Use the project form or email for a written project discussion.'}</p>
    {qr ? <>
      {!expanded && <button type="button" aria-expanded={expanded} aria-controls="vf-wecom-qr"
        onClick={() => { recordWecomIntent(placement); setExpanded(true) }}
        className="mt-6 inline-flex min-h-12 items-center gap-2 rounded-md bg-ink px-5 font-semibold text-ivory">
        <QrCode className="size-5" aria-hidden="true"/>{zh ? '查看企业微信二维码' : 'View WeCom QR'}
      </button>}
      {expanded && <div id="vf-wecom-qr" className="mt-6">
        <div className="inline-flex max-w-full flex-col items-center rounded-lg border border-ink/15 bg-white p-3">
          {/* A real verified image is required. No placeholder QR and no automatic friend-add claim. */}
          <img src={qr} alt={zh ? 'VEYFRONT 企业微信联系二维码' : 'VEYFRONT WeCom contact QR code'}
            width={216} height={216} loading="lazy" className="aspect-square h-[216px] w-[216px] max-w-full object-contain"/>
          <a href={qr} download onClick={() => recordWecomIntent(placement)}
            className="mt-2 inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-ink underline underline-offset-4">
            <Download className="size-4" aria-hidden="true"/>{zh ? '保存二维码' : 'Save QR image'}
          </a>
        </div>
        <p className="mt-3 max-w-xs text-xs leading-relaxed text-ink/65">
          {zh ? '手机访问可长按图片保存，再通过微信识别；实际添加成功以双方建立联系为准。' : 'Save the QR image, then scan it using WeCom/WeChat on your phone.'}
        </p>
      </div>}
    </> : <div className="mt-6 rounded-lg border border-ink/15 bg-ivory/70 px-4 py-4">
      <p className="text-sm font-medium">{zh ? '企业微信接待入口尚未启用' : 'WeCom contact is not enabled yet'}</p>
      <p className="mt-2 text-xs leading-relaxed text-ink/70">{zh ? '我们正在配置正式商务账号。现在可直接提交需求，不需要先添加微信。' : 'Please use the project inquiry form or email instead.'}</p>
    </div>}
    {!compact && <Link href="/contact#project-form" className="mt-6 inline-flex min-h-11 items-center gap-2 text-sm font-semibold underline underline-offset-4">
      {zh ? '我想先提交项目需求' : 'Send a project inquiry'} <ArrowUpRight className="size-4" aria-hidden="true"/>
    </Link>}
  </section>
}
