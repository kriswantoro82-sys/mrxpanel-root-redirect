'use strict';
// Static review-only QA: never navigates, sends analytics, or calls a website.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const html=fs.readFileSync(path.join(__dirname,'..','signup','index.html'),'utf8');
const scripts=[...html.matchAll(/<script\b[^>]*id="signup-utm-bridge"[^>]*>([\s\S]*?)<\/script>/gi)];
assert.equal(scripts.length,1,'Exactly one reviewed redirect script must exist');
const source=scripts[0][1];
new vm.Script(source,{filename:'signup-utm-bridge.js'});
assert.match(html,/<meta\s+http-equiv="refresh"\s+content="3; url=https:\/\/member\.mrxpanel\.com\/">/);
assert.match(html,/<a\s+id="member-area-link"\s+href="https:\/\/member\.mrxpanel\.com\/">/);
assert.match(html,/<meta\s+name="robots"\s+content="noindex,follow">/);
assert.doesNotMatch(html,/\?auth=register/);
assert.doesNotMatch(source,/\b(?:fetch|XMLHttpRequest|navigator\.sendBeacon|localStorage|sessionStorage|document\.cookie)\b/);
function bridge(query) {
  let redirect=null;
  const fallback={href:'https://member.mrxpanel.com/'};
  vm.runInNewContext(source,{
    URL,URLSearchParams,
    window:{location:{search:query,replace(u){redirect=u;}}},
    document:{getElementById(id){assert.equal(id,'member-area-link');return fallback;}}
  },{timeout:1000});
  assert.equal(redirect,fallback.href,'Fallback link must match immediate redirect');
  const dst=new URL(redirect);
  assert.equal(dst.origin,'https://member.mrxpanel.com','Destination origin pinned');
  assert.equal(dst.pathname,'/','Destination path pinned');
  assert.equal(dst.hash,'','Do not propagate URL fragment');
  return dst.href;
}
const cases=[
 ['no query','', 'https://member.mrxpanel.com/'],
 ['single campaign','?utm_campaign=mr_reseller_organic_v1','https://member.mrxpanel.com/?utm_campaign=mr_reseller_organic_v1'],
 ['all approved fields','?utm_content=header&utm_campaign=wabiz_v1&utm_source=whatsapp_business&utm_medium=organic_social','https://member.mrxpanel.com/?utm_source=whatsapp_business&utm_medium=organic_social&utm_campaign=wabiz_v1&utm_content=header'],
 ['utm source domain','?utm_source=chatgpt.com','https://member.mrxpanel.com/?utm_source=chatgpt.com'],
 ['unknown key ignored','?promo=anything&utm_campaign=abc','https://member.mrxpanel.com/?utm_campaign=abc'],
 ['auth override ignored','?auth=register&next=https%3A%2F%2Fevil.example','https://member.mrxpanel.com/'],
 ['redirect override ignored','?redirect=https%3A%2F%2Fevil.example','https://member.mrxpanel.com/'],
 ['UTM term ignored','?utm_term=sensitive%40example.com','https://member.mrxpanel.com/'],
 ['ad tracking ID ignored','?gclid=123&utm_campaign=abc','https://member.mrxpanel.com/?utm_campaign=abc'],
 ['duplicate UTM ignored','?utm_source=a&utm_source=b&utm_campaign=abc','https://member.mrxpanel.com/?utm_campaign=abc'],
 ['empty value ignored','?utm_source=&utm_campaign=abc','https://member.mrxpanel.com/?utm_campaign=abc'],
 ['spaces ignored','?utm_campaign=ad+test','https://member.mrxpanel.com/'],
 ['slash ignored','?utm_campaign=x%2Fy','https://member.mrxpanel.com/'],
 ['query attempt ignored','?utm_campaign=https%3A%2F%2Fevil.example','https://member.mrxpanel.com/'],
 ['ASCII maximum accepted','?utm_content='+('a'.repeat(128)),'https://member.mrxpanel.com/?utm_content='+('a'.repeat(128))],
 ['oversized value ignored','?utm_content='+('a'.repeat(129)),'https://member.mrxpanel.com/'],
 ['unicode rejected','?utm_campaign=promosi%C3%A9','https://member.mrxpanel.com/'],
 ['leading underscore rejected','?utm_source=_foo','https://member.mrxpanel.com/'],
 ['encoded dot accepted','?utm_source=chatgpt%2Ecom','https://member.mrxpanel.com/?utm_source=chatgpt.com'],
 ['mixed case values preserved','?utm_source=WhatsApp&utm_medium=Organic','https://member.mrxpanel.com/?utm_source=WhatsApp&utm_medium=Organic'],
 ['raw hash not present in search','?utm_campaign=abc','https://member.mrxpanel.com/?utm_campaign=abc'],
 ['script injection rejected','?utm_source=%3Cscript%3E','https://member.mrxpanel.com/']
];
for(const [title,q,expected] of cases){assert.equal(bridge(q),expected,title);}
console.log('SIGNUP_UTM_BRIDGE_STATIC_QA_PASS='+cases.length+'/'+cases.length);
console.log('PRODUCTION_MUTATIONS=NONE|UNSUPPORTED_AUTH_DEEPLINK=NOT_USED');
