import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { createHash, randomBytes } from 'node:crypto'
import { once } from 'node:events'
import { mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { createServer } from 'node:https'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { test } from 'node:test'
import { setTimeout as delay } from 'node:timers/promises'
import {
  createDiagnosisClient, createReportClient, diagnosisVersion, reportContract, reportProfile, vfContract,
} from '../lib/vrae-preview-client.ts'
import {
  automaticPreviewAddress, currentPreviewDiagnosis, isAutomaticPreviewHost, isPreviewSameOrigin, preparePreviewDiagnosis, previewConfig, readPreviewSession, seal, unseal,
} from '../lib/vrae-preview.ts'

const sourceSha = 'a'.repeat(40)
const reportSha = 'b'.repeat(40)
const diagnosisToken = 'synthetic-preview-app-bearer'
const reportToken = 'synthetic-preview-review-bearer'
const returnToken = 'synthetic-return-token'
const csrf = 'synthetic-diagnosis-csrf'
const cookie = 'synthetic-diagnosis-session'
const audit = 'aref-' + '1'.repeat(32)
const versionId = 'synthetic-reviewed-version'
const displayHash = 'c'.repeat(64)
const media = `application/vnd.vrae.launch+json; profile="${vfContract}"`
const reportMedia = `application/vnd.vrae.report+json; profile="${reportContract}"`
const consentText = 'I am authorized to permit bounded read-only diagnosis of this HTTPS website and its public same-origin pages, including processing minimized typed evidence by Alibaba Bailian qwen4-max in cn-beijing. Raw HTML and PII are excluded from model input. Automated conclusions and suggestions may be returned to me; they are not human-certified findings. No login, write or form submission is authorized.'
const hash = createHash('sha256').update(JSON.stringify(consentText)).digest('hex')
const consent = { version: 'VRAE-AUTO-DIAGNOSIS-1', text: consentText, hash }
const site = 'https://approved.example.com/'
const sessionPath = '/v1/diagnosis-sessions'
const diagnosisPath = '/v1/diagnoses'
const resultPath = '/v1/audits/{audit_ref}/diagnosis'
const sourcePage = 'page-' + 'e'.repeat(64)
const jsonPaths = ['/health/ready', '/v1/openapi.json', '/v1/target-intake-contract']
const json = 'application/json'
const intake = {
  contract: 'vrae.target-intake.v1', automatic_diagnosis: {
    method: 'POST', path: diagnosisPath, result_path: resultPath, consent_version: consent.version, consent_text: consent.text,
  },
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

test('automatic diagnosis is limited to the designated Vercel Preview deployment host', () => {
  const host = 'veyfront-fixture.vercel.app'
  const env = {
    VERCEL: '1', VERCEL_ENV: 'preview', VERCEL_URL: host,
    VERCEL_GIT_COMMIT_REF: 'feature/vf-b-offline-g1-adapter',
  }
  assert.equal(isAutomaticPreviewHost(host, env), true)
  assert.equal(isAutomaticPreviewHost('veyfront.com', env), false)
  assert.equal(isAutomaticPreviewHost(host, { ...env, VERCEL_ENV: 'production' }), false)
  assert.equal(isAutomaticPreviewHost(host, { ...env, VERCEL_GIT_COMMIT_REF: 'other-branch' }), false)
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

test('a customer can supply an HTTPS site and retry the exact authorized request', () => {
  for (const address of ['supplier.com', 'https://supplier.com', 'https://supplier.com/product']) {
    assert.equal(automaticPreviewAddress(address), 'https://supplier.com/')
  }
  assert.equal(automaticPreviewAddress('https://other-supplier.com/'), 'https://other-supplier.com/')
  for (const address of ['', 'https://127.0.0.1/', 'http://supplier.com/', 'https://private.internal/',
    'https://supplier.com:8080', 'https://supplier.com/?private=value', 'https://user@supplier.com/']) {
    assert.equal(automaticPreviewAddress(address), undefined)
  }
  const key = randomBytes(32)
  const session = { cookie, csrf, expiresAt: Date.now() + 60_000 }
  const pending = preparePreviewDiagnosis(site, consent, 'zh')
  const restored = readPreviewSession(key, seal(key, 'session', { session, pending, address: site }))
  assert.equal(currentPreviewDiagnosis(restored), pending.raw)
  const raw = JSON.parse(pending.raw)
  assert.match(raw.idempotency_key, /^[a-f0-9-]{36}$/)
  assert.deepEqual(raw, {
    url: site, authorized: true, idempotency_key: raw.idempotency_key,
    accepted_at: new Date(pending.acceptedAt).toISOString(), consent_version: consent.version, language: 'zh',
  })
  assert.throws(() => currentPreviewDiagnosis({ ...restored, pending: { ...pending, acceptedAt: Date.now() - 31 * 60_000 } }), { status: 403 })
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
    let sessionCount = 0
    let legacyContract = false
    let approved = false
    let readyDenied = false
    let changedConsent = false
    let resultState = 'CAPTURE_PENDING'
    let verification = 'REAL_PROVIDER'
    let boundEvidence = true
    let slowResult = false
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
        async function respond(status, body = {}, headers = {}, bodyDelay = 0) {
          res.writeHead(status, {
            'Content-Type': req.headers.accept, 'Cache-Control': 'no-store',
            'X-VRAE-Source-SHA': review ? reportSha : sourceSha,
            ...(review ? { 'X-VRAE-Scope': reportProfile } : { 'X-VRAE-API-Version': diagnosisVersion }), ...headers,
          })
          if (bodyDelay) {
            res.flushHeaders()
            await delay(bodyDelay)
          }
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
          paths: { ...(legacyContract ? {} : { [sessionPath]: { post: {} } }), [diagnosisPath]: { post: {} }, [resultPath]: { get: {} } },
        })
        if (req.url === '/v1/target-intake-contract') return respond(200, changedConsent ? { ...intake, automatic_diagnosis: { ...intake.automatic_diagnosis, consent_text: 'Different terms' } } : intake)
        if (req.url === sessionPath || req.url === '/v1/return-sessions') {
          const created = req.url === sessionPath
          assert.equal(req.method, 'POST')
          assert.equal(req.headers.cookie, undefined)
          assert.equal(req.headers['x-csrf-token'], undefined)
          assert.deepEqual(JSON.parse(raw), created ? {} : { return_token: returnToken })
          if (created) sessionCount++
          const suffix = created && sessionCount > 1 ? '-' + sessionCount : ''
          return respond(200, created ? { created: true } : { restored: true }, {
            'Set-Cookie': '__Host-vrae-targets=' + cookie + suffix + '; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=300',
            'X-CSRF-Token': csrf + suffix,
          })
        }
        if (req.headers.cookie === '__Host-vrae-targets=' + cookie + '-2') {
          assert.equal(req.url, '/v1/audits/' + audit + '/diagnosis')
          assert.equal(req.headers['x-csrf-token'], csrf + '-2')
          return respond(403)
        }
        assert.equal(req.headers.cookie, '__Host-vrae-targets=' + cookie)
        assert.equal(req.headers['x-csrf-token'], csrf)
        if (req.url === diagnosisPath) {
          submissions.push(raw)
          if (submissions.length === 1) return respond(503)
          return respond(202, { contract_version: vfContract, audit_ref: audit, run_status: 'CREATED', diagnosis_complete: false })
        }
        if (req.url === '/v1/audits/' + audit + '/diagnosis') {
          if (resultState === 'DENIED') return respond(403)
          const pending = ['CAPTURE_PENDING', 'AI_PENDING'].includes(resultState)
          return respond(pending ? 202 : 200, {
            contract: 'vrae.automatic-diagnosis.v1', audit_ref: audit, state: resultState,
            diagnosis_complete: resultState === 'DIAGNOSED', formal_human_review: false, publication: 'UNPUBLISHED',
            evidence: [{ snapshot_ref: sourcePage, url: site, observed_at: '2026-11-19T16:00:00Z', status: 'OBSERVED' }],
            coverage: [{ scope: 'PAGE', url: site + 'products', status: 'NOT_VISITED' }],
            model: { verification_realm: verification, state: 'AI_CANDIDATES_FOR_HUMAN_REVIEW',
              real_model_calls: 1, usage: { usage_origin: 'PROVIDER_REPORTED' } },
            claims: [{
              task: 'UNDERSTAND', explanation: 'Buyers can review the product information.',
              status: 'HUMAN_REVIEW_REQUIRED', guard_semantic_approval: false,
              refs: ['synthetic-citation'], rebuild: ['Add a specification table.'], questions: ['Which properties do buyers compare?'],
              source_bindings: { 'synthetic-citation': {
                type: 'GUARD_LITERAL', fact: { source: { citation: { snapshot_ref: boundEvidence ? sourcePage : 'unbound', url: site } } },
              } }, guard: { private_fixture: true },
            }], deterministic_diagnosis: { internal_fixture: slowResult ? 'x'.repeat(735_000) : true },
          }, {}, slowResult ? 8_500 : 0)
        }
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
    }
    const prepared = previewConfig(env)
    assert.ok(prepared)
    assert.equal(previewConfig({ ...env, VERCEL_ENV: 'production' }), undefined)
    assert.equal(previewConfig({ ...env, VRAE_DIAGNOSIS_BASE_URL: origin.href }), undefined)
    await t.test('mTLS, independent sessions without invitations, stable retries, genuine AI result and task recovery', async () => {
      const diagnosis = createDiagnosisClient(app)
      assert.equal(await diagnosis.ready(), true)
      readyDenied = true
      await assert.rejects(diagnosis.ready(), { status: 403 })
      readyDenied = false
      legacyContract = true
      await assert.rejects(diagnosis.openapi(), { status: 503 })
      legacyContract = false
      await diagnosis.openapi()
      assert.equal(sessionCount, 0)
      changedConsent = true
      await assert.rejects(diagnosis.intake(), { status: 503 })
      changedConsent = false
      assert.deepEqual(await diagnosis.intake(), consent)
      await assert.rejects(createDiagnosisClient({ ...app, sourceSha: reportSha }).ready(), { status: 503 })
      await assert.rejects(createDiagnosisClient({ ...app, key: undefined, cert: undefined }).ready(), { status: 503 })
      const session = await diagnosis.createSession()
      const secondVisitor = await diagnosis.createSession()
      assert.notEqual(session.cookie, secondVisitor.cookie)
      assert.notEqual(session.csrf, secondVisitor.csrf)
      const { raw } = preparePreviewDiagnosis(site, consent, 'zh')
      await assert.rejects(diagnosis.submit(raw, session), { status: 503 })
      assert.equal(await diagnosis.submit(raw, session), audit)
      assert.deepEqual(submissions, [raw, raw])
      await assert.rejects(diagnosis.result(audit, secondVisitor), { status: 403 })
      assert.equal(paths.some(path => path.startsWith('/v1/target-applications') || path === '/v1/audit-requests'), false)
      assert.equal((await diagnosis.result(audit, session)).state, 'running')
      resultState = 'AI_PENDING'
      assert.equal((await diagnosis.result(audit, session)).state, 'analyzing')
      resultState = 'AI_UNAVAILABLE'
      const unavailable = await diagnosis.result(audit, session)
      assert.deepEqual(unavailable.insights, [])
      assert.deepEqual(unavailable.pages.map(page => page.observed), [true, false])
      resultState = 'CAPTURE_FAILED'
      assert.equal((await diagnosis.result(audit, session)).state, 'failed')
      resultState = 'DENIED'
      await assert.rejects(diagnosis.result(audit, session), { status: 403 })
      resultState = 'DIAGNOSED'
      verification = 'PROTOCOL_FAKE_NOT_REAL_API'
      await assert.rejects(diagnosis.result(audit, session), { status: 503 })
      verification = 'REAL_PROVIDER'
      boundEvidence = false
      await assert.rejects(diagnosis.result(audit, session), { status: 503 })
      boundEvidence = true
      const diagnosed = await diagnosis.result(audit, session)
      assert.equal(diagnosed.state, 'diagnosed')
      assert.deepEqual(diagnosed.insights[0].sources, [sourcePage])
      assert.deepEqual(diagnosed.insights[0].rebuild, ['Add a specification table.'])
      assert.doesNotMatch(JSON.stringify(diagnosed), /private_fixture|internal_fixture|verification_realm|audit_ref/)
      assert.equal(await diagnosis.issueReturn(audit, session), returnToken)
      const restored = await diagnosis.restoreSession(returnToken)
      assert.equal(restored.cookie, cookie)
      slowResult = true
      const recovered = await diagnosis.result(audit, restored)
      assert.deepEqual(recovered, diagnosed)
      assert.deepEqual(submissions, [raw, raw])
      assert.equal(sessionCount, 2)
      assert.equal(paths.includes('/v1/invitation-session'), false)
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
