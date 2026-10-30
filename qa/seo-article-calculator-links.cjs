'use strict';
/** Review-only: audit internal calculator links in two educational articles.
 * No network calls, auth, deploys, or filesystem mutation.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const target='/kalkulator-harga-jual-reseller-smm/';
const html=(p)=>fs.readFileSync(path.join(root,p,'index.html'),'utf8');
const sitemap=fs.readFileSync(path.join(root,'sitemap.xml'),'utf8');
const calc=html('kalkulator-harga-jual-reseller-smm');
assert.match(sitemap,/<loc>https:\/\/mrxpanel\.com\/kalkulator-harga-jual-reseller-smm\/<\/loc>/);
assert.match(calc,/<link rel="canonical" href="https:\/\/mrxpanel\.com\/kalkulator-harga-jual-reseller-smm\/">/);
assert.match(calc,/<meta name="robots" content="index,follow">/);
const pages=[
 {route:'apa-itu-panel-smm',caveat:/hanya simulasi[^<]*periksa harga layanan sebenarnya/i},
 {route:'cara-menggunakan-panel-smm',caveat:/Hasil simulasi bukan pengganti harga aktual di katalog\./i}
];
for(const p of pages){
 const src=html(p.route);
 const count=src.split('href="'+target+'"').length-1;
 assert.equal(count,1,p.route+': exactly one contextual calculator link');
 assert.match(src,p.caveat,p.route+': price caveat');
 assert.match(src,/<meta name="robots" content="index,follow">/);
 assert.match(src,new RegExp('<link rel="canonical" href="https://mrxpanel.com/'+p.route+'/">'));
 assert.match(src,/<h1\b[^>]*>/);
 console.log('PASS '+p.route+' -> calculator; safe price disclaimer');
}
console.log('SEO_CALCULATOR_INTERNAL_LINK_QA_PASS=2/2');
