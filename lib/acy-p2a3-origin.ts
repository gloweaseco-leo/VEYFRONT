/** Restricted P2-A3 browser CSRF guard; never used by production routes. */
export function allowedP2A3Origin(request:Pick<Request,'url'|'headers'>,env:{
  VERCEL_ENV?:string;ACY_P2A3_ALLOWED_ORIGIN?:string
}={VERCEL_ENV:process.env.VERCEL_ENV,ACY_P2A3_ALLOWED_ORIGIN:process.env.ACY_P2A3_ALLOWED_ORIGIN}):boolean{
  if(env.VERCEL_ENV!=='preview')return false
  const permitted=env.ACY_P2A3_ALLOWED_ORIGIN?.trim()||''
  if(!/^https:\/\/veyfront-git-feature-acy-p2a3-[a-z0-9-]+\.vercel\.app$/.test(permitted))return false
  const origin=request.headers.get('origin')
  if(origin){
    try { return origin===permitted&&new URL(origin).origin===permitted }catch{return false}
  }
  return request.headers.get('sec-fetch-site')==='same-origin'
    &&request.headers.get('x-acy-preview-request')==='p2a3'
}
