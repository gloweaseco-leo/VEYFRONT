import type { Lang } from '@/lib/i18n'
import type { DiagnosisReportView } from '@/lib/diagnosis-presentation'

/** Hand-authored fixture under a reserved domain, independent of the website form. */
export function exampleReport(lang: Lang, partial: boolean): DiagnosisReportView {
  const zh = lang === 'zh'
  const site = 'https://flow-controls.example'
  const catalog = site + '/products'
  const product = catalog + '/stainless-steel-ball-valves/high-pressure-series/floating-ball-valve-fv240'
  const quality = site + '/quality'
  return {
    kind: 'synthetic',
    targetUrl: site,
    checkedAt: '2026-11-18T10:00:00Z',
    source: zh ? '人工编写的虚构页面与证据' : 'Hand-authored fictional pages and evidence',
    pages: [
      { url: site, label: zh ? '英文首页' : 'English homepage', outcome: 'reviewed' },
      { url: catalog, label: zh ? '产品分类页' : 'Product catalogue', outcome: 'reviewed' },
      { url: product, label: zh ? 'FV240 产品详情页' : 'FV240 product detail', outcome: 'reviewed' },
      ...(partial ? [{ url: quality, label: zh ? '质量资料页' : 'Quality documentation', outcome: 'unknown' as const }] : []),
    ],
    results: {
      DISCOVER: {
        status: 'OBSERVED',
        fact: zh ? '从英文首页进入产品目录，可以按产品系列找到 FV240。' : 'The English homepage leads to a catalogue organised by product family, where buyers can find FV240.',
        evidence: { url: catalog, location: zh ? '产品目录 · 不锈钢球阀分类' : 'Catalogue · Stainless Steel Ball Valves', excerpt: 'Stainless Steel Ball Valves → FV240 Floating Ball Valve' },
      },
      UNDERSTAND: {
        status: 'ISSUE',
        fact: zh ? '所查的 FV240 产品页列出了材质，未在页面规格区展示压力等级。' : 'The inspected FV240 page lists the material but gives no pressure rating in the page specifications.',
        evidence: { url: product, location: zh ? 'FV240 产品页 · 规格区全文' : 'FV240 product page · complete specification section', excerpt: 'Specifications\nBody: Stainless steel 316\nConnection bore: 15–50 mm' },
        buyerImpact: zh ? '如果买家按管路压力筛选供应商，可能需要额外发邮件确认型号是否适用。' : 'A buyer screening suppliers by line pressure may need to email sales to confirm whether the model fits.',
        rebuild: zh ? '在产品详情页补齐经企业核对的压力等级、单位和适用条件，并保留详细规格书。' : 'Add the company-verified pressure rating, unit and operating conditions to the product page and keep the full datasheet available.',
      },
      TRUST: {
        status: 'UNKNOWN',
        fact: partial
          ? (zh ? '示例中的质量资料页无法读取。所查其他页面不足以判断买家能否核对证书。' : 'The sample quality page could not be read. The remaining pages do not establish whether buyers can verify certificates.')
          : (zh ? '本次样本不足以判断买家能否找到并核对产品质量资料。' : 'The sampled pages do not establish whether buyers can find and check the product quality documents.'),
        nextCheck: zh ? '补查公开质量资料页和企业同意公开的产品文件。' : 'Check the public quality page and any product documents approved for public release.',
      },
      INQUIRE: {
        status: 'ISSUE',
        fact: zh ? '所查的 FV240 产品页只有页脚通用邮箱，没有该型号的询价入口。' : 'The inspected FV240 page shows a general email in the footer and no inquiry entry for that model.',
        evidence: { url: product, location: zh ? 'FV240 产品页 · 内容末尾及页脚联系区' : 'FV240 product page · end of content and contact footer', excerpt: 'Download brochure\nContact: sales@flow-controls.example' },
        buyerImpact: zh ? '买家可能需要手动复制型号和需求，销售收到的邮件也可能缺少产品上下文。' : 'Buyers may have to copy the model and requirements manually, and sales may receive an email without product context.',
        rebuild: zh ? '在产品页增加「询价此型号」，让买家在发送前核对预填型号并补充数量、用途。' : 'Add a “Request a quote for this model” action with an editable model field and space for quantity and usage.',
      },
      SEARCH_TECHNICAL: {
        status: 'OBSERVED',
        fact: zh ? '所查英文首页包含页面标题和一个可见主标题。' : 'The sampled English homepage has a page title and one visible primary heading.',
        evidence: { url: site, location: zh ? '英文首页 · 页面标题与 H1' : 'English homepage · page title and H1', excerpt: 'Title: Flow Controls | Industrial Valves\nH1: Industrial Valves for Process Systems' },
      },
    },
    priority: ['UNDERSTAND', 'INQUIRE'],
  }
}
