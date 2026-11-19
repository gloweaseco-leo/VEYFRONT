import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { createHash, randomBytes } from 'node:crypto'
import { once } from 'node:events'
import { mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { createServer } from 'node:https'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { test } from 'node:test'
import {
  createDiagnosisClient, createReportClient, diagnosisVersion, reportContract, reportProfile, vfContract,
} from '../lib/vrae-preview-client.ts'
import {
  authorizedSubmission, matchesSubmittedUrl, previewConfig, readPreviewSession, seal, unseal,
} from '../lib/vrae-preview.ts'

const sourceSha = 'a'.repeat(40)
const reportSha = 'b'.repeat(40)
const diagnosisToken = 'synthetic-preview-app-bearer'
const reportToken = 'synthetic-preview-review-bearer'
const invite = 'synthetic-invitation-token'
const returnToken = 'synthetic-return-token'
const csrf = 'synthetic-diagnosis-csrf'
const cookie = 'synthetic-diagnosis-session'
const audit = 'aref-' + '1'.repeat(32)
const target = 'test-target-1'
const versionId = 'synthetic-reviewed-version'
const displayHash = 'c'.repeat(64)
const media = `application/vnd.vrae.launch+json; profile="${vfContract}"`
const reportMedia = `application/vnd.vrae.report+json; profile="${reportContract}"`
const consentText = '仅限授权公开页面。'
const hash = createHash('sha256').update(JSON.stringify(consentText)).digest('hex')
const plan = {
  contract: 'vrae.authorized-source-context.v1', target_id: target, tenant_id: 'tenant-A',
  invitation_ref: 'invite-A', subject_ref: 'subject-A', site_url: 'https://approved.example/',
  audit_modes: ['L0', 'L1'], source_policy: { synthetic: true },
}
const signedSubmission = JSON.stringify({
  contract_version: vfContract, subject_ref: plan.subject_ref, invitation_ref: plan.invitation_ref,
  normalized_host: 'approved.example', language: 'zh', submission_proof: { synthetic: true },
  diagnosis_consent: { consent_version: 'test-1', text_sha256: hash, accepted_at: new Date().toISOString() },
  command: {
    request: { tenant_id: plan.tenant_id, site_url: plan.site_url, idempotency_key: 'local-retryable-intent', audit_mode: 'L1' },
    permission_reference: { proof: { synthetic: true }, consent_version: 'test-1', consent_sha256: hash },
  },
}, null, 2)

test('preview session envelope is purpose-bound, tamper-evident and expires', () => {
  const key = randomBytes(32)
  const value = { session: { cookie, csrf, expiresAt: Date.now() + 60_000 }, ref: audit }
  const sealed = seal(key, 'session', value)
  assert.equal(sealed.includes(cookie), false)
  assert.equal(unseal(key, 'return', sealed), undefined)
  assert.equal(unseal(randomBytes(32), 'session', sealed), undefined)
  assert.equal(unseal(key, 'session', (sealed.startsWith('A') ? 'B' : 'A') + sealed.slice(1)), undefined)
  assert.equal(readPreviewSession(key, sealed).ref, audit)
  value.session.expiresAt = Date.now() - 1
  assert.throws(() => readPreviewSession(key, seal(key, 'session', value)), { status: 403 })
})

test('diagnosis and independent customer report contracts over actual mutual TLS', async t => {
  const directory = mkdtempSync(join(tmpdir(), 'vf-vrae-preview-'))
  function issue(name, alternate) {
    const key = join(directory, name + '.key')
    const cert = join(directory, name + '.crt')
    execFileSync('openssl', ['req', '-x509', '-newkey', 'rsa:2048', '-nodes', '-days', '1', '-subj', '/CN=' + name,
      '-addext', alternate, '-keyout', key, '-out', cert], { stdio: 'ignore' })
    return { key: readFileSync(key, 'utf8'), cert: readFileSync(cert, 'utf8') }
  }
  let server
  try {
    const serverIdentity = issue('127.0.0.1', 'subjectAltName=IP:127.0.0.1')
    const appIdentity = issue('VEyfront diagnostic fixture', 'extendedKeyUsage=clientAuth')
    const reviewIdentity = issue('VEYFRONT report fixture', 'extendedKeyUsage=clientAuth')
    const submissions = []
    const paths = []
    const failures = []
    let oneUse = false
    let approved = false
    server = createServer({
      ...serverIdentity, ca: [appIdentity.cert, reviewIdentity.cert], rejectUnauthorized: true, requestCert: true,
    }, async (req, res) => {
      try {
        paths.push(req.url)
        const review = req.url.startsWith('/v1/report-authority/')
        assert.equal(req.socket.getPeerCertificate().subject.CN, review ? 'VEYFRONT report fixture' : 'VEyfront diagnostic fixture')
        assert.equal(req.headers.authorization, 'Bearer ' + (review ? reportToken : diagnosisToken))
        assert.equal(req.headers.origin, undefined)
        assert.equal(req.headers.accept, review ? reportMedia : req.url === '/health/ready' ? 'application/json' : media)
        if (req.method === 'POST') assert.equal(req.headers['content-type'], review ? reportMedia : media)
        const chunks = []
        for await (const chunk of req) chunks.push(chunk)
        const raw = Buffer.concat(chunks).toString()
        function respond(status, body = {}, headers = {}) {
          res.writeHead(status, {
            'Content-Type': req.headers.accept, 'Cache-Control': 'no-store',
            'X-VRAE-Source-SHA': review ? reportSha : sourceSha,
            ...(review ? { 'X-VRAE-Scope': reportProfile } : { 'X-VRAE-API-Version': diagnosisVersion }), ...headers,
          })
          res.end(JSON.stringify(review ? { contract: reportContract, ...body } : body))
        }
        if (review) {
          assert.equal(req.headers['x-report-profile'], reportProfile)
          assert.equal(req.headers.cookie, undefined)
          if (req.url.endsWith('/health')) return respond(200, { ready: true, customer_release: true })
          if (req.url.endsWith('/challenge')) {
            assert.equal(raw, '{}')
            return respond(200, { nonce: 'synthetic-mfa-nonce', csrf: 'synthetic-report-csrf' })
          }
          if (req.url.endsWith('/session')) {
            assert.deepEqual(JSON.parse(raw), {
              responsible_bearer: 'Bearer synthetic.test.signature', nonce: 'synthetic-mfa-nonce', csrf: 'synthetic-report-csrf',
            })
            return respond(200, { report_session: 'synthetic-report-session' })
          }
          assert.equal(req.url, '/v1/report-authority/audits/' + audit + '/report')
          assert.equal(req.headers['x-report-session'], 'synthetic-report-session')
          assert.equal(req.headers['x-report-grant'], 'synthetic-report-grant')
          assert.equal(req.headers['x-report-token'], 'synthetic-report-token')
          return respond(200, {
            scope: reportProfile, formal_human_review: approved, external_release: approved,
            report: { internal_fixture: true }, report_version: { status: 'APPROVED', report_version_id: versionId, version: 1 },
            review_decision: { action: 'APPROVE', report_version_id: versionId, version: 1 }, display_hash: displayHash,
          }, { ETag: '"' + displayHash + '"' })
        }
        if (req.url === '/health/ready') return respond(200, { api_version: diagnosisVersion, status: 'READY', source_sha: sourceSha })
        if (req.url === '/v1/invitation-session' || req.url === '/v1/return-sessions') {
          const invitation = req.url === '/v1/invitation-session'
          assert.deepEqual(JSON.parse(raw), invitation ? { invitation_token: invite } : { return_token: returnToken })
          if (invitation && oneUse) return respond(403)
          if (invitation) oneUse = true
          return respond(200, { restored: true }, {
            'Set-Cookie': '__Host-vrae-targets=' + cookie + '; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=300',
            'X-CSRF-Token': csrf,
          })
        }
        assert.equal(req.headers.cookie, '__Host-vrae-targets=' + cookie)
        assert.equal(req.headers['x-csrf-token'], csrf)
        if (req.url === '/v1/source-plans/' + target) return respond(200, plan)
        if (req.url === '/v1/audit-requests') {
          submissions.push(raw)
          if (submissions.length === 1) return respond(503)
          return respond(202, { contract_version: vfContract, audit_ref: audit, run_status: 'CREATED', diagnosis_complete: false })
        }
        if (req.url === '/v1/audits/' + audit) return respond(200, {
          contract_version: vfContract, audit_ref: audit, task: { status: 'DRAFT_READY', progress_percent: null },
          access: { state: 'ACTIVE' }, publication: { state: 'UNPUBLISHED' }, display_state: 'running',
        })
        if (req.url === '/v1/audits/' + audit + '/return-tokens') {
          assert.deepEqual(JSON.parse(raw), { ttl_seconds: 300 })
          return respond(201, { contract: 'vrae.task-return-token.v1', return_token: returnToken })
        }
        assert.fail('Unexpected fixture request')
      } catch (error) {
        failures.push(error)
        res.destroy()
      }
    })
    server.listen(0, '127.0.0.1')
    await once(server, 'listening')
    const origin = new URL(`https://127.0.0.1:${server.address().port}`)
    const app = { ...appIdentity, origin, ca: serverIdentity.cert, sourceSha, bearer: diagnosisToken }
    const env = {
      VERCEL_ENV: 'preview', VF_VRAE_PREVIEW_ENABLED: '1', VF_VRAE_PREVIEW_SESSION_KEY: randomBytes(32).toString('hex'),
      VRAE_DIAGNOSIS_BASE_URL: 'https://diagnosis.vrae.example.com', VRAE_DIAGNOSIS_SOURCE_SHA: sourceSha,
      VRAE_DIAGNOSIS_BEARER: diagnosisToken, VRAE_DIAGNOSIS_CA_PEM: app.ca,
      VRAE_DIAGNOSIS_CLIENT_CERT_PEM: app.cert, VRAE_DIAGNOSIS_CLIENT_KEY_PEM: app.key,
      VF_VRAE_PREVIEW_SIGNED_SUBMISSIONS: JSON.stringify([{ targetId: target, consentText, signedSubmission, expiresAt: new Date(Date.now() + 60_000).toISOString() }]),
    }
    const prepared = previewConfig(env)
    assert.ok(prepared)
    assert.equal(previewConfig({ ...env, VERCEL_ENV: 'production' }), undefined)
    assert.equal(previewConfig({ ...env, VRAE_DIAGNOSIS_BASE_URL: origin.href }), undefined)
    assert.equal(previewConfig({ ...env, VF_VRAE_PREVIEW_SIGNED_SUBMISSIONS: env.VF_VRAE_PREVIEW_SIGNED_SUBMISSIONS.replace(consentText, 'scope was edited') }), undefined)

    await t.test('source and consent match the current invited identity', () => {
      const resolve = frame => authorizedSubmission(prepared.submissions, frame, 'zh')
      assert.equal(resolve(plan).raw, signedSubmission)
      assert.throws(() => resolve({ ...plan, subject_ref: 'subject-B' }), { status: 403 })
      assert.throws(() => resolve({ ...plan, site_url: 'https://other.example/' }), { status: 403 })
      assert.throws(() => authorizedSubmission(prepared.submissions, plan, 'zh', 'changed-retry'), { status: 403 })
      assert.equal(matchesSubmittedUrl('approved.example', plan.site_url), true)
      assert.equal(matchesSubmittedUrl('approved.example?private=value', plan.site_url), false)
    })

    await t.test('mTLS, single-use invitations, stable retries, draft status and task recovery', async () => {
      const diagnosis = createDiagnosisClient(app)
      assert.equal(await diagnosis.ready(), true)
      await assert.rejects(createDiagnosisClient({ ...app, sourceSha: reportSha }).ready(), { status: 503 })
      await assert.rejects(createDiagnosisClient({ ...app, key: undefined, cert: undefined }).ready(), { status: 503 })
      const session = await diagnosis.exchange('invitation', invite)
      await assert.rejects(diagnosis.exchange('invitation', invite), { status: 403 })
      assert.deepEqual(await diagnosis.plan(target, session), plan)
      await assert.rejects(diagnosis.submit(signedSubmission, session), { status: 503 })
      assert.equal(await diagnosis.submit(signedSubmission, session), audit)
      assert.deepEqual(submissions, [signedSubmission, signedSubmission])
      assert.equal(await diagnosis.status(audit, session), 'awaiting-report')
      assert.equal(await diagnosis.issueReturn(audit, session), returnToken)
      const restored = await diagnosis.exchange('return', returnToken)
      assert.equal(restored.cookie, cookie)
      assert.equal(await diagnosis.status(audit, restored), 'awaiting-report')
    })

    await t.test('reports use a separate mutual TLS binding, a trusted session and an approved release', async () => {
      const reports = createReportClient({ ...reviewIdentity, origin, ca: serverIdentity.cert, sourceSha: reportSha, bearer: reportToken })
      assert.equal(await reports.ready(), true)
      const challenge = await reports.challenge()
      const session = await reports.exchange('Bearer synthetic.test.signature', challenge)
      const credentials = { session, grant: 'synthetic-report-grant', token: 'synthetic-report-token' }
      await assert.rejects(reports.read(audit, credentials), { status: 403 })
      approved = true
      const report = await reports.read(audit, credentials)
      assert.equal(report.external_release, true)
      assert.equal(paths.includes('/v1/audits/' + audit + '/report'), false)
    })
    assert.deepEqual(failures, [])
  } finally {
    if (server) await new Promise(resolve => server.close(resolve))
    rmSync(directory, { recursive: true, force: true })
  }
})
