'use strict';
// CI-only isolated Chromium behavior test for static signup redirect.
// All member.mrxpanel.com requests are intercepted, never sent to production.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const {chromium} = require('playwright');

const html = fs.readFileSync(path.resolve(__dirname, '../signup/index.html'), 'utf8');
const server = http.createServer((req,res) => {
  if (!req.url.startsWith('/signup/')) {res.writeHead(404);res.end();return;}
  res.writeHead(200, {'Content-Type':'text/html; charset=utf-8', 'Cache-Control':'no-store'});
  res.end(html);
});
const bind=()=>new Promise((resolve,reject)=>server.listen(0,'127.0.0.1',err=>err?reject(err):resolve()));
const close=()=>new Promise(resolve=>server.close(resolve));

(async()=>{
  await bind();
  const port=server.address().port;
  let browser;
  try {
    browser=await chromium.launch({headless:true});
    const cases=[
      {name:'valid_campaign_labels_js',js:true,query:'?utm_source=whatsapp_business&utm_medium=organic_social&utm_campaign=mr_reseller_organic_v1&utm_content=hero',expected:'https://member.mrxpanel.com/?utm_source=whatsapp_business&utm_medium=organic_social&utm_campaign=mr_reseller_organic_v1&utm_content=hero'},
      {name:'unknown_and_redirect_override_js',js:true,query:'?redirect=https%3A%2F%2Fevil.example&utm_source=chatgpt.com&token=private',expected:'https://member.mrxpanel.com/?utm_source=chatgpt.com'},
      {name:'duplicate_campaign_rejected_js',js:true,query:'?utm_source=x&utm_source=y&utm_campaign=clean',expected:'https://member.mrxpanel.com/?utm_campaign=clean'},
      {name:'invalid_campaign_rejected_js',js:true,query:'?utm_campaign=foo%2Fbar&next=https%3A%2F%2Fevil.example',expected:'https://member.mrxpanel.com/'},
      {name:'javascript_disabled_fixed_origin_fallback',js:false,query:'?utm_source=whatsapp_business&utm_campaign=campaign1&redirect=evil.example',expected:'https://member.mrxpanel.com/'}
    ];
    for(const testCase of cases){
      const context=await browser.newContext({javaScriptEnabled:testCase.js,serviceWorkers:'block'});
      let memberRequests=0, unauthorizedHosts=0;
      await context.route('**/*', async route=>{
        const url=new URL(route.request().url());
        if(url.hostname==='127.0.0.1' && url.port===String(port)) {
          return route.continue();
        }
        if(url.origin==='https://member.mrxpanel.com'){
          memberRequests++;
          return route.fulfill({status:200,contentType:'text/html',body:'<!doctype html><title>Isolated Member Stub</title><p>MOCK ONLY</p>'});
        }
        unauthorizedHosts++;
        return route.abort();
      });
      const page=await context.newPage();
      const url='http://127.0.0.1:'+port+'/signup/'+testCase.query;
      try {await page.goto(url,{waitUntil:'commit',timeout:9000});}
      catch(e) {if(!String(e.message).includes('ERR_ABORTED')) throw e;}
      await page.waitForURL(u=>u.origin==='https://member.mrxpanel.com',{timeout:10000});
      assert.equal(page.url(),testCase.expected,testCase.name+': redirect URL');
      assert.equal(await page.title(),'Isolated Member Stub',testCase.name+': mock response loaded');
      assert.equal(memberRequests,1,testCase.name+': exactly one Member navigation');
      assert.equal(unauthorizedHosts,0,testCase.name+': no unauthorized host');
      await context.close();
      console.log('SIGNUP_BROWSER_CASE_PASS='+testCase.name);
    }
    console.log('SIGNUP_BROWSER_ISOLATED_QA_PASS='+cases.length+'/'+cases.length+'|REAL_MEMBER_REQUESTS=0');
  } finally {
    if(browser) await browser.close();
    await close();
  }
})().catch(e=>{console.error(e);process.exitCode=1;});
