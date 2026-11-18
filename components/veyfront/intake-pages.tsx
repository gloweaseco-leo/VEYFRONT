'use client'
import { useEffect, useState } from 'react'
import Link from '@/components/l2m/localized-link'
import { PageShell } from '@/components/site/page-shell'
import { LeadForm, type Service } from '@/components/veyfront/lead-form'
import { useLang } from '@/lib/i18n'
import { WecomContactCard } from '@/components/veyfront/wecom-contact'
import { wecomQrPath } from '@/lib/wecom-config'
import publicOffers from '@/lib/public-offers.json'
import { DiagnosisEntry } from '@/components/veyfront/diagnosis/entry'

export function IntakePage({ service, showDiagnosis = false, previewOnly = false }: {
  service: Service
  showDiagnosis?: boolean
  previewOnly?: boolean
}) {
  const { lang } = useLang()
  const zh = lang === 'zh'
  const isRebuild = service === 'rebuild'
  const isPrivacy = service === 'privacy'
  const titles = {
    launch: zh ? '咨询新建外贸官网' : 'Launch your next B2B website',
    rebuild: zh ? '咨询现有网站升级' : 'Rebuild your existing website',
    general: zh ? '联系 VEYFRONT' : 'Contact VEYFRONT',
    privacy: zh ? '个人信息与隐私请求' : 'Privacy and data requests',
  }
  return <PageShell>
    <section className="bg-ink text-ivory">
      <div className="mx-auto max-w-[1200px] px-4 py-9 sm:px-5 sm:py-14 md:px-10 lg:py-20">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-lime">{zh ? (service === 'launch' ? '新建外贸官网咨询' : service === 'rebuild' ? '现有网站升级咨询' : service === 'privacy' ? '个人信息申请' : '联系 VEYFRONT') : 'VEYFRONT / ' + service.toUpperCase()}</p>
        <h1 className="mt-5 max-w-4xl text-balance text-[30px] font-semibold leading-[1.25] sm:text-6xl">{titles[service]}</h1>
        <p className="mt-5 max-w-2xl text-base leading-relaxed text-ivory/75">{isPrivacy ? (zh ? '如需查阅、更正或删除此前提交的联系信息，请填写下面的申请。我们将在核实后按适用规定处理。' : 'Request access, correction or deletion of information you shared with us. We verify requests before handling them.') : (zh ? '告诉我们您做什么产品、面向哪些国家，以及希望网站有哪些功能。正式建设前会确认服务清单与报价，提交咨询不收费。' : 'Tell us what your business needs. We confirm the complete site scope and price upfront; no unexpected charges without your approval.')}</p>
      </div>
    </section>
    <section className="mx-auto grid max-w-[1200px] gap-7 px-4 py-10 sm:px-5 sm:py-14 md:px-10 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,0.6fr)] lg:py-20">
      <div>
        {!isPrivacy && zh && <p className="mb-6 rounded-lg border border-ink/15 bg-mist/40 p-4 text-sm leading-relaxed">
          想先聊聊？<Link href={wecomQrPath() ? '/contact#wechat' : '/contact'} className="ml-2 font-semibold underline underline-offset-4">{wecomQrPath() ? '微信咨询' : '联系 VEYFRONT'}</Link>。
          不必先填写表单。
        </p>}
        <div id={isRebuild ? 'rebuild-inquiry' : undefined} className={isRebuild ? 'scroll-mt-5' : undefined}>
          <LeadForm service={service} previewOnly={previewOnly}/>
        </div>
      </div>
      <aside className="h-fit rounded-lg border border-ink/15 bg-mist/40 p-6">
        <p className="font-mono text-xs uppercase tracking-widest text-ink/60">{isPrivacy ? (zh ? '个人信息处理说明' : 'Privacy request information') : (zh ? '下一步怎么做' : 'Your next steps')}</p>
        <h2 className="mt-3 text-xl font-semibold">{isPrivacy ? (zh ? '我们先核实申请，再处理请求。' : 'We verify before handling requests.') : (zh ? '先了解需求，再确认建设方案与价格。' : 'Agree on the full scope before work begins.')}</h2>
        <p className="mt-4 text-sm leading-relaxed text-ink/75">{isPrivacy ? (zh ? '请使用此前咨询时的联系邮箱，说明希望查阅、更正或删除的信息。不要提交密码、机密合同或身份证件。' : 'Use the email linked to your earlier inquiry. Explain what you want to access, correct or delete, without sending credentials or identity documents.') : (zh ? '我们会核对您的业务目标与现有资料，在开工前书面确认交付清单和报价。' : 'We review your business goals and source materials, then agree a complete written scope and price with you before any work or payment.')}</p>
        {isRebuild && <p className="mt-3 text-sm text-ink/75">{zh ? '旧网站继续正常运行，不会因为提交需求而被更改。' : 'Your existing website is not modified when you inquire.'}</p>}
        <p className="mt-5 text-sm text-ink/75">{isPrivacy ? (zh ? '也可邮件申请：' : 'Or email your request: ') : (zh ? '也可以通过邮件联系：' : 'Prefer email? ')}<a href="mailto:hello@veyfront.com" className="font-semibold underline underline-offset-4">hello@veyfront.com</a></p>
        {isRebuild && showDiagnosis && <div className="mt-4"><DiagnosisEntry /></div>}
        {!isPrivacy && <Link href="/pricing" className="mt-4 inline-block font-semibold underline underline-offset-4">{zh ? '查看完整服务与价格' : 'Review full scope and pricing'}</Link>}
      </aside>
    </section>
  </PageShell>
}

