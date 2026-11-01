'use strict';
const fs = require('node:fs');
const assert = require('node:assert/strict');

const DEFAULT = 'api-panel-smm-reseller/index.html';
function failures(html) {
  const issues = [];
  const link = '<a href="/kalkulator-harga-jual-reseller-smm/">kalkulator harga jual dan laba bersih reseller</a>';
  const count = (s, pattern) => [...s.matchAll(pattern)].length;
  if (count(html, /href="\/kalkulator-harga-jual-reseller-smm\/"/g) !== 1) issues.push('calculator link count must equal one');
  if (!html.includes(link)) issues.push('descriptive crawlable anchor not found');
  if (count(html, /<link rel="canonical"/g) !== 1 || !html.includes('<link rel="canonical" href="https://mrxpanel.com/api-panel-smm-reseller/">')) issues.push('canonical mismatch');
  if (count(html, /<meta name="robots"/g) !== 1 || !html.includes('<meta name="robots" content="index,follow">')) issues.push('robots mismatch');
  if (!html.includes('hasilnya bukan harga resmi katalog') && !html.includes('sebagai simulasi; sinkronkan harga aktual melalui katalog API resmi')) issues.push('pricing disclaimer missing');
  if (!html.includes('<h1>API Panel SMM untuk Reseller: Cara Integrasi Website dengan Aman</h1>')) issues.push('H1 changed');
  if (!html.includes('https://mrxpanel-tracker.mrxpanel01.workers.dev/tracker-v1.js')) issues.push('analytics source disappeared');
  return issues;
}
const html = fs.readFileSync(process.argv[2] || DEFAULT,'utf8');
const errors = failures(html);
assert.deepEqual(errors, [], 'Candidate HTML must preserve safety and SEO contracts');
const badLink = html.replace('href="/kalkulator-harga-jual-reseller-smm/"','href="/kalkulator-rusak/"');
assert(failures(badLink).length > 0, 'Negative test: broken link must fail');
const badCanonical = html.replace('href="https://mrxpanel.com/api-panel-smm-reseller/"','href="https://invalid.example/"');
assert(failures(badCanonical).length > 0, 'Negative test: wrong canonical must fail');
const badDisclaimer = html.replace('sebagai simulasi; sinkronkan harga aktual melalui katalog API resmi', 'untung pasti tanpa biaya');
assert(failures(badDisclaimer).length > 0, 'Negative test: missing disclaimer must fail');
console.log('PASS: static SEO contract and 3 negative tests, no browser/network/deploy');