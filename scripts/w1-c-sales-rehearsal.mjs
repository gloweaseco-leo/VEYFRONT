#!/usr/bin/env node
/** W1-C OFFLINE synthetic sale journey; NEVER contact a real customer or initiate payment. */
import assert from 'node:assert/strict'
import {mkdirSync,readFileSync,writeFileSync} from 'node:fs'
const c=JSON.parse(readFileSync('lib/commercial-offers.json','utf8'))
const dir='qa-evidence/w1-c-synthetic'
mkdirSync(dir,{recursive:true})
assert.equal(c.status,'PENDING_COMMERCIAL_LEGAL_TAX_COST_APPROVAL')
const chosen=(id)=>{const p=c.build.find(x=>x.id===id);assert.ok(p);return p}
function price(id,{migrate=false,buyerContent=false,extraPage=false}={}) {
  const p=chosen(id)
  if(migrate)assert.equal(id,'rebuild','Legacy continuity only applies to Rebuild')
  const total=p.price+(migrate?c.migration.additionalPrice:0)+(buyerContent?c.contentEnhancement.startingPrice:0)+(extraPage?c.addons.find(a=>a.id==='page').price:0)
  assert.equal(c.payments.reduce((x,y)=>x+y,0),100)
  const milestones=c.payments.map((percentage,index)=>({stage:['signed_kickoff','accepted_preview','final_handover'][index],percentage,amount:Math.round(total*percentage/100),status:'NOT_PAID_OFFLINE_SIMULATION'}))
  assert.equal(milestones.reduce((a,b)=>a+b.amount,0),total)
  return {service:id,scope:{pages:p.pages,productRecords:p.records,languages:p.languages,caseEvidence:p.cases,standardRedirects:p.redirects,migrationMaxRedirects:migrate?c.migration.maxRedirects:0,buyerContentSeries:buyerContent?1:0},total,milestones,actualLead:false,realCustomerSignature:false,realWebsiteDelivered:false,priceLegallyBinding:false}
}
const cases=[
  price('launch'),
  price('rebuild'),
  price('rebuild',{migrate:true}),
  price('launch',{buyerContent:true}),
  price('rebuild',{migrate:true,buyerContent:true})
]
assert.deepEqual(cases.map(a=>a.total),[9800,9800,12800,14800,17800])
assert.deepEqual(cases[0].milestones.map(m=>m.amount),[4900,3920,980])
assert.deepEqual(cases[2].milestones.map(m=>m.amount),[6400,5120,1280])
const negatives=[
  ['unverified-business-facts','BLOCKED: must verify against client sources'],
  ['missing-consent','BLOCKED: must acquire explicit data consent'],
  ['complex-legacy-migration-without-quote','BLOCKED: <=10 redirects only when add-on selected, no custom CMS'],
  ['auto-checkout','BLOCKED: P3 is frozen'],
  ['fake-signed-contract','BLOCKED: no verified client or seller signature'],
  ['mark-website-delivered','BLOCKED: simulation has no actual website'],
  ['WhatsApp-click-as-confirmed-lead','BLOCKED: external click does not prove receipt'],
]
const report={status:'OFFLINE_REHEARSAL_PASS__BUSINESS_GATES_PENDING',version:c.version,simulatedScenarios:cases.length,negativeControls:negatives.length,scenarios:cases,blocked:negatives,realLeads:0,realPayments:0,actualSiteDeliveries:0,formalCostApproval:'PENDING',taxLegalOwnerApproval:'PENDING'}
writeFileSync(dir+'/result.json',JSON.stringify(report,null,2)+'\n')
writeFileSync(dir+'/summary.md',[
  '# W1.5 synthetic sales scope / quote QA — no customer data or payments',
  '',
  '| Scenario | Indicative total | 50/40/10 milestones |',
  '|---|---:|---|',
  ...cases.map((v,i)=>'| '+v.service+(v.scope.migrationMaxRedirects?' + continuity':'')+(v.scope.buyerContentSeries?' + content':'')+' | ¥'+v.total+' | '+v.milestones.map(m=>'¥'+m.amount).join(' / ')+' |'),
  '',
  'All invoices, contracts, deliveries, notified leads and payments are NOT REAL. Seven prohibited cases remain blocked by commercial policy.'
].join('\n')+'\n')
console.log(JSON.stringify({status:report.status,scenarios:cases.length,negativeControls:negatives.length,prices:cases.map(x=>x.total),realPayments:0}))
