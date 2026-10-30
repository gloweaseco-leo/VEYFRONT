import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'

const masters = {
  'public/brand/logo_primary_dark.svg': 'bc06193012524bc07e9b1f1267744f04afb06591',
  'public/brand/logo_primary_light.svg': 'b4d86f954786f0992da6ece82900a5d3d3a73b7e',
  'public/brand/mark_color_transparent.svg': '2112f81e27daeef132b4f6a0ed35592690e64c04',
  'public/favicon.svg': '2112f81e27daeef132b4f6a0ed35592690e64c04',
}
for (const [file, expected] of Object.entries(masters)) {
  const bytes = readFileSync(file)
  const sha = createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex')
  assert.equal(sha, expected, `Original brand vector was modified: ${file}`)
}
const pngs = {
  'public/favicon-16x16.png': [16,16],
  'public/favicon-32x32.png': [32,32],
  'public/apple-touch-icon.png': [180,180],
  'public/android-chrome-192x192.png': [192,192],
}
for (const [file, [w,h]] of Object.entries(pngs)) {
  const b = readFileSync(file)
  assert.equal(b.subarray(0,8).toString('hex'),'89504e470d0a1a0a',`Not PNG: ${file}`)
  assert.equal(b.readUInt32BE(16),w,`Bad width: ${file}`)
  assert.equal(b.readUInt32BE(20),h,`Bad height: ${file}`)
}
const manifest = JSON.parse(readFileSync('public/site.webmanifest','utf8'))
for (const icon of manifest.icons) assert.ok(existsSync(join('public',icon.src.replace(/^\//,''))), `Missing manifest icon ${icon.src}`)
const logo = readFileSync('components/l2m/brand.tsx','utf8')
assert.match(logo,/logo_primary_dark\.svg/)
assert.match(logo,/logo_primary_light\.svg/)
const layout=readFileSync('app/layout.tsx','utf8')
assert.match(layout,/apple-touch-icon\.png/)
assert.match(layout,/favicon\.svg/)
console.log('VEYFRONT brand assets PASS — exact source vectors, PNG dimensions, manifest paths and logo bindings')
