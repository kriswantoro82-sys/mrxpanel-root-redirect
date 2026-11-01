'use strict';
// Read-only, offline QA of the single homepage footer disclosure.
// No network requests, credentials, mutation, or production deployment.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const orgs = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi)]
  .map(match => JSON.parse(match[1]))
  .filter(x => x['@type'] === 'Organization');
assert.equal(orgs.length, 1, 'Exactly one Organization JSON-LD required');
const legalName = orgs[0].legalName;
assert.equal(legalName, 'PT Mrxpanel Media Group', 'Unexpected legalName');
assert.equal(orgs[0].url, 'https://mrxpanel.com/');
assert.equal(orgs[0].name, 'MRXPANEL');

const footers = [...html.matchAll(/<footer\s+class="footer">([\s\S]*?)<\/footer>/gi)];
assert.equal(footers.length, 1, 'Missing/duplicate homepage footer');
const footer = footers[0][1];
const aboutBlocks = [...footer.matchAll(/<p\s+class="footer-about">([\s\S]*?)<\/p>/gi)];
assert.equal(aboutBlocks.length, 1, 'Missing/duplicate footer description');
const paragraph = aboutBlocks[0][1];
assert.match(paragraph, /MRXPANEL dikelola oleh\s*<strong>PT Mrxpanel Media Group<\/strong>\s*\./,
  'Legal operator not visibly rendered in the description');
assert.equal((paragraph.match(/PT Mrxpanel Media Group/g) || []).length, 1);
assert.ok(!/display\s*:\s*none|aria-hidden\s*=\s*["']true["']/i.test(paragraph),
  'Legal operator must not be hidden');
for (const dest of ['/signin/', '/signup/', '/panduan-reseller/', '/cara-menggunakan-panel-smm/']) {
  assert.ok(footer.includes('href="'+dest+'"'), 'Footer navigation missing '+dest);
}
assert.ok(footer.includes('© 2026 MRXPANEL.'), 'Copyright line lost');
assert.match(html, /<link rel="canonical" href="https:\/\/mrxpanel\.com\/">/);
assert.match(html, /<meta name="robots" content="index,follow">/);
assert.match(html, /<h1\b/, 'Homepage H1 missing');
assert.match(html, /mrxpanel-tracker\.mrxpanel01\.workers\.dev\/tracker-v1\.js/,
  'Existing analytics tag unexpectedly missing');
console.log('HOMEPAGE_LEGAL_IDENTITY_QA_PASS|JSONLD=1|FOOTER=1|NAVIGATION=1');
