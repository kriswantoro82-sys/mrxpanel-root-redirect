'use strict';
// Review-only static source tests. No browser network, keys, analytics or signup POST.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const homepage = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const signup = fs.readFileSync(path.join(root, 'signup/index.html'), 'utf8');
const base = 'https://member.mrxpanel.com/?auth=register';

function extract(html, id) {
  const marker = '<script id="' + id + '">';
  const i = html.indexOf(marker);
  assert.ok(i >= 0, 'missing script: ' + id);
  assert.equal(html.indexOf(marker, i + 1), -1, 'duplicate script: ' + id);
  const j = html.indexOf('</script>', i + marker.length);
  assert.ok(j > i, 'unterminated script: ' + id);
  return html.slice(i + marker.length, j);
}
const homepageJs = extract(homepage, 'mrx-homepage-signup-utm-v1');
const bridgeJs = extract(signup, 'signup-utm-direct-register-v1');

function simulateHomepage(query) {
  const links = Array.from({length: 5}, () => ({
    href: '/signup/',
    setAttribute(name, value) { assert.equal(name, 'href'); this.href = value; }
  }));
  const document = {
    querySelectorAll(selector) {
      assert.equal(selector, 'a[href="/signup/"]');
      return links;
    }
  };
  const window = {location: {search: query}};
  vm.runInNewContext(homepageJs, {URLSearchParams, window, document}, {timeout: 1000});
  return links.map(x => x.href);
}
function simulateBridge(query) {
  let manualHref = base, redirected = null;
  const link = {set href(v){manualHref = v;}, get href(){return manualHref;}};
  const window = {location: {search: query, replace(v) {
    assert.equal(redirected, null, 'only one redirect allowed');
    redirected = v;
  }}};
  const document = {getElementById(id) {
    assert.equal(id, 'member-register-link');
    return link;
  }};
  vm.runInNewContext(bridgeJs, {window, document, URL, URLSearchParams}, {timeout: 1000});
  assert.equal(redirected, manualHref, 'manual fallback must match redirect');
  const result = new URL(redirected);
  assert.equal(result.origin, 'https://member.mrxpanel.com');
  assert.equal(result.pathname, '/');
  assert.equal(result.searchParams.get('auth'), 'register');
  assert.deepEqual(
    [...result.searchParams.keys()].filter(key =>
      !['auth','utm_source','utm_medium','utm_campaign','utm_content'].includes(key)),
    [], 'no arbitrary URL parameters'
  );
  return redirected;
}
const cases = [
  ['no_utm', '', ''],
  ['source_only', '?utm_source=google', '?utm_source=google'],
  ['all_four', '?utm_source=google&utm_medium=organic&utm_campaign=api_reseller_2026&utm_content=cta_top', '?utm_source=google&utm_medium=organic&utm_campaign=api_reseller_2026&utm_content=cta_top'],
  ['duplicate_source', '?utm_source=google&utm_source=other&utm_campaign=november', '?utm_campaign=november'],
  ['discard_sensitive', '?utm_source=google&email=x%40example.com&token=secret&session_id=abc&redirect=https%3A%2F%2Fevil.example&gclid=123', '?utm_source=google'],
  ['reject_script', '?utm_source=%3Cscript%3E&utm_medium=cpc', '?utm_medium=cpc'],
  ['reject_space', '?utm_source=google%20ads', ''],
  ['reject_unicode', '?utm_source=caf%C3%A9', ''],
  ['length_128', '?utm_campaign='+'a'.repeat(128), '?utm_campaign='+'a'.repeat(128)],
  ['length_129', '?utm_campaign='+'a'.repeat(129), ''],
  ['dot_allowed', '?utm_source=chatgpt.com', '?utm_source=chatgpt.com'],
  ['auth_override_rejected', '?auth=login&utm_source=google&utm_term=personal_query', '?utm_source=google']
];
assert.equal((homepage.match(/<a\b[^>]*href="\/signup\/"/gi) || []).length, 5, 'exact five existing home CTAs');
assert.equal((homepage.match(/tracker-v1\.js/g) || []).length, 1, 'single unchanged tracker');
assert.ok(signup.includes('<meta name="robots" content="noindex,follow">'), 'signup noindex preserved');
assert.ok(signup.includes('content="3; url=https://member.mrxpanel.com/?auth=register"'), 'fallback host unchanged');
for (const [name, input, expected] of cases) {
  const links = simulateHomepage(input);
  const expectedLink = '/signup/' + expected;
  assert.equal(links.length, 5);
  assert.ok(links.every(x => x === expectedLink), 'homepage ' + name);
  const result = simulateBridge(new URL('https://mrxpanel.com' + expectedLink).search);
  const expectedMember = base + (expected ? '&' + expected.slice(1) : '');
  assert.equal(result, expectedMember, 'member bridge ' + name);
  console.log('PASS homepage+bridge ' + name);
}
console.log('HOMEPAGE_SIGNUP_UTM_REVIEW_PASS 12/12 cases, 60/60 CTA links');
