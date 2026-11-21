const tasks = ['DISCOVER', 'UNDERSTAND', 'TRUST', 'INQUIRE', 'SEARCH_TECHNICAL']
const rules = ['DISC-01', 'INFO-01', 'TRUST-01', 'CTA-01', 'SEO-01']

// The fixture carries metadata shaped like the provider response, without executing capture or AI.
export function withPresentation(dto, page, {
  candidate = 'https://approved.example.com/unvisited',
  failed = 'https://approved.example.com/limited',
} = {}) {
  const pending = dto.state === 'CAPTURE_PENDING' || dto.state === 'CAPTURE_FAILED'
  const groups = pending ? [] : tasks.map((task, index) => ({
    task,
    rules: [{
      rule_id: rules[index],
      observations: [{
        observation: {
          observation_id: 'obs-' + String(index).repeat(64),
          rule_id: rules[index],
          result: index === 1 ? 'PASS' : 'UNKNOWN',
        },
        reason: index === 1 ? null : 'HTML_UNSUPPORTED_OR_AMBIGUOUS',
        citations: index === 1 ? [{ snapshot_ref: page.snapshot_ref }] : [],
      }],
    }],
  }))
  const artifact = pending ? null : 'c'.repeat(64)
  const analysis = dto.state === 'AI_UNAVAILABLE'
    ? { zh: '模型请求未完成。', en: 'The model request failed.' }
    : { zh: '这是合成数据的诊断状态。', en: 'Synthetic diagnosis state.' }
  return {
    ...dto,
    artifact_sha256: artifact,
    analysis_outcome: dto.state === 'AI_UNAVAILABLE' ? 'PROVIDER_FAILED' : 'PENDING',
    deterministic_diagnosis: pending ? null : { buyer_tasks: groups, private_fixture: true },
    customer_presentation: {
      contract: 'vrae.diagnosis-presentation.v1', is_report: false, formal_human_review: false,
      artifact_sha256: artifact, rules_available: !pending, analysis_text: analysis,
      tasks: groups.map((group, index) => {
        const observation = group.rules[0].observations[0].observation
        return {
          task: group.task,
          title: { zh: '测试维度', en: 'Test task' },
          observations: [{
            ...observation,
            status_text: index === 1
              ? { zh: '本次检查已观察到', en: 'Observed in this check' }
              : { zh: '本次尚未核实', en: 'Not verified in this check' },
            text: index === 1
              ? { zh: '在产品页记录了型号和规格。', en: 'A model and specification were recorded.' }
              : { zh: '页面内容未能明确核实。', en: 'The recorded page did not provide conclusive evidence.' },
            source_pointer: `/deterministic_diagnosis/buyer_tasks/${index}/rules/0/observations/0`,
          }],
        }
      }),
    },
    page_scope: pending ? null : {
      visited_pages: [{ ...page, capture_status: 'FETCHED', http_status: 200, private_fixture: true }],
      failed_attempt_records: [{ url: failed, capture_status: 'TIMEOUT', private_fixture: true }],
      unvisited_candidates: [
        { url: candidate, reason: 'INVENTORY_ONLY', is_defect: false },
        { url: candidate + '?secret=private_fixture', reason: 'INVENTORY_ONLY', is_defect: false },
      ],
    },
    capture_summary: pending ? null : { fetched_pages: 1, unvisited_is_defect: false, inventory_truncated: false },
  }
}
