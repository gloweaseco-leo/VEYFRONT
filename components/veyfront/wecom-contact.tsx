'use client'

import Link from '@/components/l2m/localized-link'
import { useState } from 'react'
import { useLang } from '@/lib/i18n'
import { wecomQrPath } from '@/lib/wecom-config'
import { track } from '@vercel/analytics'
import { MessageCircle, ArrowUpRight, Download } from 'lucide-react'

export function recordWecomIntent(placement: 'contact' | 'header' | 'intake' | 'footer' | 'home' | 'mobile_nav') {
  // Counts interest only. No PII, visitor identifier, QR identity or chat content.
  try { track('wecom_contact_intent', { placement }) } catch { /* Analytics is optional. */ }
}

export function WecomContactCard({ placement = 'contact', compact = false }: {
  placement?: 'contact' | 'header' | 'intake' | 'footer' | 'home' | 'mobile_nav'
  compact?: boolean
}) {
  const { lang } = useLang()
  const zh = lang === 'zh'
  const qr = wecomQrPath()
  const [showQr, setShowQr] = useState(true)
  return <section id={compact ? undefined : 'wechat'} aria-label={zh ? '企业微信咨询' : 'WeCom contact'}
    className="scroll-mt-6 rounded-xl border border-ink/15 bg-white p-4 sm:h-full sm:bg-mist/45 sm:p-8">
    <p className="flex items-center gap-2 font-mono text-xs font-semibold tracking-[0.14em] text-ink/70">
      <MessageCircle className="size-4" aria-hidden="true"/> {zh ? '微信咨询 / WECOM' : 'WECOM / CHINA'}
    </p>
    <h2 className="mt-3 text-xl font-semibold leading-snug sm:mt-4 sm:text-2xl">{zh ? '先聊聊您的外贸网站需求' : 'Talk to VEYFRONT'}</h2>
    <p className="mt-2 text-[14px] leading-[1.7] text-ink/75 sm:mt-3 sm:text-sm">{zh ? '不确定需要新建网站还是改版升级？告诉我们您的产品和目标市场，可以先聊聊。' : 'Use the project form or email for a written project discussion.'}</p>
    {qr ? <>
      <div className="mt-4 flex flex-col sm:mt-6">
        <div id={compact ? 'vf-wecom-qr-header' : 'vf-wecom-qr'} className={'order-2 mt-3 max-w-full flex-col items-center rounded-lg border border-ink/15 bg-white p-3 sm:order-1 sm:mt-0 ' + (showQr ? 'flex' : 'hidden sm:flex')}>
          {/* A real verified image is required. No placeholder QR and no automatic friend-add claim. */}
          <img src={qr} alt={zh ? 'VEYFRONT 企业微信联系二维码' : 'VEYFRONT WeCom contact QR code'}
            width={309} height={304} loading="lazy" className="h-auto w-[240px] max-w-full object-contain sm:w-[216px]"/>
          <a href={qr} download onClick={() => recordWecomIntent(placement)}
            className="mt-2 inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-ink underline underline-offset-4">
            <Download className="size-4" aria-hidden="true"/>{zh ? '保存二维码' : 'Save QR image'}
          </a>
        </div>
        <button type="button" aria-controls={compact ? 'vf-wecom-qr-header' : 'vf-wecom-qr'} aria-expanded={showQr} onClick={() => setShowQr(value => !value)} className="order-2 mt-3 inline-flex min-h-11 items-center justify-center rounded-lg border border-ink/20 px-4 text-sm font-semibold sm:hidden">{showQr ? (zh ? '收起二维码' : 'Hide QR') : (zh ? '查看联系二维码' : 'Show QR code')}</button>
        <p className="order-1 rounded-lg border border-ink/10 bg-mist/40 px-3 py-3 text-center text-sm font-medium leading-relaxed text-ink sm:order-2 sm:mt-4">
          {zh ? '微信内长按二维码识别添加，或使用微信扫一扫。' : 'Long-press this QR inside WeChat, or use WeChat Scan to connect.'}
        </p>
        <p className="order-3 mt-3 max-w-xs text-xs leading-relaxed text-ink/70">
          {zh ? '如无法长按识别，可保存图片后在微信扫一扫中选择相册图片；也可填写下方项目需求。' : 'If long-press does not work, save the image and select it from your album in WeChat Scan. The inquiry form remains available.'}
        </p>
      </div>
    </> : <div className="mt-6 rounded-lg border border-ink/15 bg-ivory/70 px-4 py-4">
      <p className="text-sm font-medium">{zh ? '企业微信接待入口尚未启用' : 'WeCom contact is not enabled yet'}</p>
      <p className="mt-2 text-xs leading-relaxed text-ink/70">{zh ? '我们正在配置正式商务账号。现在可直接提交需求，不需要先添加微信。' : 'Please use the project inquiry form or email instead.'}</p>
    </div>}
    {!compact && <Link href="/contact#project-form" className="mt-6 inline-flex min-h-11 items-center gap-2 text-sm font-semibold underline underline-offset-4">
      {zh ? '我想先提交项目需求' : 'Send a project inquiry'} <ArrowUpRight className="size-4" aria-hidden="true"/>
    </Link>}
  </section>
}
