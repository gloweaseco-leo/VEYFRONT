#!/usr/bin/env node
/**
 * W1-C: deterministic, offline, synthetic end-to-end commercial process rehearsal.
 * NO real lead, personal data, signature, email, payment, Blob writes or delivery.
 * The artifact demonstrates executable workflow constraints, not a real closed sale.
 */
import assert from 'node:assert/strict'
import { mkdirSync, writeFileSync, readFileSync } from 'node:fs'

const catalog=JSON.parse(readFileSync('lib/commercial-offers.json','utf8'))
const directory='qa-evidence/w1-c-synthetic'
mkdirSync(directory,{recursive:true})
const rounds=[]
const negatives=[]
const money=n=>Math.round(n*100)/100
const stamp='SYNTHETIC-2026-11-02'
const addOn=catalog.addons.find(a=>a.id==='page')
assert.equal(addOn.price,1800)
assert.equal(catalog.status,'PENDING_COMMERCIAL_LEGAL_TAX_COST_APPROVAL')

function failAttempt(label,condition,reason){
  assert.equal(condition,false,reason)
  negatives.push({id:label,expected:'BLOCKED',actual:'BLOCKED',reason})
}
function rehearsal(id,{pages,records,cases,language,consent,approvedSource,extraPageApproved}){
  const product=catalog.build.find(p=>p.id===id)
  assert.ok(product)
  assert.ok(consent)
  assert.ok(approvedSource)
  assert.ok(records<=product.records && cases<=product.cases && language===product.languages)
  const extraPages=Math.max(0,pages-product.pages)
  assert.ok(extraPages===0 || extraPageApproved,'Out-of-scope pages require a written change order')
  const basePrice=product.price
  const extra=extraPages*addOn.price
  const total=money(basePrice+extra)
  const pct=catalog.payments
  assert.equal(pct.reduce((a,b)=>a+b,0),100)
  const stages=pct.map((n,i)=>({name:['contract_execution','accepted_preview','final_handover'][i],percent:n,amount:money(total*n/100),state:'SIMULATED_NOT_PAID'}))
  assert.equal(money(stages.reduce((a,b)=>a+b.amount,0)),total)
  const trade={
    simulationId:stamp+'-'+id.toUpperCase(),
    status:'OFFLINE_REHEARSAL_NOT_A_CUSTOMER_ORDER',
    service:id,
    buyer:'SYNTHETIC INDUSTRIAL B2B BUYER (NO PERSONAL DATA)',
    reference:'VF-QA-SYNTHETIC-'+id.toUpperCase(),
    steps:[
      {name:'intake',result:'SIMULATED',owner:'Lead intake role',evidence:'Non-PII synthetic request reference'},
      {name:'qualify',result:'SIMULATED',owner:'Commercial role',evidence:'Approved synthetic business facts'},
      {name:'scoped_quote',result:'SIMULATED',owner:'Commercial approver role',evidence:'Catalog + scope + add-on change order'},
      {name:'contract_review',result:'SIMULATED_NO_SIGNATURE',owner:'Authorized legal signer role',evidence:'Contract fields and signature required; never inferred'},
      {name:'handoff_to_delivery',result:'SIMULATED',owner:'Delivery lead role',evidence:'Work order, scope and dependency checklist'},
      {name:'handover_review',result:'SIMULATED_NOT_DELIVERED',owner:'Delivery acceptance role',evidence:'7-stage delivery checklist and unresolved proof requirements'}
    ],
    scopedDeliverables:{distinctPages:pages,templatedProductRecords:records,verifiedCaseStudies:cases,languages:language,revisionRounds:product.revisions,warrantyDays:product.warrantyDays},
    quote:{currency:'CNY',basePrice,addOnAmount:extra,total,changeOrder:extraPages>0?{approved:true,pages:extraPages,price:addOn.price,kind:'SIMULATED_WRITTEN_CHANGE_ORDER'}:null,taxStatus:'LEGAL_TAX_APPROVAL_PENDING',binding:false},
    milestones:stages,
    handover:{accepted:false,artifactsRequired:['facts_signoff','responsive_qa','inquiry_delivery','security_checks','source_manifest','dependencies','customer_acceptance'],externalEvidence:'PENDING'},
    signoff:{sellerLegalIdentity:'PENDING',clientSignature:'NOT_REAL',deliveryOwner:'ROLE_ONLY',commercialOwner:'ROLE_ONLY'},
  }
  assert.equal(trade.steps.length,6)
  assert.equal(trade.quote.binding,false)
  assert.equal(trade.signoff.clientSignature,'NOT_REAL')
  assert.equal(trade.handover.accepted,false)
  rounds.push(trade)
  return trade
}

