#!/usr/bin/env node
/** W1.6 offline fixed-price rehearsal: NO real customers, charges, site builds or emails. */
import assert from 'node:assert/strict'
import {mkdirSync,readFileSync,writeFileSync} from 'node:fs'
const c=JSON.parse(readFileSync('lib/commercial-offers.json','utf8'))
const out='qa-evidence/w1-c-synthetic'
mkdirSync(out,{recursive:true})
assert.equal(c.status,'PENDING_COMMERCIAL_LEGAL_TAX_COST_HOSTING_APPROVAL')
const quote=(service,scope)=>{
 const p=c.build.find(x=>x.id===service);assert.ok(p)
 if(service==='rebuild' && scope.oldUrls>p.redirects) throw new Error('PRECONTRACT_SPECIAL_MIGRATION_SCOPE_REQUIRED')
 if(scope.productRecords>p.standardProductRecords) throw new Error('PRECONTRACT_COMPLEX_CATALOG_SCOPE_REQUIRED')
 if(scope.thirdLocale && !scope.thirdLocaleFeasible) throw new Error('THIRD_LANGUAGE_PRECONTRACT_REVIEW_REQUIRED')
 if(scope.unrelatedCustomFeature) throw new Error('DIFFERENT_BESPOKE_PROJECT_REQUIRES_PRIOR_SCOPE')
 const total=p.price
 const milestones=c.payments.map((percentage,i)=>({stage:['contract_signed','preview_acceptance','handover'][i],percentage,amount:total*percentage/100,paid:false}))
 return {service,price:total,scope,firstYearBasicHostingIncluded:true,domainAllowanceCNY:150,durableInquiryReceiptRequired:true,clientSignoff:false,realSiteDelivered:false,milestones}
}
const cases=[
 quote('launch',{productRecords:20,oldUrls:0,ordinaryExtraPages:true,inScopeCorrections:true}),
 quote('launch',{productRecords:50,oldUrls:0,thirdLocale:true,thirdLocaleFeasible:true}),
 quote('rebuild',{productRecords:15,oldUrls:8}),
 quote('rebuild',{productRecords:50,oldUrls:10,inScopeCorrections:true})
]
assert.deepEqual(cases.map(x=>x.price),[9800,9800,9800,9800])
assert.deepEqual(cases[0].milestones.map(m=>m.amount),[4900,3920,980])
const negativeAttempts=[
 ['11th legacy URL',()=>quote('rebuild',{productRecords:20,oldUrls:11})],
 ['51st record',()=>quote('launch',{productRecords:51,oldUrls:0})],
 ['unapproved third-language layout',()=>quote('launch',{productRecords:15,oldUrls:0,thirdLocale:true,thirdLocaleFeasible:false})],
 ['unrelated custom feature',()=>quote('launch',{productRecords:15,oldUrls:0,unrelatedCustomFeature:true})]
]
negativeAttempts.forEach(([name,fn])=>assert.throws(fn,undefined,name))
const negatives=[
 ...negativeAttempts.map(([name])=>({name,status:'BLOCKED_PRECONTRACT_REVIEW_REQUIRED'})),
 ...['unverified-business-facts','missing-privacy-consent','WhatsApp-click-is-not-an-accepted-inquiry','automatic-checkout-P3-frozen','imaginary-signed-contract','imaginary-delivered-website','unapproved-hosting-renewal-fee'].map(name=>({name,status:'BLOCKED'}))
]
const result={status:'OFFLINE_REHEARSAL_PASS__CLIENT_HOSTING_COST_GATES_PENDING',version:c.version,scenarios:cases,negativeGuards:negatives,realPayments:0,realLeads:0,realDeliveredSites:0}
writeFileSync(out+'/result.json',JSON.stringify(result,null,2)+'\n')
writeFileSync(out+'/summary.md',['# W1.6 one-price offline simulation','', 'Four standard scenarios priced at ¥9,800, including ordinary pages, sourced products, in-scope corrections, eligible 3rd language and 10 legacy URLs.','',String(negatives.length)+' negative controls blocked.','', 'No real customers, payments, signed contracts, hosting allocations or delivered sites.'].join('\n')+'\n')
console.log(JSON.stringify({status:result.status,scenarios:cases.length,negativeGuards:negatives.length,prices:cases.map(x=>x.price),realPayments:0}))
