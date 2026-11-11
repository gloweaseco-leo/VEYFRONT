'use client'

import Link from '@/components/l2m/localized-link'
import { useLang } from '@/lib/i18n'
import { wecomQrPath, WECOM_CONTACT_URL } from '@/lib/wecom-config'
import { track } from '@vercel/analytics'
import { MessageCircle, ArrowUpRight, Download, ExternalLink } from 'lucide-react'

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
  return <section id={compact ? undefined : 'wechat'} aria-label={zh ? '企业微信咨询' : 'WeCom contact'}
    className="h-full rounded-xl border border-ink/15 bg-mist/45 p-6 sm:p-8">
    <p className="flex items-center gap-2 font-mono text-xs font-semibold tracking-[0.14em] text-ink/70">
      <MessageCircle className="size-4" aria-hidden="true"/> {zh ? '微信咨询 / WECOM' : 'WECOM / CHINA'}
    </p>
    <h2 className="mt-4 text-2xl font-semibold leading-snug">{zh ? '先聊聊您的外贸网站需求' : 'Talk to VEYFRONT'}</h2>
    <p className="mt-3 text-sm leading-relaxed text-ink/75">{zh ? '不确定需要新建网站还是改版升级？告诉我们您的产品和目标市场，可以先聊聊。' : 'Use the project form or email for a written project discussion.'}</p>
    {qr ? <>
      <div id="vf-wecom-qr" className="mt-6 flex flex-col">
        <div className="order-2 mt-4 inline-flex max-w-full flex-col items-center sm:order-1 sm:mt-0 rounded-lg border border-ink/15 bg-white p-3">
          {/* A real verified image is required. No placeholder QR and no automatic friend-add claim. */}
          <img src={qr} alt={zh ? 'VEYFRONT 企业微信联系二维码' : 'VEYFRONT WeCom contact QR code'}
            width={216} height={216} loading="lazy" className="aspect-square h-[216px] w-[216px] max-w-full object-contain"/>
          <a href={qr} download onClick={() => recordWecomIntent(placement)}
            className="mt-2 inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-ink underline underline-offset-4">
            <Download className="size-4" aria-hidden="true"/>{zh ? '保存二维码' : 'Save QR image'}
          </a>
        </div>
        <a href={WECOM_CONTACT_URL} target="_blank" rel="noopener noreferrer"
          onClick={() => recordWecomIntent(placement)}
          className="order-1 inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-ink px-5 text-center font-semibold text-ivory sm:order-2 sm:mt-4 focus-visible:outline-2 focus-visible:outline-offset-2">
          {zh ? '打开企业微信联系页面' : 'Open WeCom contact page'} <ExternalLink className="size-4" aria-hidden="true"/>
        </a>
        <p className="order-3 mt-3 max-w-xs text-xs leading-relaxed text-ink/65">
          {zh ? '电脑端可用微信扫描；手机端可点击联系页，或长按保存二维码再在微信中识别。页面跳转不等于已成功添加好友。' : 'Scan on desktop, or follow the official WeCom contact link on mobile. Opening a link is not proof that contact was established.'}
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
