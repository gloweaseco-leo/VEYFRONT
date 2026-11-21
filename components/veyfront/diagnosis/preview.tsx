'use client'

import { useRef, useState, type FormEvent } from 'react'
import { ArrowRight, CircleHelp, Info } from 'lucide-react'
import Link from '@/components/l2m/localized-link'
import { PageShell } from '@/components/site/page-shell'
import { useLang } from '@/lib/i18n'
import { diagnosisAddressStatus } from '@/lib/diagnosis-presentation'
import { diagnosisReportPath } from '@/lib/diagnosis-preview'
import { previewStates, stateCopy, type PreviewState } from './copy'
import { exampleReport } from './example'
import { DiagnosisReport } from './report'
import { OfflineG1Form } from './offline-g1-form'
import { ConnectedPreviewForm } from './connected-preview-form'

const sectionWidth = 'mx-auto max-w-[1200px] px-4 sm:px-5 md:px-10'
const primary = 'inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-lime px-4 py-2 text-sm font-semibold text-ink hover:bg-lime/80 focus-visible:outline-2 focus-visible:outline-offset-2'
const secondary = 'inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-ink/25 px-4 py-2 text-sm font-semibold text-ink hover:bg-mist/40 focus-visible:outline-2 focus-visible:outline-offset-2'
const textLink = 'font-semibold underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2'

function AddressPreview() {
  const { lang } = useLang()
  const zh = lang === 'zh'
  const addressInput = useRef<HTMLInputElement>(null)
  const permission = useRef<HTMLInputElement>(null)
  const [feedback, setFeedback] = useState<'empty' | 'invalid' | 'unavailable' | 'permission' | 'closed' | null>(null)
  const addressError = feedback === 'empty' || feedback === 'invalid' || feedback === 'unavailable'
  const message = {
    empty: zh ? '请输入对外公开的网站网址。' : 'Enter your public website address.',
    invalid: zh ? '请检查网址格式。例如 https://your-company.com。' : 'Check the address format, for example https://your-company.com.',
    unavailable: zh ? '请使用公开网站的网址，去掉登录信息、端口或链接参数。内网和 IP 地址暂不支持。' : 'Use a public website address without login details, a port or link parameters. Private networks and IP addresses are unsupported.',
    permission: zh ? '请先确认您有权提出这项预诊断申请。' : 'Confirm that you are authorised to request this check.',
    closed: zh ? '网址格式有效。正式诊断尚未开放，本次没有访问网站或创建任务。' : 'The address format is valid. Live checks are not open, so no visit or task was created.',
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const result = diagnosisAddressStatus(addressInput.current?.value ?? '')
    if (result !== 'valid') {
      setFeedback(result)
      addressInput.current?.focus()
      return
    }
    if (!permission.current?.checked) {
      setFeedback('permission')
      permission.current?.focus()
      return
    }
    setFeedback('closed')
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-4" data-testid="diagnosis-address-form">
      <div>
        <label htmlFor="diagnosis-address" className="mb-2 block text-sm font-semibold">{zh ? '现有外贸网站网址' : 'Current B2B website address'}</label>
        <input
          ref={addressInput}
          id="diagnosis-address"
          type="text"
          inputMode="url"
          autoComplete="off"
          autoCapitalize="none"
          spellCheck={false}
          maxLength={500}
          placeholder="https://your-company.com"
          aria-invalid={addressError || undefined}
          aria-describedby={addressError ? 'diagnosis-feedback' : 'diagnosis-input-note'}
          className="min-h-12 w-full rounded-md border border-ink/30 bg-white px-3 text-base text-ink placeholder:text-ink/55 focus-visible:outline-2 focus-visible:outline-offset-2"
          onChange={() => setFeedback(null)}
        />
        <p id="diagnosis-input-note" className="mt-2 text-sm text-ink/70">{zh ? '填写公开网址，无需留下联系方式。' : 'Use a public URL. Contact details are optional and separate.'}</p>
      </div>
      <label htmlFor="diagnosis-permission" className="flex min-h-11 items-start gap-3 text-sm leading-relaxed">
        <input ref={permission} type="checkbox" id="diagnosis-permission"
          aria-invalid={feedback === 'permission' || undefined}
          aria-describedby={feedback === 'permission' ? 'diagnosis-permission-note diagnosis-feedback' : 'diagnosis-permission-note'}
          onChange={() => setFeedback(null)}
          className="mt-0.5 size-5 shrink-0 accent-ink focus-visible:outline-2 focus-visible:outline-offset-2" />
        {zh ? '我有权就该网站的公开页面提出预诊断申请。' : 'I am authorised to request a check of this website’s public pages.'}
      </label>
      <p id="diagnosis-permission-note" className="text-sm leading-relaxed text-ink/70">
        {zh ? '此确认用于演示申请流程。正式服务会另行核验访问授权，检查范围限于获准的公开页面。' : 'This confirmation shows how a request will work. The live service will verify permission separately and check only permitted public pages.'}
      </p>
      <button type="submit" className={secondary}>{zh ? '查看预诊断可用状态' : 'Check availability'}</button>
      <div id="diagnosis-feedback" role="status" aria-live="polite">
        {feedback && <p className={`rounded-md border px-3 py-2.5 text-sm leading-relaxed ${feedback === 'closed' ? 'border-ink/15 bg-mist/55 text-ink' : 'border-[#8b3026]/30 bg-[#fff3ef] text-[#78271d]'}`}>{message[feedback]}</p>}
      </div>
    </form>
  )
}

