#!/usr/bin/env node
/**
 * Authorized, local-only Vercel Blob operations helper.
 * Reads metadata (no names/emails) or deletes a pre-verified exact pathname.
 * Requires a private BLOB_READ_WRITE_TOKEN in the invoking environment.
 * Do not run it in browser code or expose it via a public endpoint.
 */
import { list, del } from '@vercel/blob'

if (!process.env.BLOB_READ_WRITE_TOKEN) {
  console.error('Missing private BLOB_READ_WRITE_TOKEN. No action taken.')
  process.exit(2)
}
const cmd = process.argv[2] ?? 'list'
const prefix = 'inquiries/'
const pathArg = process.argv.find(x=>x.startsWith('--path='))?.slice(7)
const acknowledge = process.argv.find(x=>x.startsWith('--confirm='))?.slice(10)

async function entries() {
  const all=[]
  let cursor
  for (let page=0; page<30; page++) {
    const result=await list({prefix,limit:100, ...(cursor?{cursor}:{})})
    all.push(...result.blobs)
    if (!result.hasMore) return all
    if (!result.cursor || result.cursor===cursor) throw new Error('Pagination did not advance')
    cursor=result.cursor
  }
  throw new Error('Too many entries; refuse partial operations without pagination review')
}

try {
  const blobs=await entries()
  if(cmd==='list') {
    const sorted=blobs.slice().sort((a,b)=>String(b.uploadedAt).localeCompare(String(a.uploadedAt)))
    for(const b of sorted) console.log(JSON.stringify({pathname:b.pathname,uploadedAt:b.uploadedAt,size:b.size}))
    console.log(`Total: ${blobs.length}. Contains no contact names or email addresses.`)
  } else if(cmd==='delete') {
    if(!pathArg || !/^inquiries\/\d{4}\/\d{2}\/[0-9a-f-]{36}\.json$/i.test(pathArg)) throw new Error('Exact inquiry path required')
    if(acknowledge!==pathArg) throw new Error('Explicit --confirm=<same-exact-path> required')
    const match=blobs.find(b=>b.pathname===pathArg)
    if(!match) throw new Error('Path not found. No action taken.')
    console.log('Matched private inquiry record. You must have independently verified the data request before this step.')
    await del(match.pathname)
    console.log('Deletion requested for exact private object. Verify disappearance in subsequent listing and record fulfillment privately.')
  } else {
    throw new Error('Usage: node scripts/lead-ops.mjs list | delete --path=<exact path> --confirm=<exact path>')
  }
} catch(err) {
  console.error('Lead operations command failed:',err instanceof Error?err.message:'unknown')
  process.exitCode=1
}
