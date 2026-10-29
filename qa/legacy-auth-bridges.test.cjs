'use strict';
/**
 * Read-only QA for legacy MRXPANEL login/register bridges.
 * The landing site must not impersonate Member Web or index duplicate auth pages.
 */
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const ROOT = path.resolve(__dirname, '..');
const destination = 'https://member.mrxpanel.com/';
for (const route of ['auth/login', 'auth/register']) {
  const html = fs.readFileSync(path.join(ROOT, route, 'index.html'), 'utf8');
  assert.match(html, /<html lang="id">/, route + ': lang id');
  assert.equal((html.match(/<meta name="robots" content="noindex,follow">/g) || []).length, 1,
    route + ': exactly one noindex,follow tag');
  assert.ok(html.includes('<meta http-equiv="refresh" content="0; url=' + destination + '">'),
    route + ': keep existing Member Area redirect');
  assert.ok(html.includes('<a href="' + destination + '">'), route + ': fallback link');
  assert.ok(!/https:\/\/member\.mrxpanel\.com\/\?auth=register/i.test(html),
    route + ': do not redirect to inactive registration deep link');
  assert.ok(!/<form\b|type=["']password["']/i.test(html),
    route + ': no fake login/register form');
  console.log('PASS ' + route + ': noindex, existing redirect, fallback, no auth form');
}
console.log('LEGACY_AUTH_BRIDGES_QA_PASS|PAGES=2|NOINDEX=2|DEPLOY=NONE');