function Walkthrough({ connectedPreview }: { connectedPreview: boolean }) {
  const { lang } = useLang()
  const zh = lang === 'zh'
  const [state, setState] = useState<PreviewState | null>(null)
  const reportVisible = state === 'completed' || state === 'partial'
  const next = state === 'accepted' ? 'running' : state === 'running' ? 'completed' : null
  return (
    <section id="diagnosis-example" aria-labelledby="diagnosis-example-title" className="scroll-mt-5 border-t border-ink/10 bg-mist/25">
      <div className={sectionWidth + ' py-9 sm:py-14'}>
        <div className="max-w-3xl">
          <p className="text-sm font-semibold text-ink/75">{zh ? '示例' : 'Example'}</p>
          <h2 id="diagnosis-example-title" className="mt-2 text-2xl font-semibold sm:text-3xl">{zh ? '看看一份采购体验报告' : 'Explore a buyer experience report'}</h2>
          <p className="mt-2 text-sm leading-relaxed text-ink/75">
            {zh ? '以工业阀门网站为例，展示检查流程、报告和异常状态。报告使用独立的示例数据。' : 'Explore the check, report and unavailable states using a valve manufacturer as an example. The report uses its own sample data.'}
          </p>
        </div>
        <div className="mt-5 flex flex-wrap items-center gap-3">
          {connectedPreview ? <Link href={diagnosisReportPath + '?example=1'} className={primary} prefetch={false}>
            {zh ? '查看报告示例' : 'View sample report'}<ArrowRight className="size-4 shrink-0" aria-hidden="true" />
          </Link> : <button type="button" className={primary} onClick={() => setState('completed')} data-testid="diagnosis-open-report">
            {zh ? '查看报告示例' : 'View sample report'}<ArrowRight className="size-4 shrink-0" aria-hidden="true" />
          </button>}
          <button type="button" className={secondary} onClick={() => setState('accepted')} data-testid="diagnosis-start-example">
            {zh ? '从申请开始演示' : 'Walk through from request'}
          </button>
        </div>
        <div className="mt-5" aria-live="polite">
          {state && <div data-testid="diagnosis-task-state" data-state={state} className="rounded-lg border border-ink/15 bg-ivory p-4 sm:p-5">
            <p className="text-xs font-semibold text-ink/70">{zh ? '示例任务状态' : 'Sample task status'}</p>
            <h3 className="mt-1 text-lg font-semibold">{stateCopy[lang][state][0]}</h3>
            <p className="mt-1 text-sm leading-relaxed text-ink/75">{stateCopy[lang][state][1]}</p>
          </div>}
        </div>
        {state && <div className="mt-4 flex flex-wrap items-end gap-3">
          <div className="max-w-full">
            <label htmlFor="diagnosis-example-state" className="mb-1 block text-sm font-semibold">{zh ? '切换示例状态' : 'Choose a sample state'}</label>
            <select id="diagnosis-example-state" value={state} onChange={e => setState(e.target.value as PreviewState)}
              className="min-h-11 max-w-full rounded-md border border-ink/25 bg-white px-2 text-sm focus-visible:outline-2 focus-visible:outline-offset-2">
              {previewStates.map(v => <option key={v} value={v}>{stateCopy[lang][v][0]}</option>)}
            </select>
          </div>
          {next && <button type="button" className={secondary} data-testid="diagnosis-example-next" onClick={() => setState(next)}>
            {zh ? '演示下一步' : 'Continue example'}<ArrowRight className="size-4 shrink-0" aria-hidden="true" />
          </button>}
        </div>}
        {reportVisible && <DiagnosisReport report={exampleReport(lang, state === 'partial')} lang={lang} />}
      </div>
    </section>
  )
}

