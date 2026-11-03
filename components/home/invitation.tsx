'use client'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { Logo } from '@/components/l2m/brand'
import { useSiteLinks } from '@/components/l2m/site-header'
import { useLang } from '@/lib/i18n'
export function Invitation(){
 const {lang}=useLang(),zh=lang==='zh'
 return <section className="bg-ink text-ivory" aria-labelledby="invite-title">
 <div className="mx-auto max-w-4xl px-5 py-16 text-center md:px-10 lg:py-24">
  <p className="font-mono text-xs uppercase tracking-widest text-lime">YOUR NEXT DIGITAL FRONTIER</p>
  <h2 id="invite-title" className="mt-3 text-balance text-3xl font-semibold sm:text-5xl">{zh?'让海外客户更容易找到您的企业，从新网站开始。':'Your next website starts here.'}</h2>
  <p className="mx-auto mt-4 max-w-xl leading-relaxed text-ivory/70">{zh?'告诉我们您的产品与目标市场，我们先确认交付范围和总价。免费提交需求。':'Tell us your goals. We agree the full scope and price before any work or payment.'}</p>
  <div className="mt-8 grid gap-3 text-left sm:grid-cols-2">
   <Link href="/start/launch" className="flex min-h-20 items-center justify-between gap-3 rounded-lg bg-lime p-5 font-semibold text-ink">{zh?'我要建新网站':'Build a new site'} <ArrowUpRight className="size-5"/></Link>
   <Link href="/start/rebuild" className="flex min-h-20 items-center justify-between gap-3 rounded-lg border border-ivory/35 p-5 font-semibold text-ivory">{zh?'我要升级网站':'Rebuild my site'} <ArrowUpRight className="size-5"/></Link>
  </div>
 </div>
 </section>
}
export function SiteFooter(){
 const {lang}=useLang(),zh=lang==='zh'
 const links=useSiteLinks()
 return <footer className="border-t border-ivory/10 bg-ink text-ivory">
  <div className="mx-auto max-w-[1440px] space-y-6 px-5 py-10 md:px-10">
   <div className="flex flex-wrap items-start justify-between gap-5">
    <div className="space-y-3"><Link href="/" aria-label="VEYFRONT — Home" className="inline-flex"><Logo tone="dark"/></Link>
    <p className="max-w-lg text-sm leading-relaxed text-ivory/65">{zh?'帮助企业建立、升级与改善面向海外买家的数字商业界面。':'Building and improving digital business websites for global B2B buyers.'}</p>
    </div>
    <a href="mailto:hello@veyfront.com" className="inline-flex min-h-11 items-center text-sm font-semibold text-lime underline underline-offset-4">hello@veyfront.com</a>
   </div>
   <nav aria-label="Footer" className="flex flex-wrap items-center gap-x-7 gap-y-2 border-t border-ivory/15 pt-5 text-sm">
    {links.map(l=><Link key={l.href} href={l.href} className="inline-flex min-h-11 items-center text-ivory/85 hover:text-lime">{l.label}</Link>)}
    <Link href="/privacy" className="inline-flex min-h-11 items-center text-ivory/80 hover:text-lime">{zh?'隐私说明':'Privacy'}</Link>
    <Link href="/terms" className="inline-flex min-h-11 items-center text-ivory/80 hover:text-lime">{zh?'网站条款':'Terms'}</Link>
   </nav>
  </div>
 </footer>
}