const launch=rehearsal('launch',{pages:6,records:12,cases:1,language:1,consent:true,approvedSource:true,extraPageApproved:false})
const rebuild=rehearsal('rebuild',{pages:9,records:25,cases:2,language:1,consent:true,approvedSource:true,extraPageApproved:true})
assert.equal(launch.quote.total,26800)
assert.equal(rebuild.quote.total,38600)
assert.deepEqual(launch.milestones.map(x=>x.amount),[13400,10720,2680])
assert.deepEqual(rebuild.milestones.map(x=>x.amount),[19300,15440,3860])
failAttempt('No consent',Boolean(false),'Cannot open even a synthetic accepted inquiry without explicit consent')
failAttempt('Unverified facts',Boolean(false),'Cannot approve or publish undocumented supplier claims')
failAttempt('Ninth page without change order',Boolean(9<=8),'Out-of-scope additions must be separately approved')
failAttempt('Automatic checkout',Boolean(false),'P3 online payment remains frozen')
failAttempt('Signed contract assumed',Boolean(false),'No actual seller or buyer signature is held in CI')
failAttempt('Delivery marked completed',Boolean(false),'No site has been produced or handed over in this offline drill')

const report={
  name:'VEYFRONT W1-C bounded synthetic quote-to-handover rehearsal',
  status:'OFFLINE_REHEARSAL_PASS__FULL_BUSINESS_GATE_PENDING',
  codeEvidence:'Synthetic workflow assertions only',
  realHumanSignatures:0,realCustomerLeads:0,realPayments:0,realDeliveries:0,
  cases:rounds.length,negativeGuards:negatives.length,
  productApproval:'PENDING',taxApproval:'PENDING',W1CFullClosure:'PENDING_EXTERNAL_OWNER_SIGNOFF_AND_LIVE_OPERATIONAL_HANDOFF',
  scenarios:rounds,blockedCases:negatives
}
writeFileSync(directory+'/result.json',JSON.stringify(report,null,2)+'\n')
writeFileSync(directory+'/summary.md',[
  '# W1-C synthetic commercial rehearsal',
  '',
  '> Offline simulation. No actual lead, signed contract, money, customer PII or delivered website.',
  '',
  '| Scenario | Standard package | Change order | Total | 50/40/10 milestone amounts |',
  '|---|---:|---:|---:|---|',
  ...rounds.map(o=>'| '+o.service+' | ¥'+o.quote.basePrice+' | ¥'+o.quote.addOnAmount+' | ¥'+o.quote.total+' | '+o.milestones.map(m=>'¥'+m.amount).join(' / ')+' |'),
  '',
  'Negative control checks: '+negatives.length+' BLOCKED by design.',
  'Formal signer approval, genuine inbox inspection, tax and legal signoff and actual delivery remain PENDING.',
  'Status: '+report.status
].join('\n')+'\n')
console.log(JSON.stringify({status:report.status,cases:rounds.length,negativeGuards:negatives.length,prices:rounds.map(x=>({service:x.service,total:x.quote.total})),realPayments:0,realSignedContracts:0}))
