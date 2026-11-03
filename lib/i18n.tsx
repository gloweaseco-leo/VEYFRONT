'use client'

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

export type Lang = 'en' | 'zh'

export type HotspotCopy = {
  tag: string
  title: string
  before: string
  after: string
  value: string
}

const en = {
  nav: {
    services: 'Services',
    transformations: 'Design example',
    howItWorks: 'How It Works',
    pricing: 'Services & Pricing',
    contact: 'Contact',
    signIn: 'Sign In',
    analyze: 'Contact Us',
    navLabel: 'Primary',
    navDemo: 'Navigation is a visual placeholder in this design round.',
  },
  hero: {
    brandLine: 'VEYFRONT / BEYOND REDESIGN',
    headline: 'Building Digital Frontiers for Global Business.',
    subtitle:
      'Launch a credible new B2B website or transform the one you already have. Help global buyers understand, trust and contact your business.',
    ctaPrimary: 'Continue with this website',
    ctaSecondary: 'See a Transformation',
    boundary: ['We confirm the upgrade scope before making changes', 'Your existing website remains in your control'],
  },
  url: {
    label: 'Your current website',
    placeholder: 'https://your-company.com',
    empty: 'Enter your website address to continue.',
    invalid: 'That doesn\u2019t look like a website address. Try a format like https://your-company.com.',
    unavailable:
      'This address can\u2019t be analyzed. Local, private and IP addresses aren\u2019t supported — try your public website domain.',
    recognized: 'Address format looks valid',
    continueTitle: 'Continue with your website',
    continueBody:
      'Continue to the Rebuild inquiry to share your goals. We will review the website and agree an upgrade plan and written quote with you.',
    continueCta: 'What happens next',
    edit: 'Edit address',
    demo: 'We confirm site details before proposing work.',
    nextBadge: 'Next steps',
    nextTitle: 'Discuss your upgrade requirements',
    nextKept: 'Address kept for this step',
    nextSteps: [
      ['Confirm your business goals', 'Share details in your Rebuild inquiry'],
      ['Limited diagnosis of your public site', 'Not run — no request has been sent'],
      ['Website Report', 'See the sample report on this page'],
    ] as [string, string][],
    nextSample: 'View the sample report',
    back: 'Back',
  },
  flagship: {
    eyebrow: 'The Transformation',
    title: 'Same business. A completely different experience.',
    altTitle: '还是同一家企业，但客户看到的体验已经不同。',
    lede: 'One company, the same pages and the same facts — reorganized around how a buyer discovers, evaluates and gets in touch.',
    before: 'Before',
    after: 'After',
    viewLabel: 'Version',
    deviceLabel: 'Device',
    desktop: 'Desktop',
    mobile: 'Mobile',
    pagesLabel: 'Page',
    pages: { home: 'Home', product: 'Product', contact: 'Contact' },
    pageLocked: 'Shown only when authorized source pages exist',
    changesHeading: 'What changed',
    beforeLabel: 'Before',
    afterLabel: 'After',
    valueLabel: 'Why it matters',
    explore: 'Explore the Transformation',
    showOnSite: 'Show on page',
    beforeHint: 'You are viewing the original. Switch to After to see the marked changes.',
    legacyMobileNote: 'The original layout isn\u2019t responsive — the desktop page is shrunk to fit the phone.',
    placeholder: 'Design preview',
    fictional: 'Design concept',
    placeholderNote:
      'Fictional sample company, hand-built to illustrate the format. Not a customer case and not L2M generator output.',
    evidenceHeading: 'Source & evidence',
    evidence: [
      ['Source', 'Fictional sample — no real website'],
      ['Snapshot date', 'Not applicable'],
      ['Authorization', 'Not applicable — awaiting an authorized case'],
      ['Generated vs. manual', 'Hand-built mock; no L2M generation used'],
      ['Function check', 'Not verified — inquiry is non-functional'],
    ] as [string, string][],
    inquiryDemo: 'DEMO — no inquiry is sent.',
    figCaption: 'After — Hartwell Fluid Systems (fictional sample)',
    hotspotsAria: 'Commercial change',
  },
  hotspots: [
    {
      tag: 'Discover',
      title: 'Buyers start from their application',
      before: 'Products are a flat sidebar list of model numbers.',
      after: 'Visitors pick their application and narrow to relevant product families.',
      value: 'A buyer can reach a relevant product without knowing the model number.',
    },
    {
      tag: 'Evaluate',
      title: 'Key specifications on the page',
      before: 'Specifications live only inside a downloadable PDF.',
      after: 'Size, pressure rating and material are summarized; the datasheet remains available.',
      value: 'Buyers can check fit before downloading or contacting sales.',
    },
    {
      tag: 'Act',
      title: 'Inquiries carry product context',
      before: 'A separate contact page lists phone, fax and a general email.',
      after: 'The inquiry starts from the product, with the model and size already attached.',
      value: 'Sales receives a request that says what the buyer is asking about.',
    },
  ] as HotspotCopy[],
  b: {
    heroToggleHint: 'Switch versions',
    pinsHint: 'Tap a marker to see what changed',
    workbenchEyebrow: 'Inspect the change',
  },
  review: {
    back: 'Design review',
  },
}

export type Dict = typeof en

