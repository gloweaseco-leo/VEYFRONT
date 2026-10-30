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
        <p className="mt-5 max-w-2xl text-base leading-relaxed text-ivory/75">{zh ? '告诉我们你的企业、目标和现状。通过安全表单保存需求；项目范围、报价和交付方式会在后续沟通中另行确认。' : 'Tell us about your business, goals and current situation. Your request is saved securely; scope, pricing and delivery are confirmed separately.'}</p>
      </div>
    </section>
    <section className="mx-auto grid max-w-[1200px] gap-10 px-5 py-14 md:px-10 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,0.6fr)] lg:py-20">
      <div><LeadForm service={service}/></div>
      <aside className="h-fit rounded-lg border border-ink/15 bg-mist/40 p-6">
        <p className="font-mono text-xs uppercase tracking-widest text-ink/60">{zh ? '受理说明' : 'How it works'}</p>
        <h2 className="mt-3 text-xl font-semibold">{zh ? '先了解业务，再确认范围。' : 'Business first. Scope before commitment.'}</h2>
        <p className="mt-4 text-sm leading-relaxed text-ink/75">{zh ? '这是可以真实提交的业务联系入口。我们不会把表单当作自动诊断、在线订单、已确认报价或付款。' : 'This is a live inquiry channel — not an automatic diagnosis, online order, accepted quote or payment.'}</p>
        {isRebuild && <p className="mt-3 text-sm text-ink/75">{zh ? '旧网站继续正常运行，不会因为提交需求而被更改。' : 'Your existing website is not modified when you inquire.'}</p>}
        <Link href="/services" className="mt-7 inline-block font-semibold underline underline-offset-4">{zh ? '查看服务范围' : 'Review services'}</Link>
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
     <div className="max-w-2xl"><LeadForm service="general"/></div>
   </section>
 </PageShell>
}
