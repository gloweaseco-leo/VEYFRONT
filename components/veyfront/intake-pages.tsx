'use client'
import Link from 'next/link'
import { PageShell } from '@/components/site/page-shell'
import { LeadForm, type Service } from '@/components/veyfront/lead-form'
import { useLang } from '@/lib/i18n'

export function IntakePage({ service }: { service: Service }) {
  const { lang } = useLang()
  const zh = lang === 'zh'
  const isRebuild = service === 'rebuild'
  const titles = {
    launch: zh ? '建立面向全球客户的新网站' : 'Launch your next B2B website',
    rebuild: zh ? '升级现有网站的客户体验' : 'Rebuild your existing website',
    general: zh ? '联系 VEYFRONT' : 'Contact VEYFRONT',
    privacy: zh ? '个人信息与数据请求' : 'Privacy and data requests',
  }
  return <PageShell>
    <section className="bg-ink text-ivory">
      <div className="mx-auto max-w-[1200px] px-5 py-14 md:px-10 lg:py-20">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-lime">VEYFRONT / {service.toUpperCase()}</p>
        <h1 className="mt-5 max-w-4xl text-balance text-4xl font-semibold leading-tight sm:text-6xl">{titles[service]}</h1>
        <p className="mt-5 max-w-2xl text-base leading-relaxed text-ivory/75">{zh ? '告诉我们你的业务与目标。我们先确认标准建设范围，提供一次完整报价；未经你同意，不增加收费。' : 'Tell us what your business needs. We confirm the complete site scope and price upfront; no unexpected charges without your approval.'}</p>
      </div>
    </section>
    <section className="mx-auto grid max-w-[1200px] gap-10 px-5 py-14 md:px-10 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,0.6fr)] lg:py-20">
      <div><LeadForm service={service}/></div>
      <aside className="h-fit rounded-lg border border-ink/15 bg-mist/40 p-6">
        <p className="font-mono text-xs uppercase tracking-widest text-ink/60">{zh ? '项目如何开始' : 'Your next steps'}</p>
        <h2 className="mt-3 text-xl font-semibold">{zh ? '先了解业务，再确认完整交付范围。' : 'Agree on the full scope before work begins.'}</h2>
        <p className="mt-4 text-sm leading-relaxed text-ink/75">{zh ? '提交后我们会了解你的项目，核对资料，并与你确认完整建设内容与书面报价；不会因为咨询而收费。' : 'We review your business goals and source materials, then agree a complete written scope and price with you before any work or payment.'}</p>
        {isRebuild && <p className="mt-3 text-sm text-ink/75">{zh ? '旧网站继续正常运行，不会因为提交需求而被更改。' : 'Your existing website is not modified when you inquire.'}</p>}
        <p className="mt-5 text-sm text-ink/75">{zh ? '也可以发送邮件：' : 'Prefer email? '}<a href="mailto:hello@veyfront.com" className="font-semibold underline underline-offset-4">hello@veyfront.com</a></p>
        <Link href="/pricing" className="mt-4 inline-block font-semibold underline underline-offset-4">{zh ? '查看完整服务与价格' : 'Review full scope and pricing'}</Link>
      </aside>
    </section>
  </PageShell>
}

export function ContactPage() {
 const { lang } = useLang()
 const zh = lang==='zh'
 return <PageShell>
   <section className="bg-ink text-ivory"><div className="mx-auto max-w-[1200px] px-5 py-16 md:px-10">
     <p className="font-mono text-xs uppercase tracking-[0.2em] text-lime">VEYFRONT / CONTACT</p>
     <h1 className="mt-5 text-4xl font-semibold sm:text-6xl">{zh ? '开始沟通。' : 'Start a conversation.'}</h1>
     <p className="mt-5 max-w-xl text-ivory/75">{zh ? '选择新建站、旧站改造或一般业务咨询。所有表单只在保存成功后返回受理编号。' : 'Choose a project path or send a general inquiry. A reference is returned only once your request is saved.'}</p>
   </div></section>
   <section className="mx-auto max-w-[1200px] px-5 py-14 md:px-10 lg:py-20">
     <div className="mb-9 flex flex-wrap gap-3">
       <Link href="/start/launch" className="inline-flex min-h-12 items-center rounded-md bg-ink px-5 font-semibold text-ivory">Launch</Link>
       <Link href="/start/rebuild" className="inline-flex min-h-12 items-center rounded-md border border-ink/25 px-5 font-semibold">Rebuild</Link>
     </div>
     <div className="max-w-2xl"><p className="mb-6 text-sm leading-relaxed text-ink/75">{zh ? '也可直接邮件联系：' : 'Or email us directly: '}<a className="font-semibold underline underline-offset-4" href="mailto:hello@veyfront.com">hello@veyfront.com</a></p><LeadForm service="general"/></div>
   </section>
 </PageShell>
}
