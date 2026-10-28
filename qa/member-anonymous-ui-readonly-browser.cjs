'use strict';
// Anonymous public UI observation. No clicks, input, login, registration, or API mutations.
// Off-origin network and all non-GET requests are blocked. Never logs page contents.
const {chromium} = require('playwright');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');
const origin='https://member.mrxpanel.com';
const hash=value=>crypto.createHash('sha256').update(value).digest('hex').slice(0,16);

async function observe(browser, query) {
  const context=await browser.newContext({
    javaScriptEnabled:true, serviceWorkers:'block',
    storageState:{cookies:[],origins:[]},
    permissions:[]
  });
  let blockedNonGet=0, blockedOffOrigin=0;
  await context.route('**/*', route=>{
    let parsed;
    try {parsed=new URL(route.request().url());} catch {
      blockedOffOrigin++;return route.abort();
    }
    if(parsed.origin!==origin){blockedOffOrigin++;return route.abort();}
    if(route.request().method()!=='GET'){blockedNonGet++;return route.abort();}
    if(parsed.username||parsed.password){blockedOffOrigin++;return route.abort();}
    return route.continue();
  });
  const page=await context.newPage();
  try{
    let response;
    try{
      response=await page.goto(origin+'/'+query,{waitUntil:'domcontentloaded',timeout:15000});
    }catch(e){
      return {result:'HOLD_PUBLIC_NAVIGATION_FAILED',errorType:String(e.name||'Error').slice(0,50)};
    }
    if(!response || response.status()!==200) return {
      result:'HOLD_PUBLIC_HTTP_STATUS',httpStatus:response?.status()||null
    };
    await page.waitForTimeout(1900);
    const state=await page.evaluate(()=>{
      const visible=el=>{
        if(!el) return false;
        const s=getComputedStyle(el), box=el.getBoundingClientRect();
        return s.visibility!=='hidden'&&s.display!=='none'&&box.width>0&&box.height>0;
      };
      const inputs=[...document.querySelectorAll('input')].filter(visible);
      const buttons=[...document.querySelectorAll('button,[role=button],input[type=submit]')].filter(visible);
      const btnText=b=>(b.innerText||b.getAttribute('aria-label')||b.value||'').trim().toLowerCase();
      const labels=buttons.map(btnText);
      const body=(document.body?.innerText||'').slice(0,30000).replace(/\s+/g,' ').trim().toLowerCase();
      return {
        path:location.pathname,
        registerQueryRetained:new URLSearchParams(location.search).get('auth')==='register',
        passwordFields:inputs.filter(i=>i.type==='password').length,
        emailFields:inputs.filter(i=>i.type==='email').length,
        visibleInputs:inputs.length,
        visibleForms:[...document.querySelectorAll('form')].filter(visible).length,
        loginActionButtons:labels.filter(v=>/^(masuk|login|sign in)$/.test(v)).length,
        registerActionButtons:labels.filter(v=>/^(daftar|daftar akun|buat akun|register|sign up|buat akun baru)$/.test(v)).length,
        registerLinkButtons:labels.filter(v=>/daftar akun baru|belum punya akun|register/.test(v)).length,
        hasLoginWords:/masuk|login|sign in/.test(body),
        hasRegisterWords:/daftar|register|sign up|buat akun/.test(body),
        visibleUiFingerprint:body.slice(0,3500),
        documentTitlePresent:document.title.length>0
      };
    });
    const fingerprint=hash(state.visibleUiFingerprint);
    delete state.visibleUiFingerprint;
    return {
      result:'PUBLIC_ANON_UI_OBSERVED',
      ...state,
      uiFingerprint16:fingerprint,
      blockedExternalRequests:blockedOffOrigin,
      blockedNonGetRequests:blockedNonGet
    };
  } finally {
    await context.close();
  }
}
(async()=>{
  let browser;
  try {
    browser=await chromium.launch({headless:true});
    const normal=await observe(browser,'');
    const direct=await observe(browser,'?auth=register');
    const bothLoaded=normal.result==='PUBLIC_ANON_UI_OBSERVED'&&direct.result==='PUBLIC_ANON_UI_OBSERVED';
    const sameFeatures=bothLoaded &&
      ['passwordFields','emailFields','visibleInputs','visibleForms','loginActionButtons','registerActionButtons','registerLinkButtons']
      .every(k=>normal[k]===direct[k]);
    const sameText=bothLoaded&&normal.uiFingerprint16===direct.uiFingerprint16;
    const result=bothLoaded?
      ((sameFeatures&&sameText)?'HOLD_DIRECT_REGISTER_NOT_DISTINGUISHABLE':
        'UI_DIFFERENCE_DETECTED_NOT_SIGNUP_PROOF'):
      'HOLD_ANONYMOUS_PUBLIC_UI_NOT_LOADED';
    console.log(JSON.stringify({
      schema:'MRXPANEL_MEMBER_ANON_BROWSER_READONLY_V1',
      mode:'GET_ONLY_OFF_ORIGIN_BLOCKED_NO_FORM_ACTIONS',
      normal,direct,
      sameFeatures:sameFeatures||false,
      sameVisibleTextFingerprint:sameText||false,
      result,
      directRegisterReleaseGate:'HOLD_HUMAN_BROWSER_AND_SOURCE_REVIEW_REQUIRED',
      productionMutations:0
    }));
    if(!bothLoaded) process.exitCode=2;
  } catch(e){
    console.log(JSON.stringify({schema:'MRXPANEL_MEMBER_ANON_BROWSER_READONLY_V1',
      result:'HOLD_PROBE_FAILURE',errorType:String(e?.name||'Error').slice(0,40),
      productionMutations:0}));
    process.exitCode=2;
  } finally {
    if(browser) await browser.close();
  }
})();
