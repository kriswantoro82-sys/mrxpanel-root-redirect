'use strict';
/* Deterministic static link audit for seven published SEO routes. No HTTP writes. */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const base='https://mrxpanel.com';
const pages=['/','/panduan-reseller/','/cara-menggunakan-panel-smm/','/memilih-provider-smm/',
 '/apa-itu-panel-smm/','/api-panel-smm-reseller/','/kalkulator-harga-jual-reseller-smm/'];
function pageFile(page){return page==='/'?'index.html':page.slice(1)+'index.html'}
const source=new Map(pages.map(page=>[page,fs.readFileSync(path.join(root,pageFile(page)),'utf8')]));
function analyze(overrides=new Map()){
 const docs=new Map();
 for(const [route,original] of source){
  const html=overrides.get(route)??original;
  const hrefs=[...html.matchAll(/<a\b[^>]*\bhref\s*=\s*["']([^"']+)["'][^>]*>/gi)].map(x=>x[1]);
  const ids=new Set([...html.matchAll(/\bid\s*=\s*["']([^"']+)["']/gi)].map(x=>x[1]));
  docs.set(route,{hrefs,ids});
 }
 const internal=new Map(),external=new Map(),errors=[],edges=new Map();
 let totalHref=0;
 for(const [route,{hrefs}] of docs){
  const adjacent=[];
  for(const raw of hrefs){
   totalHref++;
   if(/^(?:mailto:|tel:|javascript:|data:)/i.test(raw))continue;
   let url;
   try{url=new URL(raw,base+route)}catch(e){errors.push({route,raw,error:'invalid URL'});continue}
   if(!['http:','https:'].includes(url.protocol))continue;
   if(!['mrxpanel.com','www.mrxpanel.com'].includes(url.hostname)){
    const canonical=url.origin+url.pathname;
    external.set(canonical,(external.get(canonical)||0)+1);
    continue;
   }
   adjacent.push(url.pathname);
   if(!internal.has(url.pathname))internal.set(url.pathname,[]);
   internal.get(url.pathname).push(route);
   if(url.hash && docs.has(url.pathname)){
    let hash;
    try{hash=decodeURIComponent(url.hash.slice(1))}catch{errors.push({route,raw,error:'malformed URL hash'});continue}
    if(!docs.get(url.pathname).ids.has(hash))errors.push({route,raw,error:'anchor not found'});
   }
  }
  edges.set(route,adjacent);
 }
 const missing=[];
 for(const [target,from] of internal){
  const candidate=path.join(root,target.replace(/^\/+/,''),target.endsWith('/')?'index.html':'');
  const alternate=path.join(root,target.replace(/^\/+/,''),'index.html');
  const file=target==='/'?path.join(root,'index.html'):candidate;
  if(!fs.existsSync(file)&&!fs.existsSync(alternate))missing.push({target,from:from.slice(0,3)});
 }
 const reached=new Set(['/']),queue=['/'];
 while(queue.length){const p=queue.shift();for(const adjacent of edges.get(p)||[]){
  if(docs.has(adjacent)&&!reached.has(adjacent)){reached.add(adjacent);queue.push(adjacent)}
 }}
 const unreachable=pages.filter(x=>!reached.has(x));
 return {pages:pages.length,totalHref,uniqueInternalTargets:internal.size,
  externalTargets:[...external].map(([url,count])=>({url,count})),
  missingFiles:missing,missingAnchors:errors,unreachable};
}
function check(report){
 assert.equal(report.pages,7,'wrong page count');
 assert.equal(report.missingFiles.length,0,'missing route target');
 assert.equal(report.missingAnchors.length,0,'missing target anchor or malformed URL');
 assert.equal(report.unreachable.length,0,'orphan SEO page from homepage');
 assert.ok(report.externalTargets.some(x=>x.url==='https://member.mrxpanel.com/'),'Member Area not linked');
 assert.ok(report.externalTargets.some(x=>x.url==='https://member.mrxpanel.com/api/'),'API docs not linked');
}
try{
 const report=analyze();check(report);
 if(process.argv.includes('--self-test')){
  const inject=(route,from,to)=>{
   const old=source.get(route);
   assert.ok(old.includes(from),'test fixture not present');
   return new Map([[route,old.replace(from,to)]]);
  };
  assert.throws(()=>check(analyze(inject('/api-panel-smm-reseller/',
    'href="/kalkulator-harga-jual-reseller-smm/"','href="/seo-missing-test-route/"'))),/missing route target/);
  const overwrite=new Map();
  for(const [route,html] of source)overwrite.set(route,html.replace(/href="\/apa-itu-panel-smm\/"/g,'href="/"'));
  assert.throws(()=>check(analyze(overwrite)),/orphan SEO page/);
  assert.throws(()=>check(analyze(inject('/','href="/"','href="#missing-anchor-test"'))),/missing target anchor/);
  console.log('MRXPANEL_SEO_LINK_NEGATIVE_QA_PASS=3/3');
 }
 console.log('MRXPANEL_SEO_LINK_QA_PASS='+JSON.stringify(report));
}catch(e){console.error('MRXPANEL_SEO_LINK_QA_FAIL|'+e.message);process.exitCode=2}
