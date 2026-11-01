'use strict';
/**
 * Read-only QA for legacy MRXPANEL login/register bridges.
 * The landing site must not impersonate Member Web or index duplicate auth pages.
 */
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const ROOT = path.resolve(__dirname, '..');
const memberRoot = 'https://member.mrxpanel.com/';
const registerUrl = 'https://member.mrxpanel.com/?auth=register';
for (const route of ['auth/login', 'auth/register']) {
  const html = fs.readFileSync(path.join(ROOT, route, 'index.html'), 'utf8');
  const destination = route === 'auth/register' ? registerUrl : memberRoot;
  assert.match(html, /<html lang="id">/, route + ': lang id');
  assert.equal((html.match(/<meta name="robots" content="noindex,follow">/g) || []).length, 1,
    route + ': exactly one noindex,follow tag');
  assert.ok(html.includes('<meta http-equiv="refresh" content="0; url=' + destination + '">'),
    route + ': point to the approved Member Area destination');
  assert.ok(html.includes('<a href="' + destination + '">'), route + ': fallback link');
  if (route === 'auth/login') {
    assert.ok(!html.includes(registerUrl), route + ': login bridge must not become signup');
  } else {
    assert.ok(html.includes(registerUrl), route + ': direct registration must be available');
  }
  assert.ok(!/<form\b|type=["']password["']/i.test(html),
    route + ': no fake login/register form');
  console.log('PASS ' + route + ': noindex, existing redirect, fallback, no auth form');
}
console.log('LEGACY_AUTH_BRIDGES_QA_PASS|PAGES=2|NOINDEX=2|DEPLOY=NONE');
