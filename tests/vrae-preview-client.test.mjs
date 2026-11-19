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
  currentPreviewDiagnosis, isPreviewSameOrigin, preparePreviewDiagnosis, previewConfig, readPreviewSession, seal, unseal,
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
const consentText = 'Only the approved public pages may be read.'
const hash = createHash('sha256').update(JSON.stringify(consentText)).digest('hex')
const consent = { version: 'VRAE-READONLY-DIAGNOSIS-1', text: consentText, hash }
const site = 'https://approved.example.com/'
const intent = 'e60e1184-7c86-448c-8adb-3f1210a2540e'
const applicationToken = 'T'.repeat(720) + '=='
const applicationPath = '/v1/target-applications'
const authorisationPath = applicationPath + '/authorize'
const diagnosisPath = '/v1/diagnoses'
const jsonPaths = ['/health/ready', '/v1/openapi.json', '/v1/target-intake-contract']
const json = 'application/json'
const intake = {
  contract: 'vrae.target-intake.v1', consent_version: consent.version, consent_text: consent.text, consent_text_sha256: consent.hash,
  application: { path: applicationPath }, authorization: { path: authorisationPath }, diagnosis: { path: diagnosisPath },
}

test('preview origin uses the browser Host and preserves cross-origin refusal', () => {
  const loopback = new Headers({ host: '127.0.0.1:3119', origin: 'http://127.0.0.1:3119', 'sec-fetch-site': 'same-origin' })
  assert.equal(isPreviewSameOrigin(loopback, false), true)
  assert.equal(isPreviewSameOrigin(loopback, true), false)
  const deployed = new Headers({ host: 'preview.example.com', origin: 'https://preview.example.com', 'sec-fetch-site': 'same-origin' })
  assert.equal(isPreviewSameOrigin(deployed, true), true)
  deployed.set('origin', 'https://other.example.com')
  deployed.set('x-forwarded-host', 'other.example.com')
  assert.equal(isPreviewSameOrigin(deployed, true), false)
  deployed.set('origin', 'https://preview.example.com')
  deployed.set('sec-fetch-site', 'cross-site')
  assert.equal(isPreviewSameOrigin(deployed, true), false)
})

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

