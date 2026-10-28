'use strict';
// CMO public anonymous, one-navigation-only registration UI observation.
// No filling forms, submit, auth, chat, persistence or mutations.
// Browser blocks every non-GET and all off-origin requests before they reach network.
const {chromium}=require('playwright');
const crypto=require('node:crypto');
const ORIGIN='https://member.mrxpanel.com';

const digest=s=>crypto.createHash('sha256').update(s).digest('hex').slice(0,16);

async function shape(page){
  return await page.evaluate(()=>{
    function visible(el) {
      const st=getComputedStyle(el),r=el.getBoundingClientRect();
      return st.display!=='none'&&st.visibility!=='hidden'&&r.width>0&&r.height>0;
    }
    const ins=Array.from(document.querySelectorAll('input')).filter(visible);
    const forms=Array.from(document.querySelectorAll('form')).filter(visible);
    const content=(document.body?.innerText||'').replace(/\s+/g,' ').trim().toLowerCase().slice(0,3500);
    return {
      inputCount:ins.length,
      passwordCount:ins.filter(x=>x.type==='password').length,
      emailCount:ins.filter(x=>x.type==='email').length,
      visibleForms:forms.length,
      hasPasswordConfirmText:/konfirmasi password|ulangi password|ulang password|confirm password/.test(content),
      hasRegisterText:/daftar akun|buat akun|register|sign up/.test(content),
      hasLoginText:/masuk|login|sign in/.test(content),
      textForDigest:content,
      path:location.pathname,
      queryKeys:[...new URLSearchParams(location.search).keys()].filter(x=>/^[a-z_]{1,40}$/i.test(x)).slice(0,15),
      hashPresent:!!location.hash
    };
  });
}
(async()=>{
 let browser;
 try{
  browser=await chromium.launch({headless:true});
  const ctx=await browser.newContext({
    javaScriptEnabled:true,serviceWorkers:'block',
    storageState:{cookies:[],origins:[]},permissions:[]
  });
  let blockedWrites=0,blockedOffOrigin=0;
  await ctx.route('**/*',route=>{
    let u;
    try {u=new URL(route.request().url());}
    catch {blockedOffOrigin++;return route.abort();}
    if(u.origin!==ORIGIN){blockedOffOrigin++;return route.abort();}
    if(route.request().method()!=='GET'){blockedWrites++;return route.abort();}
    return route.continue();
  });
  const page=await ctx.newPage();
  const nav=await page.goto(ORIGIN+'/',{waitUntil:'domcontentloaded',timeout:15000});
  if(!nav||nav.status()!==200) throw new Error('PUBLIC_ROOT_NOT_HTTP_200');
  await page.waitForTimeout(1600);
  const before=await shape(page);
  const controls=page.locator('button, a, [role="button"]')
    .filter({hasText:/daftar akun baru/i});
  const count=await controls.count();
  const result={schema:'MRXPANEL_ANON_REGISTER_NAVIGATION_READONLY_V1',
    origin:'member.mrxpanel.com',initialHttpStatus:nav.status(),
    matchingControls:count,
    blockedNonGet:0,blockedOffOrigin:0,productionMutations:0};
  if(count!==1){
    console.log(JSON.stringify({...result,status:'HOLD_NOT_EXACTLY_ONE_NAVIGATION_CONTROL',
      before:{...before,textForDigest:undefined,textHash16:digest(before.textForDigest)}}));
    await ctx.close();
    process.exitCode=2;return;
  }
  const target=controls.first();
  const targetInfo=await target.evaluate(el=>({
    tag:el.tagName.toLowerCase(),
    isSubmit:el instanceof HTMLButtonElement && el.type==='submit',
    hrefOrigin:el instanceof HTMLAnchorElement && el.href?new URL(el.href).origin:null
  }));
  if(targetInfo.isSubmit || (targetInfo.hrefOrigin && targetInfo.hrefOrigin!==ORIGIN)) {
    console.log(JSON.stringify({...result,status:'HOLD_UNSAFE_CONTROL',targetInfo}));
    await ctx.close();process.exitCode=2;return;
  }
  await target.click({timeout:5000});
  await page.waitForTimeout(900);
  const after=await shape(page);
  const fingerprintBefore=digest(before.textForDigest);
  const fingerprintAfter=digest(after.textForDigest);
  const uiChanged=fingerprintBefore!==fingerprintAfter || before.inputCount!==after.inputCount || before.passwordCount!==after.passwordCount;
  delete before.textForDigest;delete after.textForDigest;
  console.log(JSON.stringify({...result,
    status:uiChanged?'REGISTER_UI_CHANGED_AFTER_NAVIGATION_ONLY':'HOLD_REGISTER_NAVIGATION_NOT_DISTINGUISHABLE',
    targetInfo,
    before:{...before,textHash16:fingerprintBefore},
    after:{...after,textHash16:fingerprintAfter},
    blockedNonGet:blockedWrites,blockedOffOrigin:blockedOffOrigin,
    safeNavigationClickCount:1,
    accountCreated:false,
    directDeepLinkProof:false,
    releaseApproved:false
  }));
  await ctx.close();
  if(blockedWrites>0) process.exitCode=2;
 }catch(e){
  console.log(JSON.stringify({
    schema:'MRXPANEL_ANON_REGISTER_NAVIGATION_READONLY_V1',
    status:'HOLD_BROWSER_NAVIGATION_PROBE',
    errorType:String(e?.name||'Error').slice(0,30),productionMutations:0
  }));
  process.exitCode=2;
 }finally{if(browser)await browser.close();}
})();
