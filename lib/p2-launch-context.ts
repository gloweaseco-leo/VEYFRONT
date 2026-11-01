import {createHash} from 'node:crypto'
export function launchContext(brief:{company:string;markets:string;description:string;desiredAction:string}){
 const facts=Object.entries(brief).filter(([,v])=>Boolean(v.trim())).map(([field,value])=>({field,value,provenance:'CUSTOMER_SELF_REPORTED_UNVERIFIED' as const}))
 const evidenceSha=createHash('sha256').update(JSON.stringify(facts)).digest('hex')
 return {version:'veyfront.launch-context/0.1' as const,source:'CUSTOMER_ONLY_NO_SOURCE_URL' as const,facts,evidenceSha,missing:['industry','offerings','buyer_roles','buyer_tasks','proof_documents'],status:'REVIEW_REQUIRED' as const,cbp2PlannerAuthorized:false as const,modelCalls:0 as const}
}
