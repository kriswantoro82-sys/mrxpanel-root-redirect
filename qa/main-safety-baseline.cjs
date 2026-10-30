'use strict';
/* Future-proof, read-only baseline for EVERY PR targeting main.
 * No secrets, networks, credentials, deployment or Git mutations.
 * This job has NO date / draft approval or image-choice assumptions.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const ORIGIN='https://mrxpanel.com';
function attrs(tag){
 const out=Object.create(null);
 for(const m of tag.matchAll(/([a-zA-Z_:][a-zA-Z0-9_:.-]*)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>"']+))/g)){
  const name=m[1].toLowerCase();
  assert.ok(!Object.hasOwn(out,name),'duplicate HTML attribute '+name);
  out[name]=m[2]??m[3]??m[4];
 }
 return out;
}
function elements(html,tag){
 return [...html.matchAll(new RegExp('<'+tag+'\\b[^>]*>','gi'))].map(m=>attrs(m[0]));
}
function date(s){
 return /^\d{4}-\d{2}-\d{2}$/.test(s||'') &&
  !Number.isNaN(Date.parse(s+'T00:00:00Z')) &&
  new Date(s+'T00:00:00Z').toISOString().slice(0,10)===s;
}
function read(rootPath,relative,overrides){
 const override=overrides.get(relative);
 return override===undefined?fs.readFileSync(path.join(rootPath,relative),'utf8'):override;
}
function verifyPublishingBoundary(overrides=new Map()){
 assert.ok(!fs.existsSync(path.join(root,'.nojekyll')),'GitHub Pages Jekyll must not be disabled');
 const cfg=read(root,'_config.yml',overrides);
 assert.match(cfg,/^exclude:\s*$/m,'missing explicit Jekyll exclude configuration');
 const excluded=new Set([...cfg.matchAll(/^\s+-\s+([A-Za-z0-9._/-]+)\s*$/gm)].map(m=>m[1]));
 for(const folder of ['qa','review','scripts']){
  assert.ok(excluded.has(folder),'GitHub Pages excludes missing internal folder: '+folder);
  assert.ok(fs.statSync(path.join(root,folder)).isDirectory(),'expected internal directory: '+folder);
 }
 return {excludedInternalFolders:3};
}
function targetFile(url){
 if(url.protocol!=='https:'||url.host!=='mrxpanel.com'||url.search||url.hash)throw Error('non-canonical sitemap URL: '+url);
 const pathname=decodeURIComponent(url.pathname);
 if(!pathname.startsWith('/')||!pathname.endsWith('/')||pathname.includes('..'))throw Error('unsafe sitemap route: '+pathname);
 return pathname.slice(1)+'index.html';
}
function hasLocalFile(relative){
 const f=path.resolve(root,relative);
 assert.ok(f.startsWith(root+path.sep),'local path escaped repository');
 return fs.existsSync(f)&&fs.statSync(f).isFile();
}
function analyze(overrides=new Map()){
 const publishing=verifyPublishingBoundary(overrides);
 const map=read(root,'sitemap.xml',overrides);
 const matches=[...map.matchAll(/<url>\s*<loc>([^<]+)<\/loc>\s*<lastmod>([^<]+)<\/lastmod>\s*<\/url>/gi)];
 assert.ok(matches.length>=7,'fewer than 7 existing SEO routes in sitemap');
 const routes=new Map();
 for(const match of matches){
  const url=new URL(match[1]);
  const file=targetFile(url);
  assert.ok(!routes.has(url.pathname),'duplicate sitemap route: '+url.pathname);
  assert.ok(date(match[2]),'invalid lastmod: '+url.pathname);
  routes.set(url.pathname,{url:url.href,file,lastmod:match[2]});
 }
 const graph=new Map();
 let anchorCount=0,imageCount=0,articleCount=0;
 for(const [route,entry] of routes){
  const html=read(root,entry.file,overrides);
  const linkTags=elements(html,'link');
  const canonicals=linkTags.filter(a=>String(a.rel||'').toLowerCase().split(/\s+/).includes('canonical'));
  assert.equal(canonicals.length,1,route+' canonical count');
  assert.equal(canonicals[0].href,entry.url,route+' canonical mismatch');
  const meta=elements(html,'meta');
  const select=(key,value)=>meta.filter(a=>String(a[key]||'').toLowerCase()===value);
  const robots=select('name','robots');
  assert.equal(robots.length,1,route+' robots count');
  const directives=String(robots[0].content||'').toLowerCase().split(/[,\s]+/);
  assert.ok(directives.includes('index')&&!directives.includes('noindex'),route+' not indexable');
  const og=select('property','og:url');
  assert.equal(og.length,1,route+' OG URL count');
  assert.equal(og[0].content,entry.url,route+' OG URL mismatch');
  assert.match(html,/<h1\b/i,route+' missing H1');
  const schemas=[...html.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)]
   .map(m=>JSON.parse(m[1])).filter(x=>x&&x['@type']==='Article');
  assert.ok(schemas.length<=1,route+' duplicate Article schemas');
  if(schemas.length){
   const article=schemas[0];articleCount++;
   assert.ok(date(article.datePublished)&&date(article.dateModified),route+' Article date invalid');
   assert.ok(article.datePublished<=article.dateModified,route+' modified predates publication');
   assert.ok(article.dateModified<=entry.lastmod,route+' sitemap lastmod older than modified Article');
  }
  for(const m of meta){
   const key=String(m.property||m.name||'').toLowerCase();
   if(key==='og:image'||key==='og:image:secure_url'||key==='twitter:image'){
    imageCount++;
    let url;try{url=new URL(String(m.content||''),ORIGIN+route)}catch{throw Error(route+' malformed image URL')}
    assert.ok(url.protocol==='https:',route+' image must use HTTPS');
    if(url.hostname==='mrxpanel.com'){
     const asset=decodeURIComponent(url.pathname).replace(/^\/+/,'');
     assert.ok(hasLocalFile(asset),route+' image points to missing local asset: '+asset);
    }
   }
  }
  const links=elements(html,'a');
  const adjacent=[];
  for(const a of links){
   if(!a.href)continue;
   anchorCount++;
   if(/^(mailto:|tel:|javascript:|data:)/i.test(a.href))continue;
   let url;try{url=new URL(a.href,ORIGIN+route)}catch{throw Error(route+' invalid href')}
   if(!['http:','https:'].includes(url.protocol))continue;
   if(url.hostname==='mrxpanel.com'||url.hostname==='www.mrxpanel.com'){
    const local=decodeURIComponent(url.pathname).replace(/^\/+/,'');
    const dest=local+(url.pathname.endsWith('/')?'index.html':'');
    assert.ok(hasLocalFile(dest)||hasLocalFile(local+'/index.html'),route+' broken internal link: '+a.href);
    adjacent.push(url.pathname);
   }
  }
  graph.set(route,adjacent);
 }
 const reachable=new Set(['/']),stack=['/'];
 while(stack.length){
  const p=stack.pop();
  for(const target of graph.get(p)||[])if(routes.has(target)&&!reachable.has(target)){
   reachable.add(target);stack.push(target);
  }
 }
 assert.equal(reachable.size,routes.size,'SEO sitemap route not reachable from home');
 const favicon=path.join(root,'favicon.ico');
 if(fs.existsSync(favicon)){
  const b=fs.readFileSync(favicon);
  assert.ok(b.length>=22&&b[0]===0&&b[1]===0&&b[2]===1&&b[3]===0,'invalid ICO signature');
 }
 return {sitemapRoutes:routes.size,articleSchemas:articleCount,linksChecked:anchorCount,
  metadataImagesChecked:imageCount,reachableSeoRoutes:reachable.size,
  excludedInternalFolders:publishing.excludedInternalFolders,networkCalls:0,filesWritten:0};
}
try{
 const report=analyze();
 if(process.argv.includes('--self-test')){
  const index=fs.readFileSync(path.join(root,'index.html'),'utf8');
  const canonical='<link rel="canonical" href="https://mrxpanel.com/">';
  assert.ok(index.includes(canonical),'baseline canonical fixture changed');
  assert.throws(()=>analyze(new Map([['index.html',index.replace(canonical,
   '<link rel="canonical" href="https://example.invalid/">')]])),/canonical mismatch/);
  assert.throws(()=>analyze(new Map([['index.html',index.replace('</head>',
   '<meta property="og:image" content="https://mrxpanel.com/assets/not-yet-present.png"></head>')]])),
   /image points to missing local asset/);
  assert.throws(()=>analyze(new Map([['sitemap.xml',
   fs.readFileSync(path.join(root,'sitemap.xml'),'utf8').replace('<lastmod>2026-10-24</lastmod>',
   '<lastmod>2026-02-30</lastmod>')]])),/invalid lastmod/);
  const cfg=fs.readFileSync(path.join(root,'_config.yml'),'utf8');
  assert.ok(cfg.includes('  - review\n'),'expected Jekyll publishing exclusion fixture');
  assert.throws(()=>analyze(new Map([['_config.yml',cfg.replace('  - review\n','')]])),
   /excludes missing internal folder: review/);
  console.log('MAIN_SAFETY_BASELINE_NEGATIVE_PASS=4/4');
 }
 console.log('MAIN_SAFETY_BASELINE_PASS='+JSON.stringify(report));
}catch(e){console.error('MAIN_SAFETY_BASELINE_FAIL|'+e.message);process.exitCode=2}