export function ContactPage({ previewOnly = false }: { previewOnly?: boolean }) {
  const { lang } = useLang()
  const zh = lang === 'zh'
  const [selectedPlan, setSelectedPlan] = useState<'start' | 'sales' | 'growth' | null>(null)
  useEffect(() => {
    const candidate = new URLSearchParams(window.location.search).get('plan')
    if (candidate === 'start' || candidate === 'sales' || candidate === 'growth') setSelectedPlan(candidate)
  }, [])
  const planName = selectedPlan === 'start' ? (zh ? publicOffers.plans.start.titleZh + '版' : 'Professional Start')
    : selectedPlan === 'sales' ? (zh ? publicOffers.plans.sales.titleZh + '版' : 'Sales Expansion')
    : selectedPlan === 'growth' ? (zh ? publicOffers.plans.growth.titleZh + '版' : 'Growth Navigator') : ''
  const prefill = selectedPlan
    ? (zh ? '我想咨询 VEYFRONT ' + planName + '。请联系我确认项目范围、交付权益和正式报价。'
        : 'I would like to discuss the VEYFRONT ' + planName + ' package. Please confirm the project scope and a written quotation.')
    : ''
  return <PageShell>
    <section className="bg-ink text-ivory">
      <div className="mx-auto max-w-[1200px] px-4 py-9 sm:px-5 sm:py-14 md:px-10 lg:py-20">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-lime">{zh ? '联系 VEYFRONT' : 'VEYFRONT / CONTACT'}</p>
        <h1 className="mt-5 max-w-4xl text-balance text-[30px] font-semibold leading-[1.25] sm:text-6xl">{zh ? '想建外贸官网或升级旧站？欢迎聊聊' : 'Start a conversation.'}</h1>
        <p className="mt-3 max-w-2xl text-[15px] leading-[1.75] text-ivory/80 sm:mt-5 sm:text-base">{zh ? '可以先通过微信咨询，也可以直接填写需求。告诉我们您的主营产品和目标市场，我们一起确认适合的服务与报价。' : 'Choose a project path or send a general inquiry. A reference is returned only when your request has been saved.'}</p>
      </div>
    </section>
    <div className="mx-auto max-w-[1200px] px-4 pt-7 sm:px-5 sm:pt-10 md:px-10">
      <nav aria-label={zh ? '项目类型' : 'Project type'} className="flex flex-wrap gap-3">
        <Link href="/start/launch" className="inline-flex min-h-11 items-center rounded-md border border-ink/20 px-5 text-sm font-semibold hover:bg-mist/40">{zh ? '新建外贸官网' : 'Launch a site'}</Link>
        <Link href="/start/rebuild" className="inline-flex min-h-11 items-center rounded-md border border-ink/20 px-5 text-sm font-semibold hover:bg-mist/40">{zh ? '升级现有网站' : 'Rebuild a site'}</Link>
      </nav>
    </div>
    <section className="mx-auto grid max-w-[1200px] items-start gap-6 px-4 py-8 sm:px-5 sm:py-10 md:px-10 lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)] lg:gap-12 lg:py-16">
      {zh && <WecomContactCard placement="contact"/>}
      <div id="project-form" className="scroll-mt-24 rounded-xl border border-ink/15 bg-white p-4 sm:bg-ivory sm:p-5">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-ink/60">{zh ? '网站项目需求' : 'PROJECT INQUIRY'}</p>
        <h2 className="mt-3 text-2xl font-semibold">{zh ? '提交项目需求' : 'Tell us about your project'}</h2>
        <p className="mb-7 mt-3 max-w-lg text-sm leading-relaxed text-ink/70">{zh ? '您可以简单介绍主营产品、目标国家和希望网站解决的问题。至少留下一种联系方式，方便我们沟通方案与报价。' : 'Share your business goals and receive a reference after successful storage. You do not need to pay to inquire.'}</p>
        {selectedPlan && <p className="mb-5 rounded-lg border border-ink/20 bg-mist/45 p-4 text-sm leading-relaxed">
          {zh ? '咨询方案：' : 'Selected plan: '}<strong>{planName}</strong>{zh ? '。' : '.'}
          {zh ? '您可以在下方补充或修改需求。' : ' We have prefilled the plan name in your request. You can edit it.'}
        </p>}
        <LeadForm service="general" defaultDetails={prefill} previewOnly={previewOnly}/>
      </div>
    </section>
    <section className="border-t border-ink/10 bg-mist/25">
      <div className="mx-auto max-w-[1200px] px-4 py-7 text-sm text-ink/70 sm:px-5 md:px-10">
        {zh ? '需要发送正式资料或报价文件？商务邮箱：' : 'Prefer a formal email? '}
        <a href="mailto:hello@veyfront.com" className="font-semibold text-ink underline underline-offset-4">hello@veyfront.com</a>
      </div>
    </section>
  </PageShell>
}
