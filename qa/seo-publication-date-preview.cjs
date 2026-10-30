'use strict';
/* Preview hypothetical dates in memory. NO write, merge, deploy or release approval. */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const root=path.resolve(__dirname,'..');
const selected=[
 {route:'/',file:'index.html',type:'home'},
 {route:'/cara-menggunakan-panel-smm/',file:'cara-menggunakan-panel-smm/index.html',type:'time'},
 {route:'/apa-itu-panel-smm/',file:'apa-itu-panel-smm/index.html',type:'prose'},
 {route:'/api-panel-smm-reseller/',file:'api-panel-smm-reseller/index.html',type:'schema'}
];
const months=['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
const digest=s=>crypto.createHash('sha256').update(s).digest('hex');
function validDate(s) {
 return /^\d{4}-\d{2}-\d{2}$/.test(s||'') && !Number.isNaN(Date.parse(s+'T00:00:00Z')) &&
  new Date(s+'T00:00:00Z').toISOString().slice(0,10)===s;
}
function idDate(s){const [y,m,d]=s.split('-').map(Number);return d+' '+months[m-1]+' '+y}
function replaceOne(s,oldValue,newValue,label){
 const i=s.indexOf(oldValue);
 assert.ok(i>=0,label+' missing original');
 assert.equal(s.indexOf(oldValue,i+oldValue.length),-1,label+' duplicated');
 return s.slice(0,i)+newValue+s.slice(i+oldValue.length);
}
function articleInfo(html,route){
 const scripts=[...html.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)]
  .map(m=>JSON.parse(m[1])).filter(x=>x && x['@type']==='Article');
 assert.equal(scripts.length,1,route+' Article count');
 const a=scripts[0];
 assert.ok(validDate(a.datePublished)&&validDate(a.dateModified),route+' invalid Article dates');
 return a;
}
function simulate(date,overrides={}){
 assert.ok(validDate(date),'VALID_PREVIEW_DATE_REQUIRED');
 const sitemap=fs.readFileSync(path.join(root,'sitemap.xml'),'utf8');
 let proposedMap=sitemap;
 const changes=[];
 for(const item of selected){
  const old=overrides[item.file]??fs.readFileSync(path.join(root,item.file),'utf8');
  const url='https://mrxpanel.com'+item.route;
  const canonical=[...old.matchAll(/<link\b[^>]*rel="canonical"[^>]*>/gi)];
  assert.equal(canonical.length,1,item.route+' canonical count');
  assert.ok(canonical[0][0].includes('href="'+url+'"'),item.route+' canonical mismatch');
  let next=old,modified=null,published=null;
  if(item.type!=='home'){
   const a=articleInfo(old,item.route);
   modified=a.dateModified;published=a.datePublished;
   assert.ok(date>=published && date>=modified,item.route+' preview predates source Article');
   next=replaceOne(next,'"dateModified":"'+modified+'"','"dateModified":"'+date+'"',item.route+' schema date');
   if(item.type==='time'){
    next=replaceOne(next,'<time datetime="'+modified+'">Diperbarui '+idDate(modified)+'</time>',
     '<time datetime="'+date+'">Diperbarui '+idDate(date)+'</time>',item.route+' visible time');
   }else if(item.type==='prose'){
    next=replaceOne(next,'Diterbitkan '+idDate(published)+'; diperbarui '+idDate(modified),
     'Diterbitkan '+idDate(published)+'; diperbarui '+idDate(date),item.route+' visible prose');
   }
   const after=articleInfo(next,item.route);
   assert.equal(after.datePublished,published,item.route+' published date must remain');
   assert.equal(after.dateModified,date,item.route+' modified date mismatch');
  }
  const prefix='<loc>'+url+'</loc><lastmod>';
  const at=proposedMap.indexOf(prefix);
  assert.ok(at>=0,item.route+' sitemap URL missing');
  assert.equal(proposedMap.indexOf(prefix,at+prefix.length),-1,item.route+' duplicate sitemap URL');
  const start=at+prefix.length;
  const end=proposedMap.indexOf('</lastmod>',start);
  assert.ok(end>=0,item.route+' sitemap lastmod missing');
  const oldMod=proposedMap.slice(start,end);
  assert.ok(validDate(oldMod),item.route+' invalid sitemap date');
  assert.ok(date>=oldMod,item.route+' preview predates sitemap');
  proposedMap=proposedMap.slice(0,start)+date+proposedMap.slice(end);
  changes.push({route:item.route,file:item.file,publishedDatePreserved:published,
   schemaBefore:modified,schemaPreview:item.type==='home'?null:date,
   sitemapBefore:oldMod,sitemapPreview:date,
   htmlChanged:old!==next,originalHtmlSha256:digest(old),previewHtmlSha256:digest(next)});
 }
 assert.equal([...proposedMap.matchAll(/<loc>[^<]+<\/loc>/g)].length,7,'All seven sitemap URLs retained');
 return {hypotheticalDate:date,releaseAuthorized:false,filesWritten:0,productionModified:false,
  originalSitemapSha256:digest(sitemap),previewSitemapSha256:digest(proposedMap),changes};
}
try{
 if(process.argv.includes('--self-test')){
  const v=simulate('2026-10-30');
  assert.equal(v.changes.length,4);
  assert.equal(v.changes.filter(x=>x.htmlChanged).length,3);
  assert.throws(()=>simulate('2026-02-30'),/VALID_PREVIEW_DATE_REQUIRED/);
  assert.throws(()=>simulate('2026-10-01'),/predates/);
  const file='cara-menggunakan-panel-smm/index.html';
  const original=fs.readFileSync(path.join(root,file),'utf8');
  assert.throws(()=>simulate('2026-10-30',{[file]:original.replace('Diperbarui 24 Oktober 2026','Diperbarui 23 Oktober 2026')}),/visible time/);
  assert.equal(articleInfo(fs.readFileSync(path.join(root,'api-panel-smm-reseller/index.html'),'utf8'),
   '/api-panel-smm-reseller/').datePublished,'2026-10-24');
  console.log('SEO_DATE_PREVIEW_SELF_TEST_PASS|SELECTIVE=4|NEGATIVE=3|FILES_WRITTEN=0');
 }else{
  const arg=process.argv.find(x=>x.startsWith('--date='));
  assert.ok(arg,'Provide hypothetical --date=YYYY-MM-DD');
  console.log(JSON.stringify({status:'SIMULATION_ONLY_NOT_RELEASE_APPROVAL',...simulate(arg.slice(7))},null,2));
 }
}catch(e){console.error('SEO_DATE_PREVIEW_HOLD|'+e.message);process.exitCode=2}
