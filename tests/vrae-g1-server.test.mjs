import assert from 'node:assert/strict'
import { execFileSync, spawn } from 'node:child_process'
import { createHash, X509Certificate } from 'node:crypto'
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { createServer } from 'node:https'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { once } from 'node:events'
import { test } from 'node:test'
import { createG1Adapter, g1MediaType, g1Profile } from '../lib/vrae-g1-server.ts'
import { GET, POST } from '../app/api/website-diagnosis/route.ts'
import { localG1Enabled } from '../lib/vrae-g1-local.ts'

const sourceSha = 'a'.repeat(40)
const token = 'local-fixture-service-token'
const tag = i => 'aref-' + String(i).padStart(32, '0')
const challenge = name => '__Host-vrae-g1-challenge=' + name
const cookie = name => '__Host-vrae-g1=' + name
const strict = '; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=180'
const consent = { version: 'VF-LOCAL-EXAMPLE-1', textSha256: 'b'.repeat(64), acceptedAt: '2026-11-18T10:00:00Z' }

function authority(i) {
  const value = {
    tenantId: 'tenant-local', subjectRef: 'subject-' + i, invitationRef: 'invite-' + i,
    permissionRef: 'permit-' + i, siteUrl: `https://company-${i}.example/`, language: i === 1 ? 'zh' : 'en', consent,
  }
  return {
    ...value,
    signedSubmission: JSON.stringify({
      contract_version: g1Profile,
      command: {
        request: {
          tenant_id: value.tenantId, site_url: value.siteUrl, audit_mode: 'L1', idempotency_key: 'local-fixture-' + i,
        },
        permission_reference: { reference: value.permissionRef, proof: { test: true } },
      },
      normalized_host: new URL(value.siteUrl).hostname,
      subject_ref: value.subjectRef,
      invitation_ref: value.invitationRef,
      language: value.language,
      diagnosis_consent: { consent_version: consent.version, text_sha256: consent.textSha256, accepted_at: consent.acceptedAt },
      submission_proof: { test: true },
    }),
  }
}

test('the browser API stays closed outside local development', async () => {
  const flags = { VF_B_OFFLINE_G1: '1', VF_B_OFFLINE_G1_FIXTURES: '/private/test' }
  assert.equal(localG1Enabled({ ...flags, NODE_ENV: 'development' }), true)
  assert.equal(localG1Enabled({ ...flags, NODE_ENV: 'production' }), false)
  assert.equal(localG1Enabled({ ...flags, NODE_ENV: 'development', VERCEL_ENV: 'preview' }), false)
  for (const handler of [GET, POST]) {
    const response = await handler(new Request('http://127.0.0.1:3114/api/website-diagnosis'))
    assert.equal(response.status, 404)
    assert.equal(response.headers.get('cache-control'), 'no-store')
    assert.deepEqual(await response.json(), { status: 'unavailable' })
  }
})

