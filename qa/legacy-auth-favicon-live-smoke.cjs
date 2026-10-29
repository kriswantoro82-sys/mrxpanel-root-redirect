'use strict';
/**
 * MRXPANEL legacy bridge/favicon PUBLIC smoke, HTTP GET only.
 * Manual, non-mutating check. No login, POST, deployment or indexing requests.
 *
 * node qa/legacy-auth-favicon-live-smoke.cjs --mode=baseline
 * node qa/legacy-auth-favicon-live-smoke.cjs --mode=postdeploy
 *
 * Not an authorization to merge/deploy and not a Google indexing verdict.
 */
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const host = 'https://mrxpanel.com';
const destination = 'https://member.mrxpanel.com/';
const expectedIcoSha256 = 'd665d7c54f9af6c016be108b43be2d2de3965581326d377fc3f5a7b6795b2d07';
const mode = process.argv.find(x => x.startsWith('--mode='))?.slice('--mode='.length);
if(!['baseline','postdeploy'].includes(mode)){
 console.error('USAGE: node qa/legacy-auth-favicon-live-smoke.cjs --mode=baseline|postdeploy');
 process.exit(2);
}
const checks=[];
const mark=(label,passed,detail={})=>{
 checks.push({label,passed:!!passed,...detail});
 console.log((passed?'PASS ':'FAIL ')+label);
};
async function fetchPublic(path){
 const response=await fetch(host+path,{
  method:'GET',redirect:'follow',cache:'no-store',
  headers:{'Accept':'text/html,image/x-icon,image/svg+xml,*/*','Cache-Control':'no-cache'},
  signal:AbortSignal.timeout(15000)
 });
 const data=Buffer.from(await response.arrayBuffer());
 return {status:response.status,url:response.url,contentType:response.headers.get('content-type'),data};
}
function icoFrames(buffer){
 if(buffer.length<6||buffer.readUInt16LE(0)!==0||buffer.readUInt16LE(2)!==1) return false;
 const sizes=[16,32,48,64];
 if(buffer.readUInt16LE(4)!==sizes.length)return false;
 const sig=Buffer.from([137,80,78,71,13,10,26,10]);
 let previousEnd=6+16*sizes.length;
 for(let i=0;i<sizes.length;i++){
  const n=6+i*16;
  const w=buffer.readUInt8(n)||256, h=buffer.readUInt8(n+1)||256;
  const len=buffer.readUInt32LE(n+8),off=buffer.readUInt32LE(n+12);
  if(w!==sizes[i]||h!==sizes[i]||off<previousEnd||off+len>buffer.length)return false;
  if(!buffer.subarray(off,off+8).equals(sig))return false;
  if(buffer.readUInt32BE(off+16)!==sizes[i]||buffer.readUInt32BE(off+20)!==sizes[i])return false;
  previousEnd=off+len;
 }
 return previousEnd===buffer.length;
}
(async()=>{
 for(const route of ['/auth/login/','/auth/register/']){
  try{
   const page=await fetchPublic(route),html=page.data.toString('utf8');
   const refresh=[...html.matchAll(/<meta\b[^>]*http-equiv="refresh"[^>]*>/gi)]
     .map(x=>x[0].match(/\bcontent="([^"]+)"/i)?.[1]||'');
   const noindex=[...html.matchAll(/<meta\b[^>]*name="robots"[^>]*>/gi)]
     .map(x=>x[0].match(/\bcontent="([^"]+)"/i)?.[1]||'');
   const flow=page.status===200&&page.url===host+route&&
     /<html\s+lang="id">/i.test(html)&&/<h1\b/i.test(html)&&
     refresh.length===1&&/^0;\s*url=https:\/\/member\.mrxpanel\.com\/$/.test(refresh[0])&&
     html.includes('<a href="'+destination+'">')&&
     !/<form\b|<input\b[^>]*type="password"/i.test(html);
   mark('legacy auth bridge '+route,flow,{status:page.status,redirect:refresh[0]||null});
   const expectedRobots=mode==='postdeploy'?['noindex,follow']:[];
   mark('robots '+route,JSON.stringify(noindex)===JSON.stringify(expectedRobots),
     {current:noindex,expected:expectedRobots});
  }catch(e){mark('legacy auth bridge '+route,false,{error:String(e.message)})}
 }
 try{
  const favicon=await fetchPublic('/favicon.ico');
  const digest=crypto.createHash('sha256').update(favicon.data).digest('hex');
  const expectation=mode==='baseline'
    ? favicon.status===404
    : favicon.status===200&&favicon.url===host+'/favicon.ico'&&
      favicon.data.length===10865&&digest===expectedIcoSha256&&icoFrames(favicon.data);
  mark('favicon.ico '+mode,expectation,
   {status:favicon.status,length:favicon.data.length,sha256:mode==='postdeploy'?digest:null});
 }catch(e){mark('favicon.ico '+mode,false,{error:String(e.message)})}
 try{
  const vector=await fetchPublic('/favicon-mrx.svg');
  const content=vector.data.toString('utf8');
  mark('favicon-mrx.svg retained',vector.status===200&&vector.url===host+'/favicon-mrx.svg'&&
       /viewBox="0 0 64 64"/.test(content)&&/>MRX<\/text>/.test(content),
       {status:vector.status,length:vector.data.length});
 }catch(e){mark('favicon-mrx.svg retained',false,{error:String(e.message)})}
 const ok=checks.filter(x=>x.passed).length;
 console.log('LEGACY_FAVICON_LIVE_SMOKE='+JSON.stringify({
   mode,passed:ok,total:checks.length,failed:checks.filter(x=>!x.passed),
   checkedAt:new Date().toISOString(),
   scope:'PUBLIC_HTTP_GET_ONLY_NOT_RELEASE_AUTHORIZATION_NOT_INDEX_STATUS'
 }));
 if(ok!==checks.length)process.exitCode=1;
})().catch(e=>{console.error(e.message);process.exitCode=1});
