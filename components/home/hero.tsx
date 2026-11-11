'use client'

import Link from '@/components/l2m/localized-link'
import { useEffect, useRef, useState } from 'react'
import { ArrowUpRight, Globe2, RefreshCw, Search, ScanSearch, Send, ChartNoAxesCombined } from 'lucide-react'
import { useLang } from '@/lib/i18n'

export function Hero() {
 const {lang}=useLang()
 const zh=lang==='zh'
 const motionFrame=useRef<HTMLDivElement>(null)
 const [motionStarted,setMotionStarted]=useState(false)
 const [motionVisible,setMotionVisible]=useState(false)
 // All static content remains visible if IntersectionObserver/JS is unavailable.
 useEffect(()=>{
   const frame=motionFrame.current
   if(!frame || typeof IntersectionObserver === 'undefined')return
   const observer=new IntersectionObserver(([entry])=>{
     const visible=Boolean(entry?.isIntersecting)
     setMotionVisible(visible)
     if(visible)setMotionStarted(true)
   },{threshold:0.15})
   observer.observe(frame)
   return ()=>observer.disconnect()
 },[])

 return <section aria-labelledby="hero-title" className="bg-ink text-ivory">
   <div className="mx-auto grid max-w-[1440px] gap-8 px-5 py-10 sm:gap-12 sm:py-16 md:px-10 lg:grid-cols-[minmax(0,1.12fr)_minmax(0,0.88fr)] lg:items-center lg:gap-16 lg:py-24">
    <div className="flex flex-col gap-7">
     <p className="w-fit rounded-full border border-ivory/20 px-3 py-1 font-mono text-xs uppercase tracking-[0.17em] text-ivory/75">VEYFRONT / DIGITAL FRONTIERS</p>
     <h1 id="hero-title" className="text-balance text-[32px] font-semibold leading-[1.18] tracking-tight sm:text-5xl xl:text-[58px]">
      {zh?'让海外客户找到你、看懂你，并向你发起询盘。':'Building Digital Frontiers for Global Business.'}
     </h1>
     <p className="max-w-2xl text-pretty text-base leading-relaxed text-ivory/75 sm:text-lg">
      {zh?'从零建设或升级面向海外采购商的 B2B 企业官网。专业设计、中英文产品展示、搜索优化基础与在线询盘，从建设到上线一次交付。':'Build a new international B2B website or improve your existing one. Professional design, SEO-Native foundations, buyer-ready content and real inquiry paths — delivered together.'}
     </p>
     <div className="grid gap-3 sm:grid-cols-2" aria-label={zh?'选择网站项目':'Choose a website project'}>
      <Link href="/start/launch" className="group flex min-h-[100px] flex-col sm:min-h-28 justify-between gap-3 rounded-lg bg-lime p-5 font-semibold text-ink transition-transform hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-lime">
       <span className="flex items-center justify-between text-xs uppercase tracking-wider"><Globe2 className="size-5"/> LAUNCH <ArrowUpRight className="size-5"/></span>
       <span><span className="block text-xl">{zh?'我要建立新网站':'Build a new website'}</span><span className="mt-1 block text-sm font-normal opacity-80">{zh?'还没有独立站，从零开始':'Start from scratch'}</span></span>
      </Link>
      <Link href="/start/rebuild" className="group flex min-h-28 flex-col justify-between gap-3 rounded-lg border border-ivory/40 p-5 font-semibold text-ivory transition-transform hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-lime">
       <span className="flex items-center justify-between text-xs uppercase tracking-wider"><RefreshCw className="size-5"/> REBUILD <ArrowUpRight className="size-5"/></span>
       <span><span className="block text-xl">{zh?'我要升级旧网站':'Improve my current site'}</span><span className="mt-1 block text-sm font-normal text-ivory/70">{zh?'已有网站，保留有价值的内容':'Already have a site'}</span></span>
      </Link>
     </div>
     <p className="text-sm text-ivory/60">{zh?'新建和常规旧站升级均可选择三档方案，¥3,680起；提交咨询无需付款。':'Both new builds and standard rebuilds can choose from three plans starting at ¥3,680. Inquiries are free.'}</p>
    </div>
    <div ref={motionFrame} data-testid="hero-hybrid-panel" data-vf-motion={motionStarted?'started':'static'} data-vf-visible={motionVisible?'yes':'no'} className="vf-motion-frame relative isolate min-w-0 overflow-hidden rounded-xl border border-lime/25 bg-[#172e34] p-5 shadow-2xl shadow-black/20 sm:p-7">
      <div aria-hidden="true" className="vf-motion-ambient pointer-events-none absolute -right-12 top-24 h-80 w-80 rounded-full bg-lime/10 blur-[95px]"/>
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-[0.10]" style={{backgroundImage:'linear-gradient(rgba(184,240,107,.18) 1px,transparent 1px),linear-gradient(90deg,rgba(184,240,107,.18) 1px,transparent 1px)',backgroundSize:'36px 36px'}}/>
      <div className="relative z-10 flex flex-wrap items-start justify-between gap-2 border-b border-ivory/15 pb-4">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.17em] text-lime">{zh?'网站升级 / 买家体验':'BUYER EXPERIENCE / BEFORE & AFTER'}</p>
          <p className="mt-1 text-sm text-ivory/80">{zh?'产品更好找 · 网站更好懂 · 询盘更容易':'Clearer websites × buyer-action signals'}</p>
        </div>
        <span className="rounded-full border border-ivory/20 px-2 py-1 text-[10px] text-ivory/60">{zh?'体验对比':'BEFORE / AFTER'}</span>
      </div>

      <div data-testid="hero-hybrid-visual" role="img" aria-label={zh?'工业B2B网站的页面体验对比：由产品信息、采购评估、在线询盘到持续优化的四个环节。':'Industrial B2B website experience comparison across product discovery, buyer evaluation, inquiries and ongoing improvement.'} className="relative z-10 mx-auto mt-3 h-[340px] max-w-[560px] sm:h-[375px]">
        <svg aria-hidden="true" viewBox="0 0 560 370" preserveAspectRatio="xMidYMid meet" className="pointer-events-none absolute inset-0 h-full w-full">
          <defs>
            <linearGradient id="vf-hybrid-path" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#b8f06b" stopOpacity=".10"/><stop offset=".55" stopColor="#b8f06b" stopOpacity=".88"/><stop offset="1" stopColor="#b8f06b" stopOpacity=".10"/></linearGradient>
            <radialGradient id="vf-hybrid-ambient"><stop offset="0" stopColor="#b8f06b" stopOpacity=".20"/><stop offset="1" stopColor="#b8f06b" stopOpacity="0"/></radialGradient>
          </defs>
          <ellipse cx="285" cy="185" rx="230" ry="150" fill="url(#vf-hybrid-ambient)"/>
          <ellipse className="vf-motion-orbit-ring" cx="286" cy="184" rx="243" ry="116" fill="none" stroke="url(#vf-hybrid-path)" strokeWidth="1.5" strokeDasharray="4 7" transform="rotate(-13 286 184)"/>
          <path d="M45 113 Q210 39 511 128" fill="none" stroke="url(#vf-hybrid-path)" strokeWidth="1.6"/>
          <path className="vf-motion-orbit-pulse" d="M45 113 Q210 39 511 128" fill="none" stroke="#b8f06b" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="7 480" opacity=".5"/>
          <path d="M48 253 Q285 344 513 246" fill="none" stroke="url(#vf-hybrid-path)" strokeWidth="1.6"/>
          <path className="vf-motion-orbit-pulse vf-motion-orbit-reverse" d="M48 253 Q285 344 513 246" fill="none" stroke="#b8f06b" strokeWidth="2" strokeLinecap="round" strokeDasharray="7 480" opacity=".45"/>
          <circle cx="83" cy="110" r="4" fill="#b8f06b"/><circle cx="484" cy="120" r="4" fill="#b8f06b"/>
          <circle cx="85" cy="270" r="4" fill="#b8f06b"/><circle cx="480" cy="265" r="4" fill="#b8f06b"/>
        </svg>

        {[
          {icon:Search,zh:'搜索发现',en:'Discover',pos:'left-0 top-0',motion:'vf-motion-node-1'},
          {icon:ScanSearch,zh:'买家评估',en:'Evaluate',pos:'right-0 top-0',motion:'vf-motion-node-2'},
          {icon:Send,zh:'产品询盘',en:'Inquire',pos:'bottom-0 left-0',motion:'vf-motion-node-3'},
          {icon:ChartNoAxesCombined,zh:'持续改善',en:'Improve',pos:'bottom-0 right-0',motion:'vf-motion-node-4'},
        ].map(({icon:Icon,zh:cn,en,pos,motion})=><div key={pos} data-testid="hero-hybrid-signal" className={'vf-motion-node '+motion+' absolute z-30 flex min-h-11 w-[45%] items-center gap-2 rounded-lg border border-lime/35 bg-[#10262c]/95 px-3 py-2 shadow-lg shadow-black/20 '+pos}>
          <Icon className="size-4 shrink-0 text-lime sm:size-5" aria-hidden="true"/>
          <span className="text-xs font-semibold sm:text-sm">{zh?cn:en}</span>
        </div>)}

        <span className="absolute left-[5%] top-[26%] z-20 rounded-full bg-ivory/25 px-2.5 py-1 text-[10px] font-semibold">{zh?'之前':'Before'}</span>
        <div data-testid="hero-site-before" className="vf-motion-before absolute left-[3%] top-[35%] z-10 w-[47%] -rotate-[4deg] overflow-hidden rounded-lg border border-ivory/25 bg-[#d0dada] shadow-2xl shadow-black/30">
          <div className="flex h-5 items-center gap-1 bg-[#9daeb0] px-2"><i className="size-1 rounded-full bg-[#597276]"/><i className="size-1 rounded-full bg-[#597276]"/><i className="size-1 rounded-full bg-[#597276]"/><i className="ml-2 h-1 w-[35%] rounded bg-[#70878a]"/></div>
          <div className="space-y-2 p-3">
            <div className="h-2 w-2/3 rounded bg-[#899b9d]"/>
            <div className="flex gap-2">
              <div className="flex aspect-square w-[42%] items-center justify-center rounded bg-[#b1c0c1]">
                <svg viewBox="0 0 70 60" className="size-full" aria-hidden="true"><rect x="12" y="19" width="45" height="22" rx="4" fill="#7c9194"/><circle cx="33" cy="29" r="13" fill="#d3dddd"/><circle cx="33" cy="29" r="6" fill="#809699"/></svg>
              </div>
              <div className="flex flex-1 flex-col gap-1.5 pt-1"><i className="h-1.5 w-full rounded bg-[#a1b0b1]"/><i className="h-1.5 w-4/5 rounded bg-[#b0bfc0]"/><i className="h-1.5 w-full rounded bg-[#b0bfc0]"/><i className="h-1.5 w-2/3 rounded bg-[#b0bfc0]"/></div>
            </div>
            <div className="flex gap-1.5"><i className="h-5 flex-1 rounded bg-[#b6c4c4]"/><i className="h-5 flex-1 rounded bg-[#b6c4c4]"/><i className="h-5 flex-1 rounded bg-[#b6c4c4]"/></div>
          </div>
        </div>

        <svg data-testid="hero-upgrade-arrow" aria-hidden="true" viewBox="0 0 100 55" className="vf-motion-upgrade-arrow pointer-events-none absolute left-[10%] top-[46%] z-30 h-7 w-[11%] overflow-visible drop-shadow-[0_0_5px_rgba(184,240,107,.45)] sm:left-[10%] sm:top-[47%] sm:h-8 sm:w-[11%]"><path d="M5 46 Q43 2 89 18" fill="none" stroke="#b8f06b" strokeWidth="3.2" strokeLinecap="round"/><path d="M73 8 L92 18 L81 34" fill="none" stroke="#b8f06b" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round"/></svg>

        <span className="absolute right-[4%] top-[25%] z-30 rounded-full bg-lime px-3 py-1 text-[10px] font-bold text-ink shadow-[0_0_18px_rgba(184,240,107,.25)]">{zh?'之后':'After'}</span>
        <div data-testid="hero-site-after" className="vf-motion-after absolute right-[2%] top-[32%] z-20 w-[67%] rotate-[1.4deg] overflow-hidden rounded-xl border border-lime/75 bg-ivory shadow-[0_0_34px_rgba(184,240,107,.20),0_16px_35px_rgba(0,0,0,.35)]">
          <div className="flex h-6 items-center justify-between bg-[#0d2127] px-2.5">
            <span className="font-mono text-[7px] font-semibold tracking-wider text-ivory">INDUSTRIAL / B2B</span>
            <div className="flex gap-1"><i className="h-1 w-3 rounded bg-ivory/30"/><i className="h-1 w-3 rounded bg-ivory/30"/><i className="h-1 w-3 rounded bg-lime"/></div>
          </div>
          <div className="relative grid min-h-[98px] grid-cols-[1.2fr_.8fr] overflow-hidden bg-gradient-to-br from-[#25434b] to-[#10252b] p-3 sm:min-h-[125px] sm:p-4">
            <div className="relative z-10 flex flex-col items-start justify-center gap-2">
              <p className="text-[7px] uppercase tracking-wider text-lime sm:text-[9px]">{zh?'产品与应用':'PRODUCT / APPLICATION'}</p>
              <p className="text-balance text-[12px] font-semibold leading-tight sm:text-[16px]">{zh?'精密工业零部件':'Precision Components'}</p>
              <span className="rounded-sm bg-lime px-2 py-1 text-[7px] font-semibold text-ink sm:text-[9px]">{zh?'规格与询盘':'Specs & inquiry'}</span>
            </div>
            <svg viewBox="0 0 140 105" className="absolute -right-2 bottom-0 h-full w-[51%]" aria-hidden="true">
              <defs><linearGradient id="vf-hybrid-metal" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#e3edec"/><stop offset=".5" stopColor="#9bb4bb"/><stop offset="1" stopColor="#42616c"/></linearGradient></defs>
              <ellipse cx="80" cy="91" rx="48" ry="9" fill="#091c23" opacity=".35"/>
              <rect x="45" y="31" width="73" height="49" rx="14" fill="url(#vf-hybrid-metal)" stroke="#d1dddb" strokeWidth="2" transform="rotate(-10 80 55)"/>
              <ellipse cx="57" cy="53" rx="28" ry="30" fill="#9eb9bd" stroke="#dbe8e6" strokeWidth="3"/>
              <ellipse cx="57" cy="53" rx="19" ry="21" fill="#567a82" stroke="#d5e1df" strokeWidth="3"/>
              <ellipse cx="57" cy="53" rx="10" ry="12" fill="#142d36" stroke="#9db8bd" strokeWidth="3"/>
              <rect x="103" y="29" width="17" height="54" rx="4" fill="url(#vf-hybrid-metal)" stroke="#b9c9c9"/>
            </svg>
          </div>
          <div className="grid grid-cols-3 gap-1.5 bg-[#e7eeeb] p-2">{[
            zh?'产品':'Products',zh?'规格':'Specs',zh?'询盘':'Inquire'
          ].map((label,i)=><div key={i} className="flex min-h-7 flex-col items-center justify-center gap-1 rounded border border-[#cad8d1] bg-[#f7faf6] px-1 py-1"><span className="h-1 w-6 rounded bg-[#9db7b0]"/><span className="text-[7px] font-semibold text-[#35514a]">{label}</span></div>)}</div>
        </div>
      </div>
      <div className="relative z-10 flex flex-col gap-2 border-t border-ivory/15 pt-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs leading-relaxed text-ivory/60">{zh?'围绕海外采购路径，优化产品展示、关键信息和询盘入口。':'Make product details clearer and the next buyer action easier to find.'}</p>
        <Link href="/pricing" className="inline-flex min-h-10 shrink-0 items-center gap-2 text-sm font-semibold text-lime underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-lime">{zh?'查看三档服务与价格':'Explore plans and pricing'} <ArrowUpRight aria-hidden="true" className="size-4"/></Link>
      </div>
    </div>
   </div>
 </section>
}
