#!/usr/bin/env node
/**
 * Operator-only, read-only, aggregate report. Requires BLOB_READ_WRITE_TOKEN
 * in a private execution environment. No web route, no identity or raw URL output.
 */
import { get, list } from '@vercel/blob'
import { createLeadSourceSummary, addSavedFormReceipt } from '../lib/acquisition-report.ts'

if (!process.env.BLOB_READ_WRITE_TOKEN) {
  console.error('Missing private BLOB_READ_WRITE_TOKEN. No data accessed.')
  process.exit(2)
}

const sinceArg = process.argv.find(a => a.startsWith('--since='))?.slice('--since='.length) ?? null
if (sinceArg && (!/^\d{4}-\d{2}-\d{2}$/.test(sinceArg) || !Number.isFinite(Date.parse(sinceArg)))) {
  console.error('Use --since=YYYY-MM-DD. No data accessed.')
  process.exit(2)
}
const summary = createLeadSourceSummary()
const prefix = 'inquiries/'
const MAX_RECORDS = 3000
let cursor
let recordsExamined = 0
try {
  for (let page = 0; page < 30; page++) {
    const result = await list({ prefix, limit: 100, ...(cursor ? { cursor } : {}) })
    for (const blob of result.blobs) {
      if (!/^inquiries\/\d{4}\/\d{2}\/[0-9a-f-]{36}\.json$/i.test(blob.pathname)) continue
      if (blob.size > 32_000) throw new Error('Record exceeds safe limit; refuse partial report')
      if (sinceArg && String(blob.uploadedAt).slice(0, 10) < sinceArg) continue
      recordsExamined++
      if (recordsExamined > MAX_RECORDS) throw new Error('Too many records; refuse partial report')
      const response = await get(blob.pathname, { access: 'private' })
      if (!response || response.statusCode !== 200 || !response.stream) {
        throw new Error('Private receipt unavailable; refuse partial report')
      }
      const raw = await new Response(response.stream).text()
      addSavedFormReceipt(summary, JSON.parse(raw))
    }
    if (!result.hasMore) {
      // All output is aggregate and includes no record identifiers or private text.
      console.log(JSON.stringify({ asOf: new Date().toISOString(), since: sinceArg,
        recordsExamined, ...summary }, null, 2))
      process.exit(0)
    }
    if (!result.cursor || result.cursor === cursor) throw new Error('Pagination stalled; refuse partial report')
    cursor = result.cursor
  }
  throw new Error('Pagination limit exceeded; refuse partial report')
} catch (error) {
  console.error('Aggregate report failed without printing private records:',
    error instanceof Error ? error.name : 'unknown')
  process.exitCode = 1
}
