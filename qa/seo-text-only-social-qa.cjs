'use strict';
// Review-only, fail-closed checks. No network, Git mutation, deployment or indexing.
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
function attrs(tag) {
  const result = Object.create(null);
  const attribute = /([a-z_:][a-z0-9_:.-]*)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>"']+))/gi;
  for (const m of tag.matchAll(attribute)) {
    const key = m[1].toLowerCase();
    assert.equal(Object.hasOwn(result, key), false, 'duplicate HTML attribute: ' + key);
    result[key] = m[2] ?? m[3] ?? m[4];
  }
  return result;
}
const tags = (html, name) =>
  [...html.matchAll(new RegExp('<' + name + '\\b[^>]*>', 'gi'))].map(m => attrs(m[0]));
function oneMeta(meta, kind, key, value, route) {
  const found = meta.filter(a => String(a[kind] || '').toLowerCase() === key);
  assert.equal(found.length, 1, route + ' expected exactly one ' + key);
  if (value !== null) assert.equal(found[0].content, value, route + ' wrong ' + key);
}
function verify(html, route) {
  const expected = 'https://mrxpanel.com' + route;
  const links = tags(html, 'link');
  const canonicals = links.filter(a => String(a.rel || '').toLowerCase() === 'canonical');
  assert.equal(canonicals.length, 1, route + ' must have one canonical');
  assert.equal(canonicals[0].href, expected, route + ' canonical mismatch');
  const meta = tags(html, 'meta');
  oneMeta(meta, 'property', 'og:url', expected, route);
  oneMeta(meta, 'property', 'og:title', null, route);
  oneMeta(meta, 'property', 'og:description', null, route);
  oneMeta(meta, 'name', 'twitter:card', 'summary', route);
  oneMeta(meta, 'name', 'robots', 'index,follow', route);
  for (const item of meta) {
    const key = String(item.property || item.name || '').toLowerCase();
    assert.ok(!/^og:image(?::|$)/.test(key) && !/^twitter:image(?::|$)/.test(key),
      route + ' unapproved image metadata: ' + key);
  }
  assert.ok(!html.includes('mrxpanel-og-1200x630.png'),
    route + ' stale image URL');
  assert.match(html, /<h1\b/i, route + ' must have an H1');
}
for (const [route, file] of files) {
  verify(fs.readFileSync(path.join(root, file), 'utf8'), route);
  console.log('TEXT_ONLY_SOCIAL_QA_PASS|' + route);
}
const home = fs.readFileSync(path.join(root,'index.html'), 'utf8');
const marker = '<meta name="twitter:card" content="summary">';
assert.ok(home.includes(marker), 'test fixture marker not present');
const fixtures = [
  ['image injected property first', home.replace(marker,
    '<meta property="og:image" content="https://example.invalid/pic.png">\n' + marker)],
  ['image injected content first', home.replace(marker,
    '<meta content="https://example.invalid/pic.png" property="og:image">\n' + marker)],
  ['single-quoted Twitter image', home.replace(marker,
    "<meta content='https://example.invalid/pic.png' name='twitter:image'>\n" + marker)],
  ['unquoted OG image variant', home.replace(marker,
    '<meta content=https://example.invalid/pic.png property=og:image:url>\n' + marker)],
  ['wrong canonical', home.replace('href="https://mrxpanel.com/"',
    'href="https://example.invalid/"')],
  ['wrong OG URL', home.replace('content="https://mrxpanel.com/"',
    'content="https://example.invalid/"')],
  ['oversized Twitter card', home.replace(marker,
    '<meta name="twitter:card" content="summary_large_image">')],
  ['duplicate Twitter card', home.replace(marker, marker + '\n' + marker)]
];
for (const [label, fixture] of fixtures) {
  assert.throws(() => verify(fixture, '/'), undefined, label + ' must be rejected');
  console.log('TEXT_ONLY_NEGATIVE_QA_PASS|' + label);
}
assert.ok(!fs.existsSync(path.join(root, 'assets/mrxpanel-og-1200x630.png')),
  'unapproved media asset must stay outside candidate');
console.log('SEO_TEXT_ONLY_QA_PASS|PAGES=7|NEGATIVE=8|NO_NETWORK_OR_DEPLOY');
