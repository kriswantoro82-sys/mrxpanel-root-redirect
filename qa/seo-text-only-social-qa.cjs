'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const files = [
  ['/', 'index.html'], ['/panduan-reseller/', 'panduan-reseller/index.html'],
  ['/cara-menggunakan-panel-smm/', 'cara-menggunakan-panel-smm/index.html'],
  ['/memilih-provider-smm/', 'memilih-provider-smm/index.html'],
  ['/apa-itu-panel-smm/', 'apa-itu-panel-smm/index.html'],
  ['/api-panel-smm-reseller/', 'api-panel-smm-reseller/index.html'],
  ['/kalkulator-harga-jual-reseller-smm/', 'kalkulator-harga-jual-reseller-smm/index.html']
];
function verify(html, route) {
  const canonical = 'https://mrxpanel.com' + route;
  const canonicalTags = [...html.matchAll(/<link\s+[^>]*rel="canonical"[^>]*>/gi)];
  assert.equal(canonicalTags.length,1,route+' canonical count');
  assert.equal(canonicalTags[0][0].match(/\bhref="([^"]+)"/)?.[1], canonical,route+' canonical URL');
  assert.equal([...html.matchAll(/<meta\s+property="og:title"[^>]*>/g)].length,1,route+' OG title');
  assert.equal([...html.matchAll(/<meta\s+property="og:description"[^>]*>/g)].length,1,route+' OG description');
  assert.equal([...html.matchAll(/<meta\s+name="twitter:card" content="summary"\s*\/?>/g)].length,1,route+' small Twitter card');
  assert.equal([...html.matchAll(/<meta\s+(?:property="og:image(?:[^"]*)"|name="twitter:image")[^>]*>/gi)].length,0,route+' must not reference absent image');
  assert.ok(!html.includes('mrxpanel-og-1200x630.png'),route+' missing image URL must not leak');
  assert.equal([...html.matchAll(/<meta\s+name="robots" content="index,follow"\s*\/?>/g)].length,1,route+' robots');
  assert.ok(/<h1\b/i.test(html),route+' H1');
}
for (const [route,file] of files) {
  verify(fs.readFileSync(path.join(root,file),'utf8'),route);
  console.log('TEXT_ONLY_SOCIAL_QA_PASS|' + route);
}
const home = fs.readFileSync(path.join(root,files[0][1]),'utf8');
for (const [name,body] of [
  ['image reinjection',home.replace('<meta name="twitter:card" content="summary">','<meta property="og:image" content="https://mrxpanel.com/missing.png">\n<meta name="twitter:card" content="summary">')],
  ['wrong canonical',home.replace('href="https://mrxpanel.com/"','href="https://example.invalid/"')],
  ['oversized Twitter card',home.replace('<meta name="twitter:card" content="summary">','<meta name="twitter:card" content="summary_large_image">')]
]) {
  assert.throws(()=>verify(body,'/'),undefined,name+' must fail');
  console.log('TEXT_ONLY_NEGATIVE_PASS|' + name);
}
assert.ok(!fs.existsSync(path.join(root,'assets/mrxpanel-og-1200x630.png')),'unapproved OG asset appeared');
console.log('SEO_TEXT_ONLY_QA_PASS|PAGES=7|NEGATIVE=3|NO_PRODUCTION_MUTATION');