const zh: Dict = {
  nav: {
    services: '服务',
    transformations: '网站设计示例',
    howItWorks: '交付流程',
    pricing: '服务与价格',
    contact: '联系我们',
    signIn: '登录',
    analyze: '咨询建站',
    navLabel: '主导航',
    navDemo: '本轮设计中导航仅为视觉占位。',
  },
  hero: {
    brandLine: 'VEYFRONT / BEYOND REDESIGN',
    headline: '让企业网站，成为连接全球客户的可信商业入口。',
    subtitle: '从零建立专业 B2B 网站，或重构已有网站。让全球买家更容易理解、信任并联系你的企业。',
    ctaPrimary: '继续提交改造需求',
    ctaSecondary: '查看改造演示',
    boundary: ['先确认升级范围，再实施改造', '原网站始终由你掌控'],
  },
  url: {
    label: '你现在的网站',
    placeholder: 'https://your-company.com',
    empty: '请输入网站地址后继续。',
    invalid: '这看起来不是有效的网站地址，请使用类似 https://your-company.com 的格式。',
    unavailable: '该地址暂不能分析。不支持本地、内网或 IP 地址，请输入公开的网站域名。',
    recognized: '网址格式有效',
    continueTitle: '可以继续提交改造需求',
    continueBody: '继续填写 Rebuild 项目需求，我们将结合现有网站与业务目标，沟通升级方案和报价。',
    continueCta: '了解后续步骤',
    edit: '修改网址',
    demo: '了解现有网站后，我们会与你确认升级方案。',
    nextBadge: '后续步骤',
    nextTitle: '沟通现有网站升级需求',
    nextKept: '网址已保留到这一步',
    nextSteps: [
      ['确认业务目标', '在 Rebuild 需求中补充'],
      ['对公开网站进行有限诊断', '未运行 — 没有发送任何请求'],
      ['网站诊断报告', '可查看本页的示例报告'],
    ],
    nextSample: '查看示例报告',
    back: '返回',
  },
  flagship: {
    eyebrow: '改造演示',
    title: '同一家企业，网站升级前后大不一样。',
    altTitle: 'Same business. A completely different experience.',
    lede: '在不编造企业和产品事实的前提下，重新组织产品展示、采购评估与询盘路径。',
    before: '改造前',
    after: '改造后',
    viewLabel: '版本',
    deviceLabel: '设备',
    desktop: '桌面',
    mobile: '手机',
    pagesLabel: '页面',
    pages: { home: '首页', product: '产品', contact: '联系' },
    pageLocked: '仅在有授权来源页面时显示',
    changesHeading: '变化在哪里',
    beforeLabel: '改造前',
    afterLabel: '改造后',
    valueLabel: '商业意义',
    explore: '查看完整设计对比',
    showOnSite: '查看对应设计',
    beforeHint: '当前为原网站。切换到「改造后」查看标记的变化。',
    legacyMobileNote: '原网站不支持响应式 — 桌面页面被缩小显示在手机上。',
    placeholder: 'Design preview',
    fictional: '设计对比',
    placeholderNote: '虚构示例企业，仅用于说明展示形式。不是客户案例，也不是 L2M 生成结果。',
    evidenceHeading: '来源与证据',
    evidence: [
      ['来源', '虚构示例 — 无真实网站'],
      ['快照日期', '不适用'],
      ['授权状态', '不适用 — 等待授权案例'],
      ['生成与人工修改', '手工制作的示意稿，未使用 L2M 生成'],
      ['功能验证', '未验证 — 询盘不可用'],
    ],
    inquiryDemo: '演示 — 不会发送询盘。',
    figCaption: '改造后 — Hartwell Fluid Systems（虚构示例）',
    hotspotsAria: '商业变化',
  },
  hotspots: [
    {
      tag: '发现',
      title: '买家从应用场景开始',
      before: '产品只是侧栏中一长串型号列表。',
      after: '访客先选择应用场景，再缩小到相关产品系列。',
      value: '买家不需要知道型号，也能找到相关产品。',
    },
    {
      tag: '评估',
      title: '关键规格直接呈现',
      before: '规格只存在于需要下载的 PDF 中。',
      after: '尺寸、压力等级与材质直接概括，规格书仍可下载。',
      value: '买家在下载或联系销售之前就能判断是否适配。',
    },
    {
      tag: '行动',
      title: '询盘自带产品上下文',
      before: '独立的联系页只列出电话、传真和通用邮箱。',
      after: '询盘从产品页发起，型号和尺寸已自动带入。',
      value: '销售收到的请求明确说明买家在询问什么。',
    },
  ],
  b: {
    heroToggleHint: '切换版本',
    pinsHint: '点击标记查看变化',
    workbenchEyebrow: '查看变化细节',
  },
  review: {
    back: '设计评审',
  },
}

const dictionaries: Record<Lang, Dict> = { en, zh }

type LangContextValue = { lang: Lang; setLang: (lang: Lang) => void; t: Dict }

const LangContext = createContext<LangContextValue | null>(null)

export function LangProvider({ children, initialLang = 'en' }: { children: ReactNode; initialLang?: Lang }) {
  const [lang, setLang] = useState<Lang>(initialLang)

  useEffect(() => {
    document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en'
  }, [lang])

  return <LangContext.Provider value={{ lang, setLang, t: dictionaries[lang] }}>{children}</LangContext.Provider>
}

export function useLang() {
  const ctx = useContext(LangContext)
  if (!ctx) throw new Error('useLang must be used inside LangProvider')
  return ctx
}
