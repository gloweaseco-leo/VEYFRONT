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

export function withBuyerReview(dto) {
  if (!dto.deterministic_diagnosis) return dto
  const [page] = dto.page_scope.visited_pages
  const diagnosis = dto.deterministic_diagnosis
  const presentation = dto.customer_presentation
  const pack = 'ep-' + '1'.repeat(64)
  const execution = 'rx-' + '2'.repeat(64)
  const product = 'ps-' + '3'.repeat(64)
  const row = diagnosis.buyer_tasks[1].rules[0].observations[0]
  const cite = (fact_role, text, field_index = null) => ({
    snapshot_ref: page.snapshot_ref, url: page.url, product_scope_ref: product, fact_role, text, field_index,
  })
  row.citations = [cite('NAME', 'Grinding wheel W100'), cite('SPEC_LABEL', 'Size', 0), cite('SPEC_VALUE', '100 mm', 0)]
  const procurement = {
    contract: 'vrae.l2-procurement-review.v1', config_version: '1.0.0', configuration_ref: 'pcfg-' + 'e'.repeat(64),
    review_ref: 'prv-' + 'f'.repeat(64), pack_ref: pack, execution_ref: execution,
    coverage: { eligible_products: 1, reviewed_products: 1, truncated: false },
    unknown_is_defect: false, formal_human_review: false, native_fact_admission: 'NONE', semantic_approval: false,
    products: [{
      observation_id: row.observation.observation_id, product_scope_ref: product, is_rule_pass: false,
      state: 'PARTIAL_SOURCE_INFORMATION', verified_sku: false, engineering_fit: 'UNKNOWN',
      name: { text: 'Grinding wheel W100', citation_indexes: [0] }, declared_model: null,
      profile: { id: 'abrasive_wheel', state: 'SOURCE_LABEL_CANDIDATE', title: { zh: '砂轮采购资料', en: 'Wheel information' }, citation_indexes: [0] },
      fields: [{ key: 'dimensions', label: 'Size', value: '100 mm', citation_indexes: [1, 2],
        normalization: { dimension: 'length', value: '100', unit: 'mm' } }],
      groups: [{ key: 'dimensions', title: { zh: '尺寸', en: 'Dimensions' }, state: 'OBSERVED', field_indexes: [0],
        next_step: { zh: '核对规格书', en: 'Confirm the data sheet' } }, {
        key: 'grit', title: { zh: '粒度', en: 'Grit' }, state: 'NOT_OBSERVED_IN_CAPTURE', field_indexes: [],
        next_step: { zh: '查阅其他产品资料', en: 'Check other product documents' },
      }],
    }],
  }
  Object.assign(diagnosis, { diagnostic_version: 'l2-industrial-1.0.6', expected_pack_ref: pack,
    native_execution_ref: execution, procurement_review: procurement })
  presentation.procurement_review = procurement

  const start = diagnosis.buyer_tasks[0].rules[0].observations[0]
  start.source_page = page
  start.target_response = null
  const step = { rule_id: 'DISC-01', observation_id: start.observation.observation_id, result: 'UNKNOWN' }
  const journey = 'journey-' + '4'.repeat(64)
  diagnosis.buyer_journey = [{ journey_ref: journey, complete: false, terminal_result: 'UNKNOWN',
    steps: [{ ...step, source_page: page, target_response: null, citations: start.citations }] }]
  const checks = [['DISC-03'], ['INFO-02'], ['TRUST-02', 'TRUST-03'], [], ['SEO-02', 'TECH-01']]
  const review = {
    contract: 'vrae.buyer-review.v1', review_ref: 'brv-' + '5'.repeat(64),
    artifact_sha256: dto.artifact_sha256, pack_ref: pack, native_execution_ref: execution, state: 'AVAILABLE',
    s2_projection_ref: 's2p-' + '6'.repeat(64), industry_ref: 'ip-' + '7'.repeat(64),
    native_fact_admission: 'NONE', formal_human_review: false, unknown_is_defect: false, inquiry_submitted: false,
    product_context_transfer: 'UNKNOWN', technical_material_route: 'UNKNOWN', proof_route: 'UNKNOWN',
    tasks: tasks.map((task, i) => ({ task, candidates: [], coverage: checks[i].map(rule_id =>
      ({ rule_id, total: 0, returned: 0, truncated: false })) })),
    paths: [{ journey_ref: journey, static_path_complete: false, terminal_result: 'UNKNOWN',
      product_context_transfer: 'UNKNOWN', inquiry_submitted: false,
      steps: [{ ...step, source_pointer: '/deterministic_diagnosis/buyer_tasks/0/rules/0/observations/0' }] }],
    path_coverage: { total: 1, returned: 1, truncated: false, whole_site_coverage_known: false },
  }
  review.tasks[4].candidates.push({
    observation_id: 'obs-' + '9'.repeat(64), rule_id: 'TECH-01', rule_version: 's2-static-1.0.0',
    source_version: 's2-source-1.0.0', candidate_result: 'PASS', reason: 'RETAINED_HTTP_200_RESPONSE',
    title: { zh: '保存的页面响应', en: 'Retained response' }, text: { zh: '可从已访问页面复核。', en: 'Review this against the visited page.' },
    source_snapshot_refs: [page.snapshot_ref],
    evidence_bindings: [{ evidence_ref: 'ev-' + 'a'.repeat(64), snapshot_ref: page.snapshot_ref,
      locator: '/pages/0/evidence/0', content_sha256: 'b'.repeat(64), byte_start: 0, byte_end: 10 }],
    native_fact_admission: 'NONE', human_review_required: true,
  })
  review.tasks[4].coverage[1] = { rule_id: 'TECH-01', total: 1, returned: 1, truncated: false }
  dto.buyer_review = presentation.buyer_review = review
  const seo = diagnosis.buyer_tasks[4].rules[0].observations[0]
  seo.citations = [{ snapshot_ref: page.snapshot_ref, url: page.url, fact_role: 'TITLE' }]
  seo.seo_signals = { title: { status: 'OBSERVED' } }
  presentation.tasks[4].observations[0].context_facts = [{
    kind: 'TITLE', citation_indexes: [0], is_rule_pass: false,
    text: { zh: '已记录页面标题。', en: 'A page title was recorded.' },
  }]
  return dto
}
