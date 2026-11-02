'use client'
import Link from 'next/link'
import { PageShell } from '@/components/site/page-shell'
import { useLang } from '@/lib/i18n'

const updated='2026-11-02'
const pzh:[string,string][]=[
 ['适用范围','本说明适用于 VEYFRONT 网站上的项目需求、一般联系和隐私请求。填写表单不会自动诊断网站、生成网站或创建订单。'],
 ['收集哪些信息','根据咨询类型，我们收集你主动提交的姓名、工作邮箱、公司、目标市场、现有网站网址和需求描述，以及受理编号与提交时间。请勿提交密码、机密合同或身份证件。'],
 ['为何使用','仅为接收、管理和回复咨询，核对项目范围、安排后续沟通，以及处理隐私请求。未经允许不会对旧网站实施修改。'],
 ['存储及跨境处理','咨询记录使用有服务端权限控制的 Vercel 私有存储；相关基础设施可能涉及跨境数据处理。我们不会将完整咨询信息作为公开网站内容展示。'],
 ['保留与请求','记录按处理咨询及必要业务记录的需求保留，尚未启用自动到期删除。你可以请求查阅、更正或删除，或拒绝后续联系；我们会核实请求并依法处理。'],
 ['联系','如有隐私或数据请求，可使用网站的数据请求入口或发送邮件至 hello@veyfront.com。正式运营法律主体及适用司法辖区的法定披露仍须在商业签约前核实。']
]
const pen:[string,string][]=[
 ['Scope','This notice covers project inquiries, general contact and privacy requests made through VEYFRONT. Submitting a form does not initiate automated website analysis, site generation or a purchase.'],
 ['Information collected','Depending on the inquiry, you may provide your name, work email, company, markets, existing website and project details. Records also include a reference and submission time. Please do not share passwords, confidential contracts or identity documents.'],
 ['Purpose','We use the information to receive and reply to inquiries, verify project scope and respond to privacy requests. Existing sites are not modified without authorization.'],
 ['Storage and cross-border processing','Inquiries are stored in access-controlled, server-side Vercel private storage. The infrastructure may involve cross-border data processing; inquiries are not displayed as public site content.'],
 ['Retention and requests','Records are retained for inquiry handling and necessary business records; automated expiration is not currently active. You can request access, correction or deletion and ask us to stop further contact. We review and handle requests under applicable law.'],
 ['Contact','For privacy or data requests, use the privacy-request form or hello@veyfront.com. The legal operating entity and required jurisdiction-specific disclosures still need verification before formal commercial contracting.']
]
const tzh:[string,string][]=[
 ['网站与服务','VEYFRONT 展示面向国际 B2B 企业的 Launch（新建）与 Rebuild（常规重建）服务，以及可选的 Frontier Run 持续改善服务，并接收项目咨询。'],
 ['价格与签约','¥9,800 是正常规模网站的参考完整价，包含网站建设和首年基础运行。是否适用、具体内容、税费、特殊项目、续费条件与付款安排，必须在合同签署前书面确认；提交咨询不构成订单或付款。'],
 ['展示示例','Hartwell 是明确标注的虚构工业网站设计示例，不是真实客户案例，也不是自动生成或真实诊断结果。搜索排名、流量或成交均不作保证。'],
 ['网站及素材权利','VEYFRONT 的品牌标识和展示素材受适用权利约束。客户网站的域名控制、约定源码和素材移交、第三方许可及可迁移条件，在签约时明确。'],
 ['基础托管与可选运营','标准建站参考范围包含首年基础托管，Frontier Run 是另外的可选内容与商业改善服务。正常续费费用及资源范围须事前约定，不以购买 Run 作为续费或迁移的前提。'],
 ['联系与法律条款','正式购买与交付受签署的项目合同约束；运营主体信息及适用法律应在成交前确认。问题可发送至 hello@veyfront.com。']
]
const ten:[string,string][]=[
 ['Website services','VEYFRONT presents Launch (new B2B websites), Rebuild (regular site improvements) and optional Frontier Run ongoing improvements, and accepts project inquiries.'],
 ['Pricing and agreement','¥9,800 is an indicative complete-site price for a normal-size project, including first-year basic hosting. Applicable scope, taxes, exceptions, renewal, payment and delivery are confirmed in a written agreement before work. An inquiry is not a purchase or payment.'],
 ['Design examples','Hartwell is a clearly labeled fictional website design example, not a real customer delivery or automated website analysis. Search rankings, traffic and business results are not guaranteed.'],
 ['Rights and handover','VEYFRONT branding and display assets retain their applicable rights. Client domain control, agreed source/asset handover, third-party licensing and transfer conditions are defined in the project agreement.'],
 ['Basic hosting and optional care','The standard package references first-year basic hosting. Frontier Run is separate optional content and business improvement. Normal renewal pricing and resource terms must be agreed upfront; Run is not required for portability or renewal.'],
 ['Contact and legal terms','A signed project agreement governs actual services. The contracting legal operator and applicable governing terms must be confirmed before transacting. Contact hello@veyfront.com for questions.']
]
export function PolicyPage({kind}:{kind:'privacy'|'terms'}){
 const {lang}=useLang(),zh=lang==='zh',privacy=kind==='privacy'
 const sections=privacy?(zh?pzh:pen):(zh?tzh:ten)
 return <PageShell>
  <section className="bg-ink text-ivory"><div className="mx-auto max-w-[1040px] px-5 py-14 md:px-10 lg:py-20">
    <p className="font-mono text-xs uppercase tracking-wider text-lime">VEYFRONT / {privacy?'PRIVACY':'TERMS'}</p>
    <h1 className="mt-4 text-4xl font-semibold sm:text-6xl">{privacy?(zh?'隐私说明':'Privacy Notice'):(zh?'网站使用条款':'Website Terms')}</h1>
    <p className="mt-4 text-sm text-ivory/70">{zh?'更新日期：':'Updated: '}{updated}</p>
  </div></section>
  <div className="mx-auto max-w-[1040px] space-y-8 px-5 py-14 md:px-10 lg:py-20">
   {sections.map(([title,description])=><section key={title} className="border-b border-ink/15 pb-7"><h2 className="text-xl font-semibold">{title}</h2><p className="mt-3 max-w-3xl leading-relaxed text-ink/75">{description}</p></section>)}
   <p className="text-sm text-ink/70">{zh?'需要联系 VEYFRONT？':'Contact VEYFRONT: '} <Link className="font-semibold underline underline-offset-4" href={privacy?"/contact/privacy":"/contact"}>{zh?'进入联系表单':'Use the contact form'}</Link> · <a href="mailto:hello@veyfront.com" className="font-semibold underline underline-offset-4">hello@veyfront.com</a></p>
  </div>
 </PageShell>
}
