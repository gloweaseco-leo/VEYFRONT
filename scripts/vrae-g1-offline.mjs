// Read server-side fixture inputs from stdin inside the owned G1 namespace.
import { readFileSync } from 'node:fs'
import { createG1Adapter } from '../lib/vrae-g1-server.ts'

if (process.env.VERCEL || process.env.VERCEL_ENV || process.env.VF_B_OFFLINE_G1 !== '1') {
  process.stderr.write('The G1 client is available only for an explicitly enabled local test.\n')
  process.exit(1)
}

try {
  const input = JSON.parse(readFileSync(0, 'utf8'))
  const client = createG1Adapter(input.transport)
  let result
  if (input.action === 'submit' && input.authority) {
    result = await client.submit(input.authority)
  } else if (input.action === 'status' && typeof input.auditRef === 'string' && input.session) {
    result = await client.status(input.auditRef, input.session)
  } else if (input.action === 'exchange-and-status' && typeof input.auditRef === 'string' && typeof input.returnToken === 'string') {
    const exchange = await client.exchange(input.auditRef, input.returnToken)
    result = exchange.ok ? await client.status(input.auditRef, exchange.value) : exchange
  } else {
    throw new Error('Unknown G1 operation')
  }
  // No credential, signed request, native run or evidence is printed.
  process.stdout.write(JSON.stringify(result) + '\n')
  if (!result.ok) process.exitCode = 1
} catch {
  process.stderr.write('G1 fixture inputs could not be processed.\n')
  process.exitCode = 1
}
