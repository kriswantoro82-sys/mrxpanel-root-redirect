'use strict';
/**
 * MRXPANEL public SEO smoke (GET only): baseline vs authorized postdeploy observation.
 * Manual only. No authentication, POST/PUT, indexing, merge, commit or deployment.
 * node qa/seo-postdeploy-live-smoke.cjs --mode=baseline
 * node qa/seo-postdeploy-live-smoke.cjs --mode=postdeploy
 * A PASS is NOT permission to release or proof of Google indexing.
 */
const assert = require('node:assert/strict');
const base = 'https://mrxpanel.com';
const routes = [
  '/', '/panduan-reseller/', '/cara-menggunakan-panel-smm/',
  '/memilih-provider-smm/', '/apa-itu-panel-smm/',
  '/api-panel-smm-reseller/', '/kalkulator-harga-jual-reseller-smm/'
];
const sources = routes.filter(x => x !== '/kalkulator-harga-jual-reseller-smm/');
const baselineLinks = new Set(['/', '/panduan-reseller/', '/memilih-provider-smm/']);
// The site is published from GitHub Pages main/root; these source files must NOT be published.
const internalSourcePaths = [
  '/qa/main-safety-baseline.cjs',
  '/review/github-pages-main-release-gate-20261030.md',
  '/scripts/seo_review_check.py'
];
const isMissingPublicSource = (status, finalUrl, expectedUrl) =>
  status === 404 && finalUrl === expectedUrl;
if (process.argv.includes('--self-test')) {
  assert.ok(isMissingPublicSource(404,base+'/qa/main-safety-baseline.cjs',base+'/qa/main-safety-baseline.cjs'));
  assert.equal(isMissingPublicSource(200,base+'/qa/main-safety-baseline.cjs',base+'/qa/main-safety-baseline.cjs'),false);
  assert.equal(isMissingPublicSource(403,base+'/qa/main-safety-baseline.cjs',base+'/qa/main-safety-baseline.cjs'),false);
  assert.equal(isMissingPublicSource(404,base+'/unexpected/',base+'/qa/main-safety-baseline.cjs'),false);
  console.log('PUBLISH_BOUNDARY_SMOKE_NEGATIVE_PASS=3/3');
  process.exit(0);
}
const mode = process.argv.find(x => x.startsWith('--mode='))?.slice(7);
if (!['baseline', 'postdeploy'].includes(mode)) {
  console.error('USAGE: node qa/seo-postdeploy-live-smoke.cjs --mode=baseline|postdeploy');
  process.exit(2);
}
const results = [];
const record = (test, ok, details={}) => {
  results.push({test, pass:!!ok, ...details});
  console.log((ok?'PASS ':'FAIL ')+test);
};
const findOne=(body,re)=>[...body.matchAll(re)];
async function get(url) {
  const response = await fetch(url, {
    method:'GET',redirect:'follow',cache:'no-store',
    headers:{'Accept':'text/html,application/xml;q=0.9,*/*;q=0.7','Cache-Control':'no-cache'},
    signal:AbortSignal.timeout(18000)
  });
  return {status:response.status,url:response.url,body:await response.text()};
}
(async()=>{
  for(const route of routes){
    try{
      const expected=base+route, p=await get(expected);
      const canon=findOne(p.body,/<link\b[^>]*rel="canonical"[^>]*>/gi);
      const canonical=canon[0]?.[0].match(/\bhref="([^"]+)"/i)?.[1]||null;
      const robots=findOne(p.body,/<meta\b[^>]*name="robots"[^>]*>/gi)
        .map(x=>x[0].match(/\bcontent="([^"]+)"/i)?.[1]||'');
      const ok=p.status===200&&p.url===expected&&canon.length===1&&canonical===expected&&robots.length===1&&robots[0]==='index,follow'&&/<h1\b/i.test(p.body);
      record('page '+route,ok,{status:p.status,finalUrl:p.url,canonical,robots});
      if(sources.includes(route)){
        const target='/kalkulator-harga-jual-reseller-smm/';
        const links=findOne(p.body,/<a\b[^>]*href="([^"]+)"[^>]*>/gi)
          .map(x=>x[1]).filter(x=>x===target||x===base+target);
        const should=mode==='postdeploy'||baselineLinks.has(route);
        record('calculator link '+route,should?links.length>=1:links.length===0,
          {links:links.length,expected:should?'at-least-one':'none'});
      }
      if(route==='/'){
        if(mode==='postdeploy'){
          record('published homepage FAQ and legal attribution',
            p.body.includes('Bantuan Verifikasi Email')&&
            p.body.includes('PT Mrxpanel Media Group')&&
            p.body.includes('Bagaimana jika email verifikasi pendaftaran tidak diterima?'));
        }
      }
      if(route==='/api-panel-smm-reseller/'&&mode==='postdeploy')
        record('published API calculator context',
          p.body.includes('kalkulator harga jual dan laba bersih reseller'));
    }catch(e){record('page '+route,false,{error:String(e.message)})}
  }
  try{
    const map=await get(base+'/sitemap.xml');
    const entries=[...map.body.matchAll(/<url>\s*<loc>([^<]+)<\/loc>\s*<lastmod>([^<]+)<\/lastmod>\s*<\/url>/g)]
      .map(x=>({url:x[1],lastmod:x[2]}));
    const valid=entries.length===routes.length
      &&entries.every((x,i)=>x.url===base+routes[i]&&/^\d{4}-\d{2}-\d{2}$/.test(x.lastmod));
    record('sitemap seven canonical URLs and lastmod',map.status===200&&valid,
      {status:map.status,entries});
  }catch(e){record('sitemap seven canonical URLs and lastmod',false,{error:e.message})}
  for(const route of ['/signup/','/signin/']){
    try{
      const p=await get(base+route);
      const hasMetaRefresh=/<meta\s+http-equiv="refresh"\s+content="0;\s*url=https:\/\/member\.mrxpanel\.com\/"/i.test(p.body);
      record('member bridge '+route,p.status===200&&p.url===base+route&&hasMetaRefresh,
        {status:p.status,finalUrl:p.url,hasMetaRefresh});
    }catch(e){record('member bridge '+route,false,{error:e.message})}
  }
  if(mode==='postdeploy'){
    // Source exclusion must be verified on the LIVE Pages build, not assumed from _config.yml.
    for(const route of internalSourcePaths){
      try{
        const p=await get(base+route);
        record('internal source not published '+route,
          isMissingPublicSource(p.status,p.url,base+route),
          {status:p.status,finalUrl:p.url});
      }catch(e){record('internal source not published '+route,false,{error:String(e.message)})}
    }
  }
  const count=results.filter(x=>x.pass).length,full=results.length;
  console.log('MRXPANEL_SEO_LIVE_SMOKE='+JSON.stringify({
    mode,passed:count,total:full,failed:results.filter(x=>!x.pass),
    statement:'READ_ONLY_OBSERVATION_NOT_RELEASE_AUTHORIZATION_NOT_GOOGLE_INDEX_STATUS',
    checkedAt:new Date().toISOString()
  }));
  if(count!==full)process.exitCode=1;
})().catch(e=>{console.error(e.message);process.exitCode=1});
