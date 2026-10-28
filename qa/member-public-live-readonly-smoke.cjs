'use strict';
// CMO read-only PUBLIC anonymous Member Area release smoke.
// No credentials, cookies, sign-in, post, browser activation, customer data, or mutations.
// Exactly two GETs max, limited to official Member Area origin.
const https = require('node:https');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');

const ORIGIN = 'https://member.mrxpanel.com';
const sha = buffer => crypto.createHash('sha256').update(buffer).digest('hex');
async function getPinned(url, maxBytes, depth=0) {
  const u=new URL(url);
  assert.equal(u.origin, ORIGIN, 'UNEXPECTED_ORIGIN');
  assert.equal(u.username, '', 'URL_USERINFO_FORBIDDEN');
  assert.equal(u.password, '', 'URL_USERINFO_FORBIDDEN');
  assert.equal(u.search, '', 'QUERY_STRING_FORBIDDEN');
  assert.equal(u.hash, '', 'FRAGMENT_FORBIDDEN');
  if (depth>2) throw Error('REDIRECT_LIMIT');
  return new Promise((resolve,reject)=>{
    const req=https.request(u,{
      method:'GET',
      headers:{'Accept':'text/html,application/javascript,*/*;q=0.1','User-Agent':'MRXPANEL-CMO-ReadOnly-Public-Smoke/1'},
      timeout:12000
    },res=>{
      const status=res.statusCode||0;
      if([301,302,303,307,308].includes(status)){
        const next = res.headers.location;
        res.resume();
        if(!next) return reject(Error('REDIRECT_WITHOUT_LOCATION'));
        let parsed;try{parsed=new URL(next,u)}catch{return reject(Error('INVALID_REDIRECT_URL'))}
        if(parsed.origin!==ORIGIN || parsed.search || parsed.hash) return reject(Error('UNSAFE_REDIRECT'));
        return resolve(getPinned(parsed.href,maxBytes,depth+1));
      }
      if(status!==200){res.resume();return reject(Error('PUBLIC_HTTP_'+status))}
      const chunks=[];let count=0;
      res.on('data',chunk=>{
        count+=chunk.length;
        if(count>maxBytes) req.destroy(Error('RESPONSE_TOO_LARGE'));
        else chunks.push(chunk);
      });
      res.on('end',()=>resolve({buffer:Buffer.concat(chunks),contentType:String(res.headers['content-type']||''),path:u.pathname,status}));
      res.on('error',reject);
    });
    req.on('timeout',()=>req.destroy(Error('TIMEOUT')));
    req.on('error',reject);
    req.end();
  });
}

(async()=>{
  const root=await getPinned(ORIGIN+'/',524288);
  if(!root.contentType.includes('text/html')) throw Error('ROOT_NOT_HTML');
  const html=root.buffer.toString('utf8');
  if(!/<html\b/i.test(html)) throw Error('NO_HTML_ROOT');
  const scripts=[...html.matchAll(/<script\b[^>]*\bsrc=["']([^"']+\.js(?:\?[^"']*)?)["']/gi)].map(x=>x[1]);
  const local=scripts.map(s=>{try{return new URL(s,ORIGIN+'/')}catch{return null}}).find(x=>x?.origin===ORIGIN && x.pathname.endsWith('.js') && !x.search && !x.hash);
  const report={
    schema:'MRXPANEL_MEMBER_PUBLIC_READONLY_SMOKE_V1',
    site:'member.mrxpanel.com',
    rootStatus:root.status,
    rootPath:root.path,
    rootHtmlSha256:sha(root.buffer),
    moduleAssetFound:!!local,
    baselineArchiveSha256:'fda1428762babbbc58bd9e9bcb5db31262cc1e41283f4038faf04dccbe746735',
    publicRequestsMaximum:2
  };
  if(!local) {
    console.log(JSON.stringify({...report,result:'HOLD_NO_SCRIPT_ASSET'}));
    process.exitCode=2;
    return;
  }
  const js=await getPinned(local.href,4*1024*1024);
  if(!/(javascript|text\/plain|application\/octet-stream)/i.test(js.contentType))
    throw Error('ASSET_UNEXPECTED_CONTENT_TYPE');
  const digest=sha(js.buffer);
  console.log(JSON.stringify({
    ...report,
    result:'PUBLIC_RESPONSE_OK_NOT_MEMBER_APP_VALIDATED',
    assetPath:local.pathname,
    assetStatus:js.status,
    assetBytes:js.buffer.length,
    assetSha256:digest,
    matchesKnownArchive:digest===report.baselineArchiveSha256,
    registrationIntentLiteralPresent:js.buffer.includes(Buffer.from('auth=register')),
    actualLoginRegisterRecoveryBrowserTest:'NOT_PERFORMED',
    customerConversionTest:'NOT_PERFORMED',
    productionMutations:0
  }));
})().catch(e=>{
  const allow=/^[A-Z0-9_]+$/;
  const reason=String(e?.message||'UNKNOWN');
  console.log(JSON.stringify({
    schema:'MRXPANEL_MEMBER_PUBLIC_READONLY_SMOKE_V1',
    result:'HOLD_LIVE_PUBLIC_PROBE',
    reason:allow.test(reason)?reason:'UNCLASSIFIED_PROBE_FAILURE',
    productionMutations:0
  }));
  process.exitCode=2;
});
