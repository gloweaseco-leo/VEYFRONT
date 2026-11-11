'use client'
import Link from '@/components/l2m/localized-link'
import { PageShell } from '@/components/site/page-shell'
import { useLang } from '@/lib/i18n'
import publicOffers from '@/lib/public-offers.json'

const updated='2026-11-10'
const pzh:[string,string][]=[
 ['适用范围','本说明适用于 VEYFRONT 网站上的项目需求、一般联系和隐私请求。填写表单不会自动诊断网站、生成网站或创建订单。'],
 ['收集哪些信息','根据咨询类型，我们收集你主动提交的姓名、微信号、联系电话、邮箱（至少一种联系方式）、偏好联系渠道、公司、目标市场、现有网站网址和需求描述，以及受理编号与提交时间。为了判断咨询的大致来源，网站可能在当前浏览器会话中保存一个粗粒度来源类别（如 Google、Bing、百度、外部引荐或未知）及站内入口页面路径，并在你同意提交项目咨询后随咨询记录保存；不保存原始引荐网址、搜索词或浏览器指纹。隐私请求不记录此来源类别。请勿提交密码、机密合同或身份证件。'],
 ['为何使用','仅为接收、管理和回复咨询，核对项目范围、安排后续沟通，以及处理隐私请求。客户主动发起的企业微信沟通，如实际建立联系，商务人员可人工记录最小线索与跟进状态。网页点击二维码不代表已添加好友。未经允许不会对旧网站实施修改。'],
 ['存储及跨境处理','咨询记录使用受服务端权限控制的 Vercel 私有存储。若启用咨询确认邮件且您填写了邮箱，邮件地址与咨询编号将由邮件服务商用于发送确认通知；相关基础设施可能涉及跨境处理。咨询完整内容不会公开展示。'],
 ['保留与请求','记录按处理咨询及必要业务记录的需求保留，尚未启用自动到期删除。你可以请求查阅、更正或删除，或拒绝后续联系；我们会核实请求并依法处理。'],
 ['联系','如有隐私或数据请求，可使用网站的数据请求入口或发送邮件至 hello@veyfront.com。正式签约主体、适用法律及必要信息将在签约前核实，并以正式文件为准。']
]
const pen:[string,string][]=[
 ['Scope','This notice covers project inquiries, general contact and privacy requests made through VEYFRONT. Submitting a form does not initiate automated website analysis, site generation or a purchase.'],
 ['Information collected','Depending on the inquiry, you may provide your name, WeChat ID, phone, email (at least one contact method), contact preference, company, markets, existing website and project details. Records also include a reference and submission time. To help identify broad inquiry sources, the site may keep a coarse category (such as Google, Bing, Baidu, other referral or unknown) and the first public landing-page path for this browser session and include it only when you consent to and submit a project inquiry. We do not retain the raw referrer URL, search query or browser fingerprint for this purpose; privacy requests do not carry this category. Please do not share passwords, confidential contracts or identity documents.'],
 ['Purpose','We use the information to receive and reply to inquiries, verify project scope and respond to privacy requests. Confirmed WeCom conversations may be manually registered as minimal private leads. A QR interaction is not proof of customer contact. Existing sites are not modified without authorization.'],
 ['Storage and cross-border processing','Inquiries are stored in access-controlled Vercel private storage. If acknowledgement emails are enabled and you provide an email, an email provider handles the recipient address and inquiry reference solely to send the confirmation. Infrastructure may involve cross-border processing. Full inquiry content is not public.'],
 ['Retention and requests','Records are retained for inquiry handling and necessary business records; automated expiration is not currently active. You can request access, correction or deletion and ask us to stop further contact. We review and handle requests under applicable law.'],
 ['Contact','For privacy or data requests, use the privacy-request form or hello@veyfront.com. The legal operating entity and required jurisdiction-specific disclosures still need verification before formal commercial contracting.']
]
const tzh:[string,string][]=[
 ['网站与服务','VEYFRONT 为中国制造业和B2B外贸企业提供海外官网新建、常规旧站升级，以及可选的网站维护与内容优化服务，并接受客户咨询。'],
 ['价格与签约',`官网公开的三档标准项目参考价分别为：${publicOffers.plans.start.titleZh} ¥${publicOffers.plans.start.priceDisplay}、${publicOffers.plans.sales.titleZh} ¥${publicOffers.plans.sales.priceDisplay}、${publicOffers.plans.growth.titleZh} ¥${publicOffers.plans.growth.priceDisplay}。均包含约定网站建设、首年基础托管及3个月服务。实际交付范围、税费、特殊需求、续费和付款安排以双方签约前确认的书面报价和合同为准。提交咨询不代表签约或付款。`],
 ['展示示例','Hartwell 是明确标注的虚构工业网站设计示例，不是真实客户案例，也不是自动生成或真实诊断结果。搜索排名、流量或成交均不作保证。'],
 ['网站及素材权利','VEYFRONT 的品牌标识和展示素材受适用权利约束。客户网站的域名控制、约定源码和素材移交、第三方许可及可迁移条件，在签约时明确。'],
 ['基础托管与可选运营','三档标准方案均包含首年基础托管。3个月服务结束后，客户可按需另行购买维护或运营支持；续费费用与服务范围事前确认，不以购买后续运营服务作为续费或迁移的条件。'],
 ['联系与法律条款','正式购买与交付受签署的项目合同约束；运营主体信息及适用法律应在成交前确认。问题可发送至 hello@veyfront.com。']
]
const ten:[string,string][]=[
 ['Website services','VEYFRONT presents Launch (new B2B websites), Rebuild (regular site improvements) and optional Frontier Run ongoing improvements, and accepts project inquiries.'],
 ['Pricing and agreement',`Current standard project guide prices are ¥${publicOffers.plans.start.priceDisplay}, ¥${publicOffers.plans.sales.priceDisplay}, and ¥${publicOffers.plans.growth.priceDisplay}. Each includes the agreed website, first-year basic hosting and three months of defined services. Scope, taxes, exceptions, renewal and payment are agreed in writing before work. An inquiry is not a purchase.`],
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
