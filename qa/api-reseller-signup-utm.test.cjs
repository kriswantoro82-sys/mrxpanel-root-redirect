'use strict';
// Review-only Node VM tests; no network, files changed, credentials or analytics.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const article=fs.readFileSync(path.join(root,'api-panel-smm-reseller/index.html'),'utf8');
const signup=fs.readFileSync(path.join(root,'signup/index.html'),'utf8');
const base='https://member.mrxpanel.com/?auth=register';
function inline(h,id){
 const tag='<script id="'+id+'">',i=h.indexOf(tag);
 assert.ok(i>=0,'missing '+id);assert.equal(h.indexOf(tag,i+1),-1,'duplicate '+id);
 const j=h.indexOf('</script>',i+tag.length);assert.ok(j>i);
 return h.slice(i+tag.length,j);
}
const guideJs=inline(article,'api-reseller-signup-utm-v1');
const bridgeJs=inline(signup,'signup-utm-direct-register-v1');
function guide(query){
 let href='/signup/';
 const link={setAttribute(name,value){assert.equal(name,'href');href=value}};
 const doc={querySelector(selector){assert.equal(selector,'a[href="/signup/"]');return link}};
 vm.runInNewContext(guideJs,{URLSearchParams,window:{location:{search:query}},document:doc},{timeout:1000});
 return href;
}
function bridge(query){
 let href=base,redirect=null;
 const link={set href(s){href=s},get href(){return href}};
 const win={location:{search:query,replace(s){assert.equal(redirect,null,'single redirect only');redirect=s}}};
 const doc={getElementById(s){assert.equal(s,'member-register-link');return link}};
 vm.runInNewContext(bridgeJs,{URL,URLSearchParams,window:win,document:doc},{timeout:1000});
 assert.equal(href,redirect,'manual fallback matches JS redirect');
 const dest=new URL(redirect);
 assert.equal(dest.origin,'https://member.mrxpanel.com');
 assert.equal(dest.pathname,'/');
 assert.equal(dest.searchParams.get('auth'),'register');
 assert.deepEqual([...dest.searchParams.keys()].filter(k=>!['auth','utm_source','utm_medium','utm_campaign','utm_content'].includes(k)),[]);
 return redirect;
}
const cases=[
 ['normal','?utm_source=whatsapp_business&utm_medium=organic_social&utm_campaign=mrx_api_reseller_20261105&utm_content=status_panduan_v1','?utm_source=whatsapp_business&utm_medium=organic_social&utm_campaign=mrx_api_reseller_20261105&utm_content=status_panduan_v1'],
 ['none','',''],
 ['campaign_only','?utm_campaign=api_reseller','?utm_campaign=api_reseller'],
 ['duplicate','?utm_source=foo&utm_source=bar&utm_campaign=ok','?utm_campaign=ok'],
 ['external_redirect','?redirect=https%3A%2F%2Fevil.example&auth=login&gclid=123&utm_source=whatsapp_business','?utm_source=whatsapp_business'],
 ['email_block','?utm_campaign=test%40example.invalid',''],
 ['slash_block','?utm_source=foo%2Fbar',''],
 ['space_block','?utm_source=hello%20world',''],
 ['unicode_block','?utm_source=caf%C3%A9',''],
 ['leading_underscore','?utm_source=_bad',''],
 ['max128','?utm_campaign='+('a'.repeat(128)),'?utm_campaign='+('a'.repeat(128))],
 ['over128','?utm_campaign='+('a'.repeat(129)),''],
 ['empty_duplicate','?utm_source=&utm_source=ok',''],
 ['mixed','?utm_medium=organic_social&utm_content=invalid%3Dtag&utm_campaign=ok','?utm_medium=organic_social&utm_campaign=ok']
];
for(const [name,input,expected] of cases){
 const href=guide(input);assert.equal(href,'/signup/'+expected,'landing '+name);
 const out=bridge(new URL('https://mrxpanel.com'+href).search);
 assert.equal(out,base+(expected?'&'+expected.slice(1):''),'member '+name);
 console.log('CASE_PASS '+name);
}
assert.ok(signup.includes('content="3; url=https://member.mrxpanel.com/?auth=register"'),'no-JS fallback');
assert.ok(signup.includes('<a id="member-register-link" href="https://member.mrxpanel.com/?auth=register">'),'manual fallback');
assert.ok(article.includes('<a href="/signup/">Daftar akun MRXPANEL</a>'),'original CTA');
assert.equal(article.split('src="https://mrxpanel-tracker.mrxpanel01.workers.dev/tracker-v1.js"').length-1,1,'tracker unaffected');
console.log('UTM_API_RESELLER_STATIC_PASS '+cases.length+'/'+cases.length);
