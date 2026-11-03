'use client'
import Link from '@/components/l2m/localized-link'
import { PageShell } from '@/components/site/page-shell'
import { LeadForm, type Service } from '@/components/veyfront/lead-form'
import { useLang } from '@/lib/i18n'

export function IntakePage({ service }: { service: Service }) {
  const { lang } = useLang()
  const zh = lang === 'zh'
  const isRebuild = service === 'rebuild'
  const isPrivacy = service === 'privacy'
  const titles = {
    launch: zh ? '建立面向全球客户的新网站' : 'Launch your next B2B website',
    rebuild: zh ? '升级现有网站的客户体验' : 'Rebuild your existing website',
    general: zh ? '联系 VEYFRONT' : 'Contact VEYFRONT',
    privacy: zh ? '个人信息与隐私请求' : 'Privacy and data requests',
  }
  return <PageShell>
    <section className="bg-ink text-ivory">
      <div className="mx-auto max-w-[1200px] px-5 py-14 md:px-10 lg:py-20">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-lime">VEYFRONT / {service.toUpperCase()}</p>
        <h1 className="mt-5 max-w-4xl text-balance text-4xl font-semibold leading-tight sm:text-6xl">{titles[service]}</h1>
        <p className="mt-5 max-w-2xl text-base leading-relaxed text-ivory/75">{isPrivacy ? (zh ? '如需查阅、更正或删除此前提交的联系信息，请填写下面的申请。我们将在核实后按适用规定处理。' : 'Request access, correction or deletion of information you shared with us. We verify requests before handling them.') : (zh ? '告诉我们您的主营产品、目标市场和网站需求。建设前书面确认交付范围和总价，提交咨询无需付款。' : 'Tell us what your business needs. We confirm the complete site scope and price upfront; no unexpected charges without your approval.')}</p>
      </div>
    </section>
    <section className="mx-auto grid max-w-[1200px] gap-10 px-5 py-14 md:px-10 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,0.6fr)] lg:py-20">
      <div><LeadForm service={service}/></div>
      <aside className="h-fit rounded-lg border border-ink/15 bg-mist/40 p-6">
        <p className="font-mono text-xs uppercase tracking-widest text-ink/60">{isPrivacy ? (zh ? '个人信息处理说明' : 'Privacy request information') : (zh ? '下一步怎么做' : 'Your next steps')}</p>
        <h2 className="mt-3 text-xl font-semibold">{isPrivacy ? (zh ? '我们先核实申请，再处理请求。' : 'We verify before handling requests.') : (zh ? '先了解需求，再确认建设方案与价格。' : 'Agree on the full scope before work begins.')}</h2>
        <p className="mt-4 text-sm leading-relaxed text-ink/75">{isPrivacy ? (zh ? '请使用此前咨询时的联系邮箱，说明希望查阅、更正或删除的信息。不要提交密码、机密合同或身份证件。' : 'Use the email linked to your earlier inquiry. Explain what you want to access, correct or delete, without sending credentials or identity documents.') : (zh ? '我们会核对您的业务目标与现有资料，在开工前书面确认交付清单和报价。' : 'We review your business goals and source materials, then agree a complete written scope and price with you before any work or payment.')}</p>
        {isRebuild && <p className="mt-3 text-sm text-ink/75">{zh ? '旧网站继续正常运行，不会因为提交需求而被更改。' : 'Your existing website is not modified when you inquire.'}</p>}
        <p className="mt-5 text-sm text-ink/75">{isPrivacy ? (zh ? '也可邮件申请：' : 'Or email your request: ') : (zh ? '也可以通过邮件联系：' : 'Prefer email? ')}<a href="mailto:hello@veyfront.com" className="font-semibold underline underline-offset-4">hello@veyfront.com</a></p>
        {!isPrivacy && <Link href="/pricing" className="mt-4 inline-block font-semibold underline underline-offset-4">{zh ? '查看完整服务与价格' : 'Review full scope and pricing'}</Link>}
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
     <h1 className="mt-5 text-4xl font-semibold sm:text-6xl">{zh ? '告诉我们您的建站需求' : 'Start a conversation.'}</h1>
     <p className="mt-5 max-w-xl text-ivory/75">{zh ? '选择新建网站或旧站升级，也可以直接介绍您的项目。我们会根据需求与您确认服务范围和报价。' : 'Choose a project path or send a general inquiry. A reference is returned only once your request is saved.'}</p>
   </div></section>
   <section className="mx-auto max-w-[1200px] px-5 py-14 md:px-10 lg:py-20">
     <div className="mb-9 flex flex-wrap gap-3">
       <Link href="/start/launch" className="inline-flex min-h-12 items-center rounded-md bg-ink px-5 font-semibold text-ivory">{zh ? '新建网站' : 'Launch'}</Link>
       <Link href="/start/rebuild" className="inline-flex min-h-12 items-center rounded-md border border-ink/25 px-5 font-semibold">{zh ? '升级现有网站' : 'Rebuild'}</Link>
     </div>
     <div className="max-w-2xl"><p className="mb-6 text-sm leading-relaxed text-ink/75">{zh ? '也可直接邮件联系：' : 'Or email us directly: '}<a className="font-semibold underline underline-offset-4" href="mailto:hello@veyfront.com">hello@veyfront.com</a></p><LeadForm service="general"/></div>
   </section>
 </PageShell>
}
