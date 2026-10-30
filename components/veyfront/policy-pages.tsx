'use client'
import Link from 'next/link'
import { PageShell } from '@/components/site/page-shell'
import { useLang } from '@/lib/i18n'

const updated='2026-10-30'
export function PolicyPage({ kind }: { kind: 'privacy' | 'terms' }) {
  const { lang }=useLang()
  const zh=lang==='zh'
  const privacy=kind==='privacy'
  const sections=privacy ? (zh ? [
    ['适用范围', '本说明适用于 VEYFRONT 网站上的项目咨询、联系与隐私请求。网站的示例诊断、报价计算器和 Hartwell 案例为演示内容。'],
    ['收集的信息', '我们收集你主动提交的联系人姓名、邮箱、公司、网站地址、目标市场以及需求描述。提交记录包含受理编号和提交时间；不主动将 IP 地址或浏览器指纹写入业务记录。'],
    ['使用目的', '仅用于阅读、管理和回复本次咨询、确认项目范围，以及处理与数据相关的请求。不会因提交表单而进行真实网站抓取或启动自动生成。'],
    ['存储与安全', '咨询以非公开对象存储保存在 VEYFRONT 关联的 Vercel 私有存储中，访问需要服务端凭据。托管服务可能涉及跨境数据处理；不要在需求中填写密码、合同机密、个人证件或敏感资料。'],
    ['保留与删除', '信息仅在处理咨询和履行合理业务记录需要的期间保留。你可通过联系表单提出查阅、更正、删除或撤回后续联系的请求。当前不承诺未实现的自动到期删除机制。'],
    ['联系渠道', '通过网站 Contact 页面提交一般联系或数据请求。正式经营主体的登记名称、所在地和其他监管要求的信息，需要在开展大规模商业推广前补充核实。'],
  ] : [
    ['Scope','This notice covers project inquiries, contact requests and privacy requests submitted through VEYFRONT. Sample diagnosis, pricing and the fictional Hartwell example are demonstrations.'],
    ['Data we collect','You may provide your name, email, company, website URL, buyer markets and project details. Records also contain a submission date and reference ID. IP addresses and browser fingerprints are not deliberately stored in inquiry records.'],
    ['Purpose','We use your information to receive, manage and respond to your inquiry, confirm potential scope and handle privacy requests. Submitting does not crawl your site or start website generation.'],
    ['Storage and security','Submissions are saved to a Vercel private object store requiring server-side credentials. Infrastructure may involve cross-border processing. Please do not send passwords, identification numbers or confidential contracts.'],
    ['Retention and deletion','Information is retained as needed to handle inquiries and reasonable business records. You may request access, correction, deletion or withdrawal of further contact through the Contact page. Automated expiry is not yet implemented.'],
    ['Contact','Use the Contact page to contact VEYFRONT regarding privacy or projects. Registered legal operator details and applicable jurisdiction-specific disclosures must be confirmed before wider commercial promotion.'],
  ]) : (zh ? [
    ['网站用途','本网站展示 VEYFRONT 面向全球 B2B 企业的 Launch 和 Rebuild 服务，并接受项目咨询。Grow 为后续计划。'],
    ['咨询不构成合同','提交联系或需求不代表 VEYFRONT 已接受项目、给出报价、承诺期限或接收付款。具体范围、费用、责任与交付方式以另行确认的书面协议为准。'],
    ['演示内容与真实性','Hartwell 为虚构手工示例，非真实客户项目；诊断与价格计算为示意，不能作为实际报价、搜索流量预测或生成效果承诺。'],
    ['内容与知识产权','网站使用 VEYFRONT 品牌素材和用于演示的虚构内容。未经许可不要复制品牌标识用于第三方商业宣传。客户交付的源码及知识产权归属须在项目合同中明确。'],
    ['独立部署范围','可独立部署的范围取决于约定的代码、素材、兼容运行环境及第三方服务配置。托管不是强制产品。'],
    ['联系与争议','如需咨询服务或提交问题，请使用 Contact。此页面不是完整商业服务合同；正式经营主体及适用法律条款须在正式成交前确认。'],
  ] : [
    ['Website purpose','This site describes VEYFRONT Launch and Rebuild services for B2B businesses and accepts inquiries. Grow is a planned service.'],
    ['No binding project order','Submitting an inquiry does not constitute project acceptance, a quotation, payment or a delivery deadline. Scope, fees, responsibilities and deliverables require a separate written agreement.'],
    ['Examples and claims','Hartwell is a fictional hand-built demonstration, not a real customer case. The diagnosis and pricing simulator are illustrative and not actual quotes or performance forecasts.'],
    ['Brand and intellectual property','VEYFRONT brand artwork and fictional demo materials are for site presentation. Do not reuse VEYFRONT trademarks for third-party business promotion. Ownership and licenses for delivered code and assets must be agreed in writing.'],
    ['Independent deployment','Independent deployment depends on agreed source, assets, compatible infrastructure and external service configuration. Hosting is optional.'],
    ['Contact and disputes','Please use Contact for inquiries or concerns. This page is not a complete service contract; actual legal operator information and governing terms must be confirmed before transacting.'],
  ])
 return <PageShell>
 <section className="bg-ink text-ivory"><div className="mx-auto max-w-[1040px] px-5 py-14 md:px-10 lg:py-20">
   <p className="font-mono text-xs uppercase tracking-[0.19em] text-lime">VEYFRONT / {privacy?'PRIVACY':'TERMS'}</p>
   <h1 className="mt-5 text-4xl font-semibold sm:text-6xl">{privacy?(zh?'隐私说明':'Privacy Notice'):(zh?'网站使用条款':'Website Terms')}</h1>
   <p className="mt-4 text-sm text-ivory/70">{zh?'最后更新：':'Last updated: '}{updated}</p>
 </div></section>
 <div className="mx-auto max-w-[1040px] space-y-8 px-5 py-14 md:px-10 lg:py-20">
   {sections.map(([heading,body])=><section key={heading} className="border-b border-ink/15 pb-7"><h2 className="text-xl font-semibold">{heading}</h2><p className="mt-3 max-w-3xl leading-relaxed text-ink/75">{body}</p></section>)}
   <p className="text-sm text-ink/75">{zh?'需要进一步沟通？':'Need to reach us?'} <Link href={privacy ? "/contact/privacy" : "/contact"} className="font-semibold underline underline-offset-4">{zh?'联系 VEYFRONT':'Contact VEYFRONT'}</Link>.</p>
 </div>
 </PageShell>
}
