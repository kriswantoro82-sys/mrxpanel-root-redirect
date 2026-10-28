'use strict';
// Offline, isolated Chromium journey: homepage -> signup bridge -> mocked Member Area.
// No external requests ever reach production, including analytics/tracker.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const http=require('node:http');
const path=require('node:path');
const {chromium}=require('playwright');
const home=fs.readFileSync(path.resolve(__dirname,'../index.html'),'utf8');
const signup=fs.readFileSync(path.resolve(__dirname,'../signup/index.html'),'utf8');
const server=http.createServer((req,res)=>{
  const url=new URL(req.url,'http://localhost');
  const html=url.pathname==='/'?home:url.pathname==='/signup/'?signup:null;
  res.writeHead(html?200:404,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'});
  res.end(html||'NOT_FOUND');
});
async function listen(){await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));}
async function close(){await new Promise(resolve=>server.close(resolve));}
(async()=>{
 await listen();
 const port=server.address().port;
 let browser;
 try{
  browser=await chromium.launch({headless:true});
  const cases=[
   {name:'whatsapp_utm_end_to_end',js:true,query:'?utm_source=whatsapp_business&utm_medium=organic_social&utm_campaign=mr_reseller_organic_v1&utm_content=hero',expectQuery:'?utm_source=whatsapp_business&utm_medium=organic_social&utm_campaign=mr_reseller_organic_v1&utm_content=hero'},
   {name:'duplicate_and_external_redirect_rejected',js:true,query:'?utm_source=a&utm_source=b&utm_campaign=abc&redirect=https%3A%2F%2Fevil.example',expectQuery:'?utm_campaign=abc'},
   {name:'unapproved_campaign_fields_rejected',js:true,query:'?utm_source=chatgpt.com&utm_term=private%40example.com&gclid=123',expectQuery:'?utm_source=chatgpt.com'},
   {name:'invalid_values_not_forwarded',js:true,query:'?utm_campaign=foo%2Fbar&auth=register',expectQuery:''},
   {name:'no_campaign_remains_clean',js:true,query:'',expectQuery:''},
   {name:'javascript_disabled_safe_fallback',js:false,query:'?utm_source=whatsapp_business&utm_campaign=test',expectQuery:''}
  ];
  for(const item of cases){
   const context=await browser.newContext({javaScriptEnabled:item.js,serviceWorkers:'block'});
   let outgoingToReal=0, memberRequests=0;
   await context.route('**/*',route=>{
    const uri=new URL(route.request().url());
    if(uri.hostname==='127.0.0.1' && uri.port===String(port)) return route.continue();
    if(uri.origin==='https://member.mrxpanel.com'){
     memberRequests++;
     return route.fulfill({status:200,contentType:'text/html',body:'<!doctype html><title>ISOLATED_MEMBER_MOCK</title>'});
    }
    outgoingToReal++;
    return route.fulfill({status:200,contentType:'application/javascript',body:''});
   });
   const page=await context.newPage();
   await page.goto('http://127.0.0.1:'+port+'/'+item.query,{waitUntil:'domcontentloaded',timeout:12000});
   const destinations=await page.locator('a[href^="/signup/"]').evaluateAll(nodes=>nodes.map(a=>a.getAttribute('href')));
   assert.equal(destinations.length,5,item.name+': five signup CTA anchors expected');
   const expectedLanding='/signup/'+(item.js?item.expectQuery:'');
   assert.ok(destinations.every(x=>x===expectedLanding),item.name+': all CTAs match '+JSON.stringify(destinations));
   await page.locator('a[href^="/signup/"]').first().evaluate(a=>a.click());
   await page.waitForURL(u=>u.origin==='https://member.mrxpanel.com',{timeout:11000});
   assert.equal(page.url(),'https://member.mrxpanel.com/'+(item.js?item.expectQuery:''),item.name+': destination');
   assert.equal(await page.title(),'ISOLATED_MEMBER_MOCK',item.name+': mock loaded');
   assert.equal(memberRequests,1,item.name+': one Member navigation');
   await context.close();
   console.log('HOME_SIGNUP_MEMBER_CASE_PASS='+item.name+'|EXTERNAL_REQUESTS_INTERCEPTED='+outgoingToReal);
  }
  console.log('HOME_SIGNUP_MEMBER_ISOLATED_QA_PASS='+cases.length+'/'+cases.length+'|REAL_MEMBER_REQUESTS=0');
 }finally{if(browser)await browser.close();await close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