test('confirmed diagnosis keeps its original body and expires with either consent or source scope', () => {
  const key = randomBytes(32)
  const now = Date.now()
  const session = { cookie, csrf, expiresAt: now + 60_000 }
  const pendingScope = { session, intent }
  const scope = { url: site, consentHash: hash, consentVersion: consent.version, expiresAt: now + 120_000 }
  assert.throws(() => preparePreviewDiagnosis(pendingScope, site, consent, 'zh'), { status: 403 })
  assert.throws(() => preparePreviewDiagnosis({ ...pendingScope, scope }, 'https://other.example.com/', consent, 'zh'), { status: 403 })
  assert.throws(() => preparePreviewDiagnosis({ ...pendingScope, scope }, site, { ...consent, hash: 'b'.repeat(64) }, 'zh'), { status: 403 })
  assert.throws(() => preparePreviewDiagnosis({ ...pendingScope, scope }, site, { ...consent, version: 'new-terms' }, 'zh'), { status: 403 })
  const authorised = { ...pendingScope, scope }
  const pending = preparePreviewDiagnosis(authorised, site, consent, 'zh')
  const restored = readPreviewSession(key, seal(key, 'session', { ...authorised, pending }))
  assert.equal(currentPreviewDiagnosis(restored, site), pending.raw)
  assert.deepEqual(preparePreviewDiagnosis(restored, site, consent, 'en'), pending)
  assert.deepEqual(JSON.parse(pending.raw), {
    url: site, idempotency_key: intent, accepted_at: new Date(pending.acceptedAt).toISOString(), consent_version: consent.version, language: 'zh',
  })
  assert.throws(() => currentPreviewDiagnosis({ ...restored, scope: { ...scope, expiresAt: now - 1 } }, site), { status: 403 })
  assert.throws(() => currentPreviewDiagnosis({ ...restored, pending: { ...pending, acceptedAt: now - 31 * 60_000 } }, site), { status: 403 })
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
    let owned = true
    let readyDenied = false
    let changedConsent = false
    server = createServer({
      ...serverIdentity, ca: [appIdentity.cert, reviewIdentity.cert], rejectUnauthorized: true, requestCert: true,
    }, async (req, res) => {
      try {
        paths.push(req.url)
        const review = req.url.startsWith('/v1/report-authority/')
        assert.equal(req.socket.getPeerCertificate().subject.CN, review ? 'VEYFRONT report fixture' : 'VEyfront diagnostic fixture')
        assert.equal(req.headers.authorization, 'Bearer ' + (review ? reportToken : diagnosisToken))
        assert.equal(req.headers.origin, undefined)
        assert.equal(req.headers.accept, review ? reportMedia : jsonPaths.includes(req.url) ? json : media)
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
        if (req.url === '/health/ready') {
          if (readyDenied) return respond(403, {}, { 'Content-Type': media })
          return respond(200, { api_version: diagnosisVersion, status: 'READY', source_sha: sourceSha })
        }
        if (req.url === '/v1/openapi.json') return respond(200, {
          paths: Object.fromEntries([applicationPath, authorisationPath, diagnosisPath].map(path => [path, { post: {} }])),
        })
        if (req.url === '/v1/target-intake-contract') return respond(200, changedConsent ? { ...intake, consent_text: 'Different terms' } : intake)
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
        if (req.url === applicationPath) {
          assert.deepEqual(JSON.parse(raw), {
            url: site, paths: [], consent: { version: consent.version, read_only_authorized: true, model_data_notice: true },
          })
          return respond(201, {
            contract: 'vrae.target-application.v1', application_token: applicationToken,
            consent_version: consent.version, consent_text_sha256: hash,
            expires_at: new Date(Date.now() + 60_000).toISOString(),
            proof: { type: owned ? 'OPERATOR_OWNED_PUBLIC_ORIGIN' : 'DNS_TXT' },
          })
        }
        if (req.url === authorisationPath) {
          assert.deepEqual(JSON.parse(raw), { application_token: applicationToken })
          return respond(201, {
            contract: 'vrae.target-application.v1', state: 'AUTHORIZED_FOR_READONLY_DIAGNOSIS',
            legal_reference_kind: 'OPERATOR_OWNED_PUBLIC_SOURCE', target_id: target,
            expires_at: new Date(Date.now() + 120_000).toISOString(),
          })
        }
        if (req.url === diagnosisPath) {
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
      VF_VRAE_PREVIEW_TARGET_URL: site,
    }
    const prepared = previewConfig(env)
    assert.ok(prepared)
    assert.equal(previewConfig({ ...env, VERCEL_ENV: 'production' }), undefined)
    assert.equal(previewConfig({ ...env, VRAE_DIAGNOSIS_BASE_URL: origin.href }), undefined)
    assert.equal(prepared.targetUrl, site)
    for (const targetUrl of ['', 'https://127.0.0.1/', site + 'products', site + '?private=value']) {
      assert.equal(previewConfig({ ...env, VF_VRAE_PREVIEW_TARGET_URL: targetUrl }), undefined)
    }

    await t.test('mTLS, single-use invitations, stable retries, draft status and task recovery', async () => {
      const diagnosis = createDiagnosisClient(app)
      assert.equal(await diagnosis.ready(), true)
      readyDenied = true
      await assert.rejects(diagnosis.ready(), { status: 403 })
      readyDenied = false
      await diagnosis.openapi()
      changedConsent = true
      await assert.rejects(diagnosis.intake(), { status: 503 })
      changedConsent = false
      assert.deepEqual(await diagnosis.intake(), consent)
      await assert.rejects(createDiagnosisClient({ ...app, sourceSha: reportSha }).ready(), { status: 503 })
      await assert.rejects(createDiagnosisClient({ ...app, key: undefined, cert: undefined }).ready(), { status: 503 })
      const session = await diagnosis.exchange('invitation', invite)
      await assert.rejects(diagnosis.exchange('invitation', invite), { status: 403 })
      owned = false
      await assert.rejects(diagnosis.authorise(site, consent, session), { status: 403 })
      assert.equal(paths.includes(authorisationPath), false)
      owned = true
      const expiresAt = await diagnosis.authorise(site, consent, session)
      const scope = { url: site, consentHash: hash, consentVersion: consent.version, expiresAt }
      const { raw } = preparePreviewDiagnosis({ session, intent, scope }, site, consent, 'zh')
      await assert.rejects(diagnosis.submit(raw, session), { status: 503 })
      assert.equal(await diagnosis.submit(raw, session), audit)
      assert.deepEqual(submissions, [raw, raw])
      assert.equal(paths.includes('/v1/audit-requests'), false)
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
