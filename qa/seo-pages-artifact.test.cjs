'use strict';
/* Verify actual GitHub Pages/Jekyll output. No HTTP calls, deployment or git mutation. */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const routes=[
 'index.html','panduan-reseller/index.html','cara-menggunakan-panel-smm/index.html',
 'memilih-provider-smm/index.html','apa-itu-panel-smm/index.html',
 'api-panel-smm-reseller/index.html','kalkulator-harga-jual-reseller-smm/index.html'
];
const mustExist=[...routes,'CNAME','robots.txt','sitemap.xml','favicon.ico','favicon-mrx.svg'];
const prohibited=['qa','review','scripts','.github','_config.yml'];
function verify(paths){
 const present=new Set(paths);
 for(const p of mustExist)assert.ok(present.has(p),'MISSING_PUBLISHED_ASSET:'+p);
 for(const p of prohibited)assert.ok(![...present].some(x=>x===p||x.startsWith(p+'/')),
  'INTERNAL_SOURCE_PUBLISHED:'+p);
 return {requiredAssets:mustExist.length,forbiddenSourceRoots:prohibited.length,filesObserved:paths.length};
}
function allFiles(dir,relative=''){
 const items=[];
 for(const entry of fs.readdirSync(path.join(dir,relative),{withFileTypes:true})){
  const sub=path.posix.join(relative,entry.name);
  assert.ok(!entry.isSymbolicLink(),'UNEXPECTED_SYMLINK:'+sub);
  if(entry.isDirectory())items.push(sub,...allFiles(dir,sub));
  else if(entry.isFile())items.push(sub);
 }
 return items;
}
try{
 if(process.argv.includes('--self-test')){
  const example=mustExist.concat(['assets/example.png']);
  assert.equal(verify(example).requiredAssets,mustExist.length);
  for(const folder of prohibited){
   assert.throws(()=>verify(example.concat([folder+'/private.txt'])),
    new RegExp('INTERNAL_SOURCE_PUBLISHED:'+folder.replace('.','\\.')));
  }
  assert.throws(()=>verify(example.filter(x=>x!=='index.html')),/MISSING_PUBLISHED_ASSET:index.html/);
  console.log('PAGES_ARTIFACT_BOUNDARY_NEGATIVE_PASS=6/6');
 }else{
  const arg=process.argv.find(x=>x.startsWith('--path='));
  assert.ok(arg,'USAGE: node qa/seo-pages-artifact.test.cjs --path=./_site');
  const folder=path.resolve(arg.slice(7));
  assert.ok(fs.statSync(folder).isDirectory(),'OUTPUT_NOT_DIRECTORY');
  const files=allFiles(folder);
  const report=verify(files);
  assert.equal(fs.readFileSync(path.join(folder,'CNAME'),'utf8').trim(),'mrxpanel.com','CNAME_MISMATCH');
  for(const route of routes){
   const html=fs.readFileSync(path.join(folder,route),'utf8');
   assert.match(html,/<h1\b/i,'MISSING_H1:'+route);
  }
  console.log('GITHUB_PAGES_ARTIFACT_QA_PASS='+JSON.stringify(report));
 }
}catch(e){console.error('GITHUB_PAGES_ARTIFACT_QA_FAIL|'+e.message);process.exitCode=2}