export function DiagnosisPreview({ offlineG1 = false, connectedPreview = false }: {
  offlineG1?: boolean; connectedPreview?: boolean
}) {
  const { lang } = useLang()
  const zh = lang === 'zh'
  const title = connectedPreview ? (zh ? '诊断您的外贸网站' : 'Check your B2B website')
    : offlineG1 ? (zh ? '本地 G1 离线联调' : 'Local G1 offline integration')
    : (zh ? '检查网址是否符合输入要求' : 'Check the website address')
  const scope = connectedPreview
    ? (zh ? '确认授权后，网址会交由诊断服务处理。您可以用当前会话或一次性恢复码查看任务。' : 'Once you confirm authorization, the service receives your website address. Use this session or a one-time recovery code to return to the task.')
    : offlineG1
      ? (zh ? '本地联调仅向隔离服务发送获准的合成测试申请。' : 'The local test sends approved synthetic requests to an isolated service.')
      : (zh ? '预览中的网址仅在当前页面验证格式，不提交、保存或访问。' : 'In preview, the address stays on this page for format validation. It is not submitted, stored or visited.')
  return (
    <PageShell>
      <section aria-labelledby="diagnosis-title" className="bg-ink text-ivory">
        <div className={sectionWidth + ' py-8 sm:py-12 lg:py-16'}>
          <p className="inline-flex items-center gap-2 text-sm font-semibold text-lime"><Info aria-hidden="true" className="size-4 shrink-0" />{connectedPreview ? (zh ? '自动诊断预览' : 'Automated diagnostic preview') : (zh ? '功能预览 · 自动诊断尚未开放' : 'Feature preview · Live checks are not open')}</p>
          <h1 id="diagnosis-title" className="mt-3 max-w-4xl text-balance text-[30px] font-semibold leading-tight sm:text-5xl">
            {zh ? '外贸独立站免费预诊断' : 'Free B2B website pre-diagnostic'}
          </h1>
          <p className="mt-4 max-w-3xl text-pretty text-base leading-relaxed text-ivory/80 sm:text-lg">
            {zh ? '从海外采购商的视角，看看旧站能否让买家找到产品、核对规格和企业资料，并顺利发起询价。' : 'See whether overseas buyers can find products, check specifications and company information, and request a quote.'}
          </p>
        </div>
      </section>

      <div className={sectionWidth + ' grid items-start gap-5 py-7 sm:py-10 lg:grid-cols-[minmax(0,1.22fr)_minmax(0,0.78fr)]'}>
        <section aria-labelledby="diagnosis-input-title" className="min-w-0 rounded-xl border border-ink/15 bg-white p-4 sm:p-6">
          <h2 id="diagnosis-input-title" className="mb-4 text-xl font-semibold">{title}</h2>
          {connectedPreview ? <ConnectedPreviewForm /> : offlineG1 ? <OfflineG1Form /> : <>
            <p data-testid="vrae-preview-pending" className="mb-4 rounded-md bg-mist/55 px-3 py-2 text-sm leading-relaxed text-ink/80">
              {zh ? '自动诊断暂未开放。当前可检查网址格式和查看报告示例。' : 'Automated diagnosis is currently closed. You can check address formatting and explore a sample report.'}
            </p>
            <AddressPreview />
          </>}
        </section>
        <aside aria-labelledby="diagnosis-scope-title" className="rounded-xl border border-ink/15 bg-mist/35 p-4 sm:p-6">
          <h2 id="diagnosis-scope-title" className="flex items-center gap-2 text-lg font-semibold"><CircleHelp className="size-5 shrink-0" aria-hidden="true" />{zh ? '能检查什么' : 'What the check covers'}</h2>
          <ul className="mt-3 list-outside list-disc space-y-2 pl-5 text-sm leading-relaxed text-ink/80">
            <li>{zh ? '正式开放后，预诊断仅检查获准的公开页面及其基本结构，不登录后台或修改网站。' : 'Once open, the check will cover permitted public pages and their basic structure, without signing in or changing the site.'}</li>
            <li>{scope}</li>
          </ul>
          <div className="mt-4 flex flex-wrap gap-x-3 gap-y-2 text-sm">
            <Link href="/privacy" className={textLink}>{zh ? '隐私政策' : 'Privacy policy'}</Link>
            <Link href="/terms" className={textLink}>{zh ? '服务条款' : 'Service terms'}</Link>
          </div>
        </aside>
      </div>

      <Walkthrough connectedPreview={connectedPreview} />

      <section aria-labelledby="diagnosis-contact-title" className="border-t border-ink/10">
        <div className={sectionWidth + ' py-8 sm:py-12'}>
          <div className="grid items-center gap-5 rounded-xl bg-ink p-5 text-ivory sm:p-8 md:grid-cols-[minmax(0,1fr)_auto]">
            <div>
              <h2 id="diagnosis-contact-title" className="text-balance text-xl font-semibold sm:text-2xl">{zh ? '您的网站，先改哪里？' : 'What should you improve first on your site?'}</h2>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-ivory/80">{zh ? '告诉我们现有网址和最想解决的问题，我们会和您一起梳理改版重点。' : 'Share your current website and the problem you’d most like to solve. We’ll help you decide what to improve first.'}</p>
            </div>
            <Link href="/start/rebuild#rebuild-inquiry" className={primary + ' w-full focus-visible:outline-lime sm:w-fit'}>
              {zh ? '咨询网站改版' : 'Discuss a website redesign'}<ArrowRight className="size-4 shrink-0" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>
    </PageShell>
  )
}