test('actual local TLS wire, two independently scoped invitations and private sessions', async t => {
  const dir = mkdtempSync(join(tmpdir(), 'vf-g1-local-'))
  const key = join(dir, 'tls-key.pem')
  const cert = join(dir, 'tls-cert.pem')
  let server
  try {
    execFileSync('openssl', ['req', '-x509', '-newkey', 'rsa:2048', '-nodes', '-days', '1',
      '-subj', '/CN=127.0.0.1', '-addext', 'subjectAltName=IP:127.0.0.1', '-keyout', key, '-out', cert],
    { stdio: 'ignore' })
    const pem = readFileSync(cert, 'utf8')
    const config = {
      ca: pem, sourceSha, serviceToken: token,
      certificateSha256: createHash('sha256').update(new X509Certificate(pem).raw).digest('hex'),
    }
    const authorized = [authority(1), authority(2)]
    const idx = new Map()
    const consumed = new Set()
    let wireCalls = 0
    let sequence = 0
    let mutate = null
    const failures = []
    server = createServer({ key: readFileSync(key), cert: pem }, async (req, res) => {
      try {
        wireCalls++
        assert.equal(req.headers.host, '127.0.0.1:8766')
        assert.equal(req.headers.origin, 'https://127.0.0.1:8766')
        assert.equal(req.headers.authorization, 'Bearer ' + token)
        assert.equal(req.headers.accept, g1MediaType)
        if (req.method === 'POST') assert.equal(req.headers['content-type'], g1MediaType)
        assert.ok(!req.url.includes('?'))
        const data = []
        for await (const part of req) data.push(part)
        const raw = Buffer.concat(data).toString()
        const send = (status, body = {}, headers = {}) => {
          res.writeHead(status, {
            'Content-Type': g1MediaType, 'Cache-Control': 'no-store', 'X-G1-AI-State': 'NO_MODEL',
            'X-VRAE-Scope': 'OFFLINE_SYNTHETIC_NO_RELEASE', 'X-VRAE-Source-SHA': sourceSha, ...headers,
          })
          res.end(JSON.stringify({ contract_version: g1Profile, ...body }))
        }
        const deny = () => send(403, { http_status: 403, code: 'ACCESS_DENIED', retryable: false, retry_after_seconds: null })
        if (req.url === '/v1/audit-requests') {
          const i = authorized.findIndex(a => a.signedSubmission === raw)
          if (i === -1) return deny()
          const ref = tag(i + 1)
          idx.set(ref, authorized[i].invitationRef)
          if (mutate === 'bad-202') return send(202, { audit_ref: ref, run_status: 'CREATED', diagnosis_complete: true, poll_after_seconds: 5 })
          return send(202, { audit_ref: ref, run_id: 'private-native-run', run_status: 'CREATED', diagnosis_complete: false, poll_after_seconds: 5 })
        }
        if (req.url === '/v1/return-challenge') {
          sequence++
          return send(200, { challenge_ready: true }, {
            'Set-Cookie': challenge('challenge-value-' + sequence) + strict,
            'X-G1-CSRF': 'challenge-csrf-token-' + sequence,
          })
        }
        const match = /^\/v1\/audits\/(aref-[a-f0-9]{32})(\/return\/exchange)?$/.exec(req.url)
        if (!match || !idx.has(match[1])) return deny()
        const ref = match[1]
        const number = Number(ref.at(-1))
        if (match[2]) {
          const key = 'fixture-return-token-' + number
          assert.equal(req.headers.cookie, challenge('challenge-value-' + sequence))
          assert.equal(req.headers['x-g1-csrf'], 'challenge-csrf-token-' + sequence)
          const body = JSON.parse(raw)
          if (body.return_token !== key || consumed.has(key)) return deny()
          consumed.add(key)
          return send(200, { restored: true }, {
            'Set-Cookie': [cookie('session-value-fixture-' + number) + strict,
              challenge('') + '; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0'],
            'X-G1-CSRF': 'session-csrf-fixture-' + number,
          })
        }
        if (req.headers.cookie !== cookie('session-value-fixture-' + number) ||
            req.headers['x-g1-csrf'] !== 'session-csrf-fixture-' + number) return deny()
        if (mutate === 'revoked') return deny()
        if (mutate === 'rate') return send(429, { http_status: 429, code: 'RATE_LIMITED', retryable: true, retry_after_seconds: 30 })
        if (mutate === 'down') return send(503, { http_status: 503, code: 'UNAVAILABLE', retryable: true, retry_after_seconds: 3 })
        return send(200, {
          audit_ref: ref,
          task: { status: 'REVIEW_REQUIRED', run_id: 'private-native-run', progress_percent: null },
          publication: mutate === 'approved' ? { state: 'APPROVED_FULL', report_version_id: 'report.v2' }
            : { state: 'UNPUBLISHED', report_version_id: null },
          access: { state: mutate === 'expired' ? 'EXPIRED' : 'ACTIVE' },
          display_state: mutate === 'approved' ? 'completed' : 'running',
        }, mutate === 'wrong-source' ? { 'X-VRAE-Source-SHA': 'c'.repeat(40) } : {})
      } catch (err) {
        failures.push(err)
        res.destroy()
      }
    })
    server.listen(8766, '127.0.0.1')
    await once(server, 'listening')
    const client = createG1Adapter(config)
    const submitted = new Map()
    const sessions = new Map()
    await t.test('two site authorizations submit independently and retry identically', async () => {
      for (const [i, plan] of authorized.entries()) {
        const accepted = await client.submit(plan)
        assert.deepEqual(accepted, { ok: true, value: { auditRef: tag(i + 1), pollAfterSeconds: 5 } })
        assert.deepEqual(await client.submit(plan), accepted)
        submitted.set(i + 1, accepted.value.auditRef)
      }
      assert.equal(idx.size, 2)
    })
    await t.test('scope and diagnosis consent must both match the signed envelope', async () => {
      const before = wireCalls
      assert.equal((await client.submit({ ...authorized[0], siteUrl: authorized[1].siteUrl })).status, 403)
      assert.equal((await client.submit({ ...authorized[0], permissionRef: 'other-permit' })).status, 403)
      assert.equal((await client.submit({ ...authorized[0], consent: { ...consent, version: 'different-version' } })).status, 403)
      assert.equal((await client.submit({ ...authorized[0], subjectRef: 'other-subject' })).status, 403)
      assert.equal(wireCalls, before)
    })
    await t.test('one-use challenge and return consent keep two sessions isolated', async () => {
      for (const [i, ref] of submitted) {
        const current = await client.exchange(ref, 'fixture-return-token-' + i)
        assert.equal(current.ok, true)
        sessions.set(i, current.value)
        assert.equal((await client.exchange(ref, 'fixture-return-token-' + i)).status, 403)
        assert.deepEqual(await client.status(ref, current.value), {
          ok: true, value: { state: 'running', taskStage: 'REVIEW_REQUIRED', reportAvailable: false },
        })
      }
      const before = wireCalls
      assert.equal((await client.status(tag(2), sessions.get(1))).status, 403)
      assert.equal(wireCalls, before)
    })
    await t.test('expiry, revocation, short service failures and untrusted publication stay closed', async () => {
      for (const [mode, status, expected] of [['revoked', 403, null], ['expired', 403, null],
        ['rate', 429, 30], ['down', 503, 3], ['approved', 503, null], ['wrong-source', 503, null]]) {
        mutate = mode
        assert.deepEqual(await client.status(tag(1), sessions.get(1)), { ok: false, status, retryAfterSeconds: expected })
      }
      mutate = 'bad-202'
      assert.equal((await client.submit(authorized[0])).status, 503)
      mutate = null
    })
    await t.test('wrong certificate pin sends no request', async () => {
      const before = wireCalls
      const invalid = createG1Adapter({ ...config, certificateSha256: 'd'.repeat(64) })
      assert.equal((await invalid.submit(authorized[0])).status, 503)
      assert.equal(wireCalls, before)
    })
    if (process.env.VF_TEST_LOCAL_CHROMIUM === '1') {
      await t.test('browser submits an approved fixture and reads its stage through the BFF', async () => {
        const fixtureFile = join(dir, 'private-next-fixtures.json')
        const codes = ['local-browser-test-code-one', 'local-browser-test-code-two']
        writeFileSync(fixtureFile, JSON.stringify({
          transport: config,
          invitations: authorized.map((plan, i) => ({
            codeSha256: createHash('sha256').update(codes[i]).digest('hex'),
            expiresAt: new Date(Date.now() + 600_000).toISOString(),
            authority: plan,
            session: sessions.get(i + 1),
          })),
        }), { mode: 0o600 })
        const base = 'http://127.0.0.1:3114'
        const vf = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'dev', '-H', '127.0.0.1', '-p', '3114', '--webpack'], {
          env: { ...process.env, NODE_ENV: 'development', VF_B_OFFLINE_G1: '1', VF_B_OFFLINE_G1_FIXTURES: fixtureFile },
          stdio: 'inherit',
        })
        try {
          const started = Date.now()
          while (Date.now() - started < 120_000) {
            if (vf.exitCode !== null) throw new Error('Local VEYFRONT process exited')
            try {
              if ((await fetch(base + '/website-diagnosis', { signal: AbortSignal.timeout(15_000) })).ok) break
            } catch {}
            await new Promise(resolve => setTimeout(resolve, 500))
          }
          assert.ok(Date.now() - started < 120_000, 'Local VEYFRONT did not start')
          const before = wireCalls
          const browser = spawn('python', ['scripts/check-vf-b-browser.py', base], { stdio: 'inherit' })
          const [exit] = await once(browser, 'exit')
          assert.equal(exit, 0)
          assert.equal(wireCalls - before, 4, 'Only two authorized submits and two reads call upstream')
        } finally {
          if (vf.exitCode === null) {
            const exited = once(vf, 'exit')
            vf.kill()
            await exited
          }
        }
      })
    }
    assert.deepEqual(failures, [])
  } finally {
    if (server?.listening) await new Promise(resolve => server.close(resolve))
    rmSync(dir, { recursive: true, force: true })
  }
})
